import React, { useEffect, useMemo, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  acceptAiSuggestion,
  listAiSuggestions,
  refreshAiSuggestions,
  AiSuggestion,
} from '../../api/ai';
import { createTodo, TodoInput } from '../../api/todos';

const SUGGESTIONS_KEY = ['ai-suggestions'];
const DISMISSED_STORAGE_KEY = 'aiDismissedIds';

// React Query helpers for AI suggestions: fetch, poll, refresh, add, dismiss (with local persistence)

function loadDismissed(): Set<number> {
  try {
    const raw = localStorage.getItem(DISMISSED_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.map((id) => Number(id)).filter((n) => Number.isFinite(n)));
  } catch {
    return new Set();
  }
}

function saveDismissed(ids: Set<number>) {
  try {
    localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    /* ignore */
  }
}

export function useAiSuggestions() {
  const dismissedRef = useRef<Set<number>>(loadDismissed());
  const query = useQuery({
    queryKey: SUGGESTIONS_KEY,
    queryFn: async () => {
      const data = await listAiSuggestions();
      const filtered = data.filter((s) => !dismissedRef.current.has(s.id));
      return filtered;
    },
    refetchOnWindowFocus: false,
  });
  return { ...query, dismissedRef };
}

export function useRefreshAiSuggestions() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => refreshAiSuggestions(),
    onSuccess: (suggestions) => {
      client.setQueryData(SUGGESTIONS_KEY, suggestions);
    },
  });
}

export function useAcceptSuggestion() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const suggestion = await acceptAiSuggestion(id);
      return suggestion;
    },
    onSuccess: (_data, id) => {
      client.setQueryData<AiSuggestion[]>(SUGGESTIONS_KEY, (prev) => (prev || []).filter((s) => s.id !== id));
    },
  });
}

export function useDismissSuggestion(dismissedRef: React.MutableRefObject<Set<number>>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      dismissedRef.current.add(id);
      saveDismissed(dismissedRef.current);
      return id;
    },
    onSuccess: (id) => {
      client.setQueryData<AiSuggestion[]>(SUGGESTIONS_KEY, (prev) => (prev || []).filter((s) => s.id !== id));
    },
    onError: (_err, id) => {
      dismissedRef.current.delete(id);
      saveDismissed(dismissedRef.current);
    },
  });
}

export function useBulkDismiss(dismissedRef: React.MutableRefObject<Set<number>>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      ids.forEach((id) => dismissedRef.current.add(id));
      saveDismissed(dismissedRef.current);
      return ids;
    },
    onSuccess: (ids) => {
      client.setQueryData<AiSuggestion[]>(SUGGESTIONS_KEY, (prev) => (prev || []).filter((s) => !ids.includes(s.id)));
    },
    onError: (_err, ids) => {
      ids.forEach((id) => dismissedRef.current.delete(id));
      saveDismissed(dismissedRef.current);
    },
  });
}

export function useAddTodoFromSuggestion() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ suggestion, defaults }: { suggestion: AiSuggestion; defaults?: Partial<TodoInput> }) => {
      const payload: TodoInput = {
        title: suggestion.title,
        description: suggestion.detail || '',
        ...defaults,
      };
      return createTodo(payload);
    },
    onSuccess: (_todo, { suggestion }) => {
      client.setQueryData<AiSuggestion[]>(SUGGESTIONS_KEY, (prev) => (prev || []).filter((s) => s.id !== suggestion.id));
      // also refresh todos list
      client.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useSuggestionsPolling({
  enabled,
  hasSuggestions,
  refetch,
}: {
  enabled: boolean;
  hasSuggestions: boolean;
  refetch: () => void;
}) {
  const timerRef = useRef<number | null>(null);
  const visibleRef = useRef<boolean>(document.visibilityState === 'visible');

  useEffect(() => {
    const onVisibility = () => {
      visibleRef.current = document.visibilityState === 'visible';
      if (visibleRef.current && enabled) {
        refetch();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [enabled, refetch]);

  useEffect(() => {
    if (!enabled) return;
    const interval = hasSuggestions ? 30_000 : 90_000;
    const tick = () => {
      if (!visibleRef.current) return;
      refetch();
    };
    timerRef.current = window.setInterval(tick, interval);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [enabled, hasSuggestions, refetch]);
}
