import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTodo, deleteTodo, listTodos, Todo, TodoFilters, TodoInput, updateTodo } from '../../api/todos';

function todosKey(filters: TodoFilters) {
  return ['todos', filters];
}

export function useTodos(filters: TodoFilters) {
  const queryKey = useMemo(() => todosKey(filters), [filters]);
  // Query todos for current filters; refetch handled via invalidations below
  return useQuery({
    queryKey,
    queryFn: () => listTodos(filters),
  });
}

export function useCreateTodo(filters: TodoFilters) {
  const client = useQueryClient();
  const key = useMemo(() => todosKey(filters), [filters]);
  return useMutation({
    mutationFn: (payload: TodoInput) => createTodo(payload),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: key });
    },
  });
}

export function useUpdateTodo(filters: TodoFilters) {
  const client = useQueryClient();
  const key = useMemo(() => todosKey(filters), [filters]);
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TodoInput }) => updateTodo(id, payload),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: key });
    },
  });
}

export function useDeleteTodo(filters: TodoFilters) {
  const client = useQueryClient();
  const key = useMemo(() => todosKey(filters), [filters]);
  return useMutation({
    mutationFn: (id: number) => deleteTodo(id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: key });
    },
  });
}

export type { Todo, TodoFilters, TodoInput } from '../../api/todos';
