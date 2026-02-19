import { request } from './http';

export type NoteViewMode = 'list' | 'grid';

export type NoteContent = Record<string, unknown>;

export type PasswordProtectionInput = {
  enabled: boolean;
  password?: string;
  currentPassword?: string;
};

export type NoteInput = {
  title: string;
  content: NoteContent;
  passwordProtection?: PasswordProtectionInput;
};

export type NoteSummary = {
  id: number;
  userId: number;
  title: string;
  isPasswordProtected: boolean;
  preview: string | null;
  linkedTaskCount: number;
  createdAt: string;
  updatedAt: string;
};

export type NoteDetail = NoteSummary & {
  requiresUnlock: boolean;
  content: NoteContent | null;
};

export type NotesListResponse = {
  items: NoteSummary[];
  total: number;
  limit: number;
  offset: number;
  viewMode: NoteViewMode;
};

export type NotesQuery = {
  q?: string;
  limit?: number;
  offset?: number;
};

function buildQuery(path: string, params?: Record<string, string | number | undefined>) {
  if (!params) return path;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}

export function listNotes(query: NotesQuery = {}) {
  const path = buildQuery('/api/notes', {
    q: query.q,
    limit: query.limit,
    offset: query.offset,
  });
  return request<NotesListResponse>(path);
}

export async function createNote(payload: NoteInput) {
  const res = await request<{ item: NoteDetail }>('/api/notes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.item;
}

export async function getNote(id: number) {
  const res = await request<{ item: NoteDetail }>(`/api/notes/${id}`);
  return res.item;
}

export async function openProtectedNote(id: number, password: string) {
  const res = await request<{ item: NoteDetail }>(`/api/notes/${id}/open`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
  return res.item;
}

export async function updateNote(id: number, payload: Partial<NoteInput>) {
  const res = await request<{ item: NoteDetail }>(`/api/notes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res.item;
}

export async function deleteNote(id: number, force = false) {
  const path = force ? `/api/notes/${id}?force=true` : `/api/notes/${id}`;
  return request<{ deleted: boolean; unlinkedCount: number }>(path, { method: 'DELETE' });
}

export async function updateNoteViewPreference(viewMode: NoteViewMode) {
  const res = await request<{ viewMode: NoteViewMode }>('/api/notes/preferences', {
    method: 'PATCH',
    body: JSON.stringify({ viewMode }),
  });
  return res.viewMode;
}

