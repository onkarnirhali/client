import { request } from './http';

export type TodoStatus = 'pending' | 'done';
export type TodoPriority = 'low' | 'normal' | 'high';

export type Todo = {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TodoFilters = {
  status?: TodoStatus;
  q?: string;
  dueFrom?: string;
  dueTo?: string;
};

export type TodoInput = {
  title: string;
  description?: string | null;
  status?: TodoStatus;
  priority?: TodoPriority;
  dueDate?: string | null;
};

function buildQuery(path: string, params?: Record<string, string | undefined>) {
  if (!params) return path;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, value);
    }
  }
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}

export async function listTodos(filters: TodoFilters = {}) {
  const path = buildQuery('/api/todos', {
    status: filters.status,
    q: filters.q,
    dueFrom: filters.dueFrom,
    dueTo: filters.dueTo,
  });
  const res = await request<{ items: Todo[] }>(path);
  return res.items;
}

export async function createTodo(payload: TodoInput) {
  const res = await request<{ item: Todo }>('/api/todos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.item;
}

export async function updateTodo(id: number, payload: TodoInput) {
  const res = await request<{ item: Todo }>(`/api/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res.item;
}

export async function deleteTodo(id: number) {
  await request(`/api/todos/${id}`, { method: 'DELETE' });
}
