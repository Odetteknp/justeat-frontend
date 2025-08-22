// ใช้ได้กับ tsconfig ที่เปิด erasableSyntaxOnly
export type LoginInput = {
    email: string;
    password: string;
    remember?: boolean;
};

export type LoginResult = {
    token: string;
    user: { id: string; email: string; name: string };
};

export type AuthProvider = {
    login(data: LoginInput): Promise<LoginResult>;
};

class MockAuthProvider implements AuthProvider {
    async login(data: LoginInput): Promise<LoginResult> {
        // delay เล็กน้อยให้เหมือนจริง
        await new Promise((r) => setTimeout(r, 500));
        if (data.email === "demo@demo.com" && data.password === "123456") {
            return {
                token: "mock-token-abc123",
                user: { id: "u_1", email: data.email, name: "Demo User" },
            };
        }
        throw new Error("Invalid credentials");
    }
}

class ApiAuthProvider implements AuthProvider {
    private endpoint: string;
    constructor(
        endpoint = (import.meta.env.VITE_API_URL ?? "http://localhost:8080") +
            "/api"
    ) {
        this.endpoint = endpoint;
    }
    async login(data: LoginInput): Promise<LoginResult> {
        const res = await fetch(`${this.endpoint}/login`, {
            method: "POST",
            credentials: "include", // ถ้า backend ใช้ cookie
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: data.email, password: data.password }),
        });
        if (!res.ok) {
            const msg = await res.text().catch(() => "");
            throw new Error(msg || "Login failed");
        }
        return (await res.json()) as LoginResult;
    }
}

// สลับได้ด้วย .env: VITE_USE_API=true
const useApi = import.meta.env.VITE_USE_API === "true";
export const authProvider: AuthProvider = useApi
    ? new ApiAuthProvider()
    : new MockAuthProvider();

export async function login(
    data: LoginInput,
    provider: AuthProvider = authProvider
) {
    return provider.login(data);
}

export type SignupInput = { name: string; email: string; password: string };
export type SignupResult = {
    user: { id: string; email: string; name: string };
};

export async function signup(data: SignupInput) {
    const API =
        (import.meta.env.VITE_API_URL ?? "http://localhost:8080") + "/api";
    const res = await fetch(`${API}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Signup failed");
    }
    return (await res.json()) as SignupResult;
}
