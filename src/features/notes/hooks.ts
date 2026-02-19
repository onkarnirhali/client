import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createNote,
  deleteNote,
  getNote,
  listNotes,
  NoteDetail,
  NoteInput,
  NotesQuery,
  openProtectedNote,
  updateNote,
  updateNoteViewPreference,
} from '../../api/notes';

export function notesQueryKey(query: NotesQuery) {
  return ['notes', query];
}

export function noteDetailKey(id: number) {
  return ['note', id];
}

export function useNotes(query: NotesQuery) {
  const queryKey = useMemo(() => notesQueryKey(query), [query]);
  return useQuery({
    queryKey,
    queryFn: () => listNotes(query),
  });
}

export function useNote(id: number) {
  const queryKey = useMemo(() => noteDetailKey(id), [id]);
  return useQuery({
    queryKey,
    queryFn: () => getNote(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useCreateNote(listQuery: NotesQuery) {
  const client = useQueryClient();
  const key = useMemo(() => notesQueryKey(listQuery), [listQuery]);
  return useMutation({
    mutationFn: (payload: NoteInput) => createNote(payload),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: key });
    },
  });
}

export function useUpdateNote(id: number, listQuery?: NotesQuery) {
  const client = useQueryClient();
  const detailKey = useMemo(() => noteDetailKey(id), [id]);
  const listKey = useMemo(() => (listQuery ? notesQueryKey(listQuery) : null), [listQuery]);
  return useMutation({
    mutationFn: (payload: Partial<NoteInput>) => updateNote(id, payload),
    onSuccess: (item: NoteDetail) => {
      client.setQueryData(detailKey, item);
      if (listKey) client.invalidateQueries({ queryKey: listKey });
    },
  });
}

export function useDeleteNote(listQuery: NotesQuery) {
  const client = useQueryClient();
  const key = useMemo(() => notesQueryKey(listQuery), [listQuery]);
  return useMutation({
    mutationFn: ({ id, force = false }: { id: number; force?: boolean }) => deleteNote(id, force),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: key });
      client.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useOpenProtectedNote(id: number) {
  const client = useQueryClient();
  const detailKey = useMemo(() => noteDetailKey(id), [id]);
  return useMutation({
    mutationFn: (password: string) => openProtectedNote(id, password),
    onSuccess: (item: NoteDetail) => {
      client.setQueryData(detailKey, item);
    },
  });
}

export function useUpdateNotePreference(listQuery: NotesQuery) {
  const client = useQueryClient();
  const key = useMemo(() => notesQueryKey(listQuery), [listQuery]);
  return useMutation({
    mutationFn: updateNoteViewPreference,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: key });
    },
  });
}

export type { NoteSummary, NoteDetail, NoteInput, NoteContent, NoteViewMode } from '../../api/notes';

