// export type LoginInput = {
//   email: string;
//   password: string;
//   remember?: boolean;
// };

// export type LoginResult = {
//   token?: string; // ถ้าใช้ bearer อาจมี; ถ้าใช้ cookie อาจไม่ต้องส่ง
//   user: { id: string; email: string; name: string; role?: string };
// };

// export type SignupInput = { name: string; email: string; password: string };
// export type SignupResult = { user: { id: string; email: string; name: string } };

// export interface AuthProvider {
//   login(data: LoginInput, signal?: AbortSignal): Promise<LoginResult>;
//   signup?(data: SignupInput, signal?: AbortSignal): Promise<SignupResult>;
//   logout?(signal?: AbortSignal): Promise<void>;
//   me?(signal?: AbortSignal): Promise<LoginResult["user"]>;
// }
