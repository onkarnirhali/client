import { request } from './http';

export type AdminSummary = {
  totalUsers: number;
  activeUsers24h: number;
};

export type AdminUserMetric = {
  id: number;
  email: string;
  name?: string | null;
  role?: string | null;
  createdAt?: string | null;
  lastActiveAt?: string | null;
  suggestionsGenerated: number;
  suggestionsAccepted: number;
  tokensGeneration: number;
  tokensEmbedding: number;
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
  return request<{ items: AdminUserMetric[]; total: number; limit: number; offset: number }>(
    `/admin/users?limit=${limit}&offset=${offset}`
  );
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
