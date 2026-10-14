import { apiClient } from '@/shared/lib/apiClient';
import type {
  AdminLoginInput,
  AuthResponse,
  AuthUser,
  ClientLoginInput,
  ClientRegisterInput,
} from '../types/auth.types';

const BASE = '/api/auth';

export function clientLogin(input: ClientLoginInput): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>(`${BASE}/client/login`, input);
}

export function clientRegister(
  input: ClientRegisterInput,
): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>(`${BASE}/client/register`, input);
}

export function adminLogin(input: AdminLoginInput): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>(`${BASE}/admin/login`, input);
}

export function refreshAccessToken(): Promise<{ accessToken: string }> {
  return apiClient.post<{ accessToken: string }>(`${BASE}/refresh`);
}

export function getMe(): Promise<{ user: AuthUser }> {
  return apiClient.get<{ user: AuthUser }>(`${BASE}/me`);
}

export function logout(): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(`${BASE}/logout`);
}