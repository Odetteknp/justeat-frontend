const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export class HttpError extends Error {
  status: number;
  body?: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

// รวมศูนย์การเรียก API + จัดการ error
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  signal?: AbortSignal
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include", // ถ้าใช้ cookie (เอาออกได้ถ้าใช้ bearer)
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
    signal,
  });

  if (!res.ok) {
    let body: any = null;
    try { body = await res.json(); } catch { /* ignore */ }
    const msg = body?.message || body?.error || `HTTP ${res.status}`;
    throw new HttpError(res.status, msg, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
