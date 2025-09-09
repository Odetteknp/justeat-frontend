import type { UserProfile } from "./user";

export interface LoginResponse {
  ok: boolean;
  token: string;
  user: UserProfile & { id: number; avatarUrl?: string };
}

export interface RegisterResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
}

export interface MeResponse {
  ok: boolean;
  user: LoginResponse["user"];
}

export interface RefreshResponse {
  ok: boolean;
  token: string;
}

export interface MeRestaurantResponse {
  ok: boolean;
  restaurant: {
    ID: number;
    name: string;
    address: string;
    description?: string;
    openingTime?: string;
    closingTime?: string;
    pictureBase64?: string | null;
  };
}
