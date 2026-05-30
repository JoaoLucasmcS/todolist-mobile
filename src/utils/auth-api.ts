import axios from 'axios';
import type { AuthUser } from '../store/useAuthStore';

const baseURL = process.env.EXPO_PUBLIC_API_URL;

export type AuthResponse = {
  sessionToken: string;
  user: AuthUser;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export async function signupRequest(payload: SignupPayload): Promise<AuthResponse> {
  const { data } = await axios.post<AuthResponse>(`${baseURL}/auth/signup`, payload);
  return data;
}

export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await axios.post<AuthResponse>(`${baseURL}/auth/login`, payload);
  return data;
}
