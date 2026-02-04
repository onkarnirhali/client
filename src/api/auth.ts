import { request } from './http';

export type User = { id: number; email: string; name?: string | null; role?: string | null };

export function getMe() {
  return request<{ user: User }>('/auth/me');
}

export function logout() {
  return request('/auth/logout', { method: 'POST' });
}

