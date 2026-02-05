import { request } from './http';

export type AdminSummary = {
  totalUsers: number;
  activeUsers24h: number;
};

export type AdminUser = {
  id: number;
  email: string;
  name?: string | null;
  providerId?: string | null;
  providerName?: string | null;
  role?: string | null;
  isEnabled?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  lastActiveAt?: string | null;
  outlookAccountEmail?: string | null;
  outlookTenantId?: string | null;
  suggestionsGenerated?: number;
  suggestionsAccepted?: number;
  tokensGeneration?: number;
  tokensEmbedding?: number;
};

export type AdminEvent = {
  id: number;
  type: string;
  userId?: number | null;
  email?: string | null;
  requestId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  source?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string | null;
};

export type AdminIntegration = {
  id: number;
  email: string;
  name?: string | null;
  gmailLinked: boolean;
  gmailIngestEnabled: boolean;
  gmailLastLinkedAt?: string | null;
  outlookLinked: boolean;
  outlookIngestEnabled: boolean;
  outlookLastLinkedAt?: string | null;
};

export function getAdminSummary() {
  return request<AdminSummary>('/admin/summary');
}

export function listAdminUsers(limit: number, offset: number) {
  return request<{ items: AdminUser[]; total: number; limit: number; offset: number }>(
    `/admin/users?limit=${limit}&offset=${offset}`
  );
}

export function listAdminUsersByRole(limit: number, offset: number, role: string) {
  return request<{ items: AdminUser[]; total: number; limit: number; offset: number }>(
    `/admin/users?limit=${limit}&offset=${offset}&role=${encodeURIComponent(role)}`
  );
}

export function updateAdminUser(id: number, payload: { role?: string; isEnabled?: boolean }) {
  return request<{ success: boolean }>(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function listAdminEvents(limit: number, offset: number) {
  return request<{ items: AdminEvent[]; total: number; limit: number; offset: number }>(
    `/admin/events?limit=${limit}&offset=${offset}`
  );
}

export function listAdminIntegrations(limit: number, offset: number) {
  return request<{ items: AdminIntegration[]; total: number; limit: number; offset: number }>(
    `/admin/integrations?limit=${limit}&offset=${offset}`
  );
}
