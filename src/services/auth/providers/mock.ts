import type { AuthProvider, LoginInput, LoginResult, SignupInput, SignupResult } from "../types";

export class MockAuthProvider implements AuthProvider {
  async login(data: LoginInput): Promise<LoginResult> {
    await new Promise(r => setTimeout(r, 400));
    if (data.email === "demo@demo.com" && data.password === "123456") {
      return {
        token: "mock-token-abc123",
        user: { id: "u_1", email: data.email, name: "Demo User" },
      };
    }
    throw new Error("Invalid credentials");
  }

  async signup(data: SignupInput): Promise<SignupResult> {
    await new Promise(r => setTimeout(r, 300));
    return { user: { id: "u_2", email: data.email, name: data.name } };
  }

  async logout(): Promise<void> {
    await new Promise(r => setTimeout(r, 200));
  }

  async me(): Promise<LoginResult["user"]> {
    await new Promise(r => setTimeout(r, 200));
    return { id: "u_1", email: "demo@demo.com", name: "Demo User" };
  }
}
