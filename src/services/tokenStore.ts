

export function saveToken(token: string, remember?: boolean) {
  if (remember) localStorage.setItem(KEY, token);
  else sessionStorage.setItem(KEY, token);
}


// ถ้า backend ใช้ HttpOnly cookie (ปลอดภัยกว่า) อาจ “ไม่ต้องมี” tokenStore ได้เลย — เก็บสถานะด้วย cookie ฝั่ง server แทน

// src/services/tokenStore.ts
const KEY = "access_token";

/** เก็บ token ลง storage (จะเลือก localStorage หรือ sessionStorage ก็ได้) */
export function setToken(token: string) {
  localStorage.setItem(KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(KEY);
}

export function clearToken() {
  localStorage.removeItem(KEY);
}
