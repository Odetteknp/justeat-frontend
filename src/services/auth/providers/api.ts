// // import { apiFetch } from "../../apiClient";
// // import type { AuthProvider, LoginInput, LoginResult, SignupInput, SignupResult } from "../types";

// // // ถ้าใช้ Bearer token ให้ส่ง header Authorization ในที่ที่จำเป็น (เช่น /me)
// // // หรือใช้ cookie ล้วน (credentials: include) ก็ไม่ต้องแนบ header
// // export class ApiAuthProvider implements AuthProvider {
// //   private base = "/api";

// //   async login(data: LoginInput, signal?: AbortSignal): Promise<LoginResult> {
// //     // backend ของคุณ: POST /api/login -> { token?, user }
// //     const res = await apiFetch<LoginResult>(`${this.base}/login`, {
// //       method: "POST",
// //       body: JSON.stringify({ email: data.email, password: data.password }),
// //     }, signal);
// //     return res;
// //   }

// //   async signup(data: SignupInput, signal?: AbortSignal): Promise<SignupResult> {
// //     return apiFetch<SignupResult>(`${this.base}/signup`, {
// //       method: "POST",
// //       body: JSON.stringify(data),
// //     }, signal);
// //   }

// //   async logout(signal?: AbortSignal): Promise<void> {
// //     await apiFetch<void>(`${this.base}/logout`, { method: "POST" }, signal);
// //   }

// //   async me(signal?: AbortSignal): Promise<LoginResult["user"]> {
// //     // ถ้าใช้ bearer:
// //     // const token = getToken(); headers: { Authorization: `Bearer ${token}` }
// //     const user = await apiFetch<LoginResult["user"]>(`${this.base}/me`, {}, signal);
// //     return user;
// //   }
// // }


// // src/services/auth/providers/api.ts
// import { api, ApiError } from "../../apiClient";
// import { setToken, clearToken } from "../../tokenStore";
// import type {
//   AuthProvider,
//   LoginInput,
//   LoginResult,
//   SignupInput,
//   SignupResult,
// } from "../types";

// /**
//  * ✅ แนวคิด
//  * - เรียกผ่าน axios instance เดียว (api) → ได้ header/token/interceptor ครบ
//  * - login สำเร็จแล้ว เก็บ token ด้วย setToken (interceptor จะฉีดอัตโนมัติในคำขอถัดไป)
//  * - logout: เคลียร์ฝั่งเซิร์ฟ (ถ้ามี) + clearToken ฝั่ง client
//  */
// export class ApiAuthProvider implements AuthProvider {
//   private base = "/api";

//   async login(data: LoginInput, signal?: AbortSignal): Promise<LoginResult> {
//     try {
//       const { data: res } = await api.post<LoginResult>(
//         `${this.base}/login`,
//         { email: data.email, password: data.password },
//         { signal }
//       );

//       // ถ้า backend ส่ง token กลับมา เก็บไว้ (กรณีใช้ Bearer)
//       if (res?.token) setToken?.(res.token);
//       return res;
//     } catch (e: any) {
//       throw ApiError.fromAxios(e);
//     }
//   }

//   async signup(data: SignupInput, signal?: AbortSignal): Promise<SignupResult> {
//     try {
//       const { data: res } = await api.post<SignupResult>(
//         `${this.base}/signup`,
//         data,
//         { signal }
//       );
//       return res;
//     } catch (e: any) {
//       throw ApiError.fromAxios(e);
//     }
//   }

//   async logout(signal?: AbortSignal): Promise<void> {
//     try {
//       // ถ้ามี endpoint สำหรับทำลาย session/refresh ใน server
//       await api.post(`${this.base}/logout`, undefined, { signal });
//     } finally {
//       // เคลียร์ token ฝั่ง client เสมอ
//       clearToken?.();
//     }
//   }

//   async me(signal?: AbortSignal): Promise<LoginResult["user"]> {
//     try {
//       const { data: user } = await api.get<LoginResult["user"]>(
//         `${this.base}/me`,
//         { signal }
//       );
//       return user;
//     } catch (e: any) {
//       throw ApiError.fromAxios(e);
//     }
//   }
// }
