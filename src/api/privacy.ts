import { request } from './http';

export type PrivacyExportPayload = {
  exportedAt: string;
  user: {
    id: number;
    email: string;
    name?: string | null;
    role?: string | null;
    isEnabled?: boolean;
    lastActiveAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  data: {
    todos: unknown[];
    suggestions: unknown[];
    providers: unknown[];
    events: unknown[];
  };
  summary: {
    todoCount: number;
    suggestionCount: number;
    providerCount: number;
    eventCount: number;
  };
};

export type PrivacyDeleteResponse = {
  success: boolean;
  deletedUserId: number;
  deletedAt: string;
};

export function exportMyData() {
  return request<PrivacyExportPayload>('/me/privacy/export');
}

export function deleteMyData(confirmation = 'DELETE') {
  return request<PrivacyDeleteResponse>('/me/privacy/delete', {
    method: 'POST',
    body: JSON.stringify({ confirmation }),
  });
}
