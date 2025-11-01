import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { TodoFiltersDraft, TodoFilters, TodoList, TodoFormDialog } from '../components/todos';
import { useSnackbar } from '../components/feedback/SnackbarProvider';
import {
  Todo,
  TodoFilters as QueryFilters,
  TodoInput,
  useCreateTodo,
  useDeleteTodo,
  useTodos,
  useUpdateTodo,
} from '../features/todos';

function toDraft(filters: QueryFilters): TodoFiltersDraft {
  return {
    status: filters.status ?? '',
    q: filters.q ?? '',
    dueFrom: filters.dueFrom ? filters.dueFrom.slice(0, 10) : '',
    dueTo: filters.dueTo ? filters.dueTo.slice(0, 10) : '',
  };
}

function toFilters(draft: TodoFiltersDraft): QueryFilters {
  const next: QueryFilters = {};
  if (draft.status) next.status = draft.status as QueryFilters['status'];
  if (draft.q.trim()) next.q = draft.q.trim();
  if (draft.dueFrom) next.dueFrom = new Date(`${draft.dueFrom}T00:00:00.000Z`).toISOString();
  if (draft.dueTo) next.dueTo = new Date(`${draft.dueTo}T23:59:59.999Z`).toISOString();
  return next;
}

export function TodosPage() {
  const [filters, setFilters] = useState<QueryFilters>({});
  const [draft, setDraft] = useState<TodoFiltersDraft>(() => toDraft(filters));
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);
  const [confirmTodo, setConfirmTodo] = useState<Todo | null>(null);
  const { notify } = useSnackbar();

  const { data: items = [], isLoading, isFetching, error } = useTodos(filters);
  const createMutation = useCreateTodo(filters);
  const updateMutation = useUpdateTodo(filters);
  const deleteMutation = useDeleteTodo(filters);

  const formSubmitting = createMutation.isPending || updateMutation.isPending;
  const busy = formSubmitting || deleteMutation.isPending;

  const loading = useMemo(() => isLoading || isFetching, [isLoading, isFetching]);

  const handleApplyFilters = () => {
    const next = toFilters(draft);
    setFilters(next);
  };

  const handleResetFilters = () => {
    setDraft({ status: '', q: '', dueFrom: '', dueTo: '' });
    setFilters({});
  };

  const openCreate = () => {
    setFormMode('create');
    setActiveTodo(null);
    setFormOpen(true);
  };

  const openEdit = (todo: Todo) => {
    setFormMode('edit');
    setActiveTodo(todo);
    setFormOpen(true);
  };

  const handleCreate = async (payload: TodoInput) => {
    try {
      await createMutation.mutateAsync(payload);
      notify('Todo created', 'success');
      setFormOpen(false);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to create todo', 'error');
    }
  };

  const handleUpdate = async (payload: TodoInput) => {
    if (!activeTodo) return;
    try {
      await updateMutation.mutateAsync({ id: activeTodo.id, payload });
      notify('Todo updated', 'success');
      setFormOpen(false);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to update todo', 'error');
    }
  };

  const handleSubmit = async (payload: TodoInput) => {
    if (formMode === 'create') {
      await handleCreate(payload);
    } else {
      await handleUpdate(payload);
    }
  };

  const handleDelete = async () => {
    if (!confirmTodo) return;
    try {
      await deleteMutation.mutateAsync(confirmTodo.id);
      notify('Todo deleted', 'success');
      setConfirmTodo(null);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to delete todo', 'error');
    }
  };

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <div>
          <Typography variant="h5" gutterBottom>
            Todos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Capture your tasks, track progress, and stay organized.
          </Typography>
        </div>
        <Button variant="contained" onClick={openCreate} disabled={formSubmitting}>
          New Todo
        </Button>
      </Box>

      <TodoFilters
        draft={draft}
        onDraftChange={setDraft}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        busy={loading}
      />

      {error && (
        <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography variant="body2">Failed to load todos. Try again later.</Typography>
        </Box>
      )}

      <TodoList items={items} loading={loading} onEdit={openEdit} onDelete={setConfirmTodo} />

      <TodoFormDialog
        open={formOpen}
        mode={formMode}
        initial={activeTodo}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        submitting={formSubmitting}
      />

      <Dialog open={Boolean(confirmTodo)} onClose={() => setConfirmTodo(null)}>
        <DialogTitle>Delete todo</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{confirmTodo?.title}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmTodo(null)} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleteMutation.isPending}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
