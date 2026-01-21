import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  acceptAiSuggestion,
  listAiSuggestions,
  refreshAiSuggestions,
  AiSuggestion,
  dismissAiSuggestion,
  bulkDismissAiSuggestions,
} from '../../api/ai';
import { createTodo, TodoInput } from '../../api/todos';

const SUGGESTIONS_KEY = ['ai-suggestions'];

export function useAiSuggestions() {
  const query = useQuery({
    queryKey: SUGGESTIONS_KEY,
    queryFn: async () => listAiSuggestions(),
    refetchOnWindowFocus: false,
  });
  return { ...query };
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

export function useDismissSuggestion() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => dismissAiSuggestion(id),
    onSuccess: (_data, id) => {
      client.setQueryData<AiSuggestion[]>(SUGGESTIONS_KEY, (prev) => (prev || []).filter((s) => s.id !== id));
    },
  });
}

export function useBulkDismiss() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => bulkDismissAiSuggestions(ids),
    onSuccess: (dismissedIds) => {
      client.setQueryData<AiSuggestion[]>(SUGGESTIONS_KEY, (prev) => (prev || []).filter((s) => !dismissedIds.includes(s.id)));
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
