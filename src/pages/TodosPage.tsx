import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
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
import { apiPriorityFromUi, apiStatusFromUi, uiPriorityFromApi, uiStatusFromApi } from '../features/todos/mapping';

function toDraft(filters: QueryFilters): TodoFiltersDraft {
  return {
    status: filters.status ? uiStatusFromApi(filters.status) : '',
    priority: filters.priority ? uiPriorityFromApi(filters.priority) : '',
    q: filters.q ?? '',
    dueFrom: filters.dueFrom ? filters.dueFrom.slice(0, 10) : '',
    dueTo: filters.dueTo ? filters.dueTo.slice(0, 10) : '',
  };
}

function toFilters(draft: TodoFiltersDraft): QueryFilters {
  const next: QueryFilters = {};
  if (draft.status) next.status = apiStatusFromUi(draft.status);
  if (draft.priority) next.priority = apiPriorityFromUi(draft.priority);
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
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: items = [], isLoading, isFetching, error } = useTodos(filters);
  const createMutation = useCreateTodo(filters);
  const updateMutation = useUpdateTodo(filters);
  const deleteMutation = useDeleteTodo(filters);

  const formSubmitting = createMutation.isPending || updateMutation.isPending;
  const busy = formSubmitting || deleteMutation.isPending;

  const loading = useMemo(() => isLoading || isFetching, [isLoading, isFetching]);
  const hasFilters = useMemo(
    () => Boolean(filters.status || filters.priority || filters.q || filters.dueFrom || filters.dueTo),
    [filters]
  );

  const handleApplyFilters = () => {
    const next = toFilters(draft);
    setFilters(next);
  };

  const handleResetFilters = () => {
    setDraft({ status: '', priority: '', q: '', dueFrom: '', dueTo: '' });
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

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      openCreate();
      const next = new URLSearchParams(searchParams);
      next.delete('new');
      setSearchParams(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Todos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your personal task dashboard.
          </Typography>
        </div>
        <Button variant="contained" onClick={openCreate} disabled={formSubmitting} sx={{ display: { xs: 'inline-flex', sm: 'none' } }}>
          New Todo
        </Button>
      </Box>

      {!loading && !error && items.length === 0 && !hasFilters ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            display: 'grid',
            gap: 3,
            textAlign: 'center',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'rgba(15,17,26,0.08)',
            maxWidth: 840,
            mx: 'auto',
            backgroundColor: '#fff',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 360,
              mx: 'auto',
              aspectRatio: '4 / 3',
              backgroundImage: 'url(/assets/welcome-hero.png)',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              borderRadius: 2,
            }}
          />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Welcome to VibeCode
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520, mx: 'auto' }}>
            Your AI-assisted todo manager. Add a task to get started and see the magic happen.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="center" spacing={1}>
            <Button variant="contained" size="large" onClick={openCreate} disabled={formSubmitting}>
              Add New Task
            </Button>
          </Stack>
        </Paper>
      ) : (
        <>
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

          {!loading && items.length === 0 && hasFilters ? (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 5 },
                display: 'grid',
                gap: 2,
                textAlign: 'center',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'rgba(15,17,26,0.08)',
                maxWidth: 720,
                mx: 'auto',
                backgroundColor: '#fff',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 320,
                  mx: 'auto',
                  aspectRatio: '4 / 3',
                  backgroundImage: 'url(/assets/empty-state.png)',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  borderRadius: 2,
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                No tasks match these filters
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search, status, priority, or due date range.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center">
                <Button variant="outlined" onClick={handleResetFilters}>
                  Clear Filters
                </Button>
                <Button variant="contained" onClick={openCreate}>
                  New Todo
                </Button>
              </Stack>
            </Paper>
          ) : (
            <TodoList items={items} loading={loading} onEdit={openEdit} onDelete={setConfirmTodo} />
          )}
        </>
      )}

      <TodoFormDialog
        open={formOpen}
        mode={formMode}
        initial={activeTodo}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        submitting={formSubmitting}
      />

      <Dialog open={Boolean(confirmTodo)} onClose={() => setConfirmTodo(null)}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, fontSize: '1.25rem' }}>Delete Task?</DialogTitle>
        <DialogContent sx={{ textAlign: 'center', px: 4 }}>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Are you sure you want to delete “{confirmTodo?.title}”? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 1 }}>
          <Button onClick={() => setConfirmTodo(null)} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
            sx={{ minWidth: 120 }}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
