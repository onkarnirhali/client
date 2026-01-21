import { request } from './http';

export type AiSuggestion = {
  id: number;
  title: string;
  detail: string | null;
  sourceMessageIds: string[];
  confidence: number | null;
  status: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export async function rephraseDescription(description: string): Promise<string> {
  const body = { description };
  const res = await request<{ rephrased: string }>('/ai/rephrase', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.rephrased;
}

// List cached AI suggestions for the current user
export async function listAiSuggestions(): Promise<AiSuggestion[]> {
  const res = await request<{ suggestions: AiSuggestion[] }>('/ai/suggestions');
  return res.suggestions;
}

// Trigger server-side refresh pipeline then return new suggestions
export async function refreshAiSuggestions(): Promise<AiSuggestion[]> {
  const res = await request<{ suggestions: AiSuggestion[] }>('/ai/suggestions/refresh', {
    method: 'POST',
  });
  return res.suggestions;
}

// Mark suggestion accepted (helper endpoint)
export async function acceptAiSuggestion(id: number): Promise<AiSuggestion> {
  const res = await request<{ suggestion: AiSuggestion }>(`/ai/suggestions/${id}/accept`, {
    method: 'POST',
  });
  return res.suggestion;
}

// Mark suggestion dismissed
export async function dismissAiSuggestion(id: number, reason?: string): Promise<AiSuggestion> {
  const res = await request<{ suggestion: AiSuggestion }>(`/ai/suggestions/${id}/dismiss`, {
    method: 'POST',
    body: JSON.stringify(reason ? { reason } : {}),
  });
  return res.suggestion;
}

// Bulk dismiss suggestions
export async function bulkDismissAiSuggestions(ids: number[], reason?: string): Promise<number[]> {
  const res = await request<{ dismissed: number[] }>('/ai/suggestions/dismiss', {
    method: 'POST',
    body: JSON.stringify(reason ? { ids, reason } : { ids }),
  });
  return res.dismissed;
}
