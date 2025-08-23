// จัดการ token ตาม remember: sessionStorage (ชั่วคราว) / localStorage (ยาว)
const KEY = "auth_token";

export function saveToken(token: string, remember?: boolean) {
  if (remember) localStorage.setItem(KEY, token);
  else sessionStorage.setItem(KEY, token);
}

export function getToken(): string | null {
  return sessionStorage.getItem(KEY) ?? localStorage.getItem(KEY);
}

export function clearToken() {
  sessionStorage.removeItem(KEY);
  localStorage.removeItem(KEY);
}


// ถ้า backend ใช้ HttpOnly cookie (ปลอดภัยกว่า) อาจ “ไม่ต้องมี” tokenStore ได้เลย — เก็บสถานะด้วย cookie ฝั่ง server แทน