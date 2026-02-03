import { request } from './http';

export type Provider = {
  provider: string;
  displayName: string;
  linked: boolean;
  ingestEnabled: boolean;
  lastLinkedAt?: string | null;
  lastSyncAt?: string | null;
  metadata?: Record<string, unknown>;
};

export function listProviders() {
  return request<{ providers: Provider[] }>('/me/providers');
}

export function disconnectProvider(provider: string) {
  return request<{ provider: Provider }>(`/me/providers/${provider}/disconnect`, { method: 'POST' });
}

export function toggleProviderIngest(provider: string, ingestEnabled: boolean) {
  return request<{ provider: Provider | null }>(`/me/providers/${provider}/toggle`, {
    method: 'POST',
    body: JSON.stringify({ ingestEnabled }),
  });
}
