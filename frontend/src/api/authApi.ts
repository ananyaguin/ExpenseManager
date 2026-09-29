import apiClient from "./axios";
import { AuthResponse, ProfileDTO } from "../types";

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  profileImageUrl?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/login", payload);
    return response.data;
  },

  register: async (payload: RegisterPayload): Promise<ProfileDTO> => {
    const response = await apiClient.post<ProfileDTO>("/register", payload);
    return response.data;
  },

  getProfile: async (): Promise<ProfileDTO> => {
    const response = await apiClient.get<ProfileDTO>("/profile");
    return response.data;
  },

  activateAccount: async (token: string): Promise<string> => {
    const response = await apiClient.get<string>(`/activate?token=${encodeURIComponent(token)}`);
    return response.data;
  },
};
