// src/services/tokenStore.ts
const KEY = "access_token";

export function saveToken(token: string, remember: boolean = false) {
  if (remember) {
    localStorage.setItem(KEY, token);
    sessionStorage.removeItem(KEY); // กัน token ค้าง
  } else {
    sessionStorage.setItem(KEY, token);
    localStorage.removeItem(KEY);
  }
}

/** ดึง token ออกมา (เช็คทั้ง localStorage และ sessionStorage) */
export function getToken(): string | null {
  return localStorage.getItem(KEY) || sessionStorage.getItem(KEY);
}

/** ลบ token ออกจากทั้งสอง storage */
export function clearToken() {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
}
