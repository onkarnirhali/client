import { useEffect, useMemo, useState } from 'react';
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
import { AiSuggestionsWidget } from '../features/aiSuggestions/AiSuggestionsWidget';

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

  const openTasks = items.filter((t) => t.status !== 'done').length;
  const doneTasks = items.filter((t) => t.status === 'done').length;

  return (
    <div className="grid gap-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <article className="metric-card">
          <div className="metric-label">Open tasks</div>
          <div className="metric-value">{openTasks}</div>
        </article>
        <article className="metric-card">
          <div className="metric-label">Completed</div>
          <div className="metric-value">{doneTasks}</div>
        </article>
        <article className="metric-card">
          <div className="metric-label">Total tasks</div>
          <div className="metric-value">{items.length}</div>
        </article>
        <article className="metric-card">
          <div className="metric-label">Filters active</div>
          <div className="metric-value">{hasFilters ? 'Yes' : 'No'}</div>
        </article>
      </div>

      {/* Filters */}
      <TodoFilters
        draft={draft}
        onDraftChange={setDraft}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        busy={loading}
      />

      {/* Error */}
      {error && (
        <div className="panel p-4 border-danger/20 bg-danger-soft text-danger text-sm font-bold">
          Failed to load todos. Try again later.
        </div>
      )}

      {/* Board layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
        <div>
          {/* Empty welcome state */}
          {!loading && !error && items.length === 0 && !hasFilters ? (
            <div className="panel p-8 md:p-12 text-center grid gap-4 max-w-[840px] mx-auto">
              <h2 className="title-md">Welcome to Might as well</h2>
              <p className="text-muted text-[15px] max-w-[520px] mx-auto">
                Your AI-assisted todo manager. Add a task to get started and see the magic happen.
              </p>
              <div className="flex justify-center">
                <button className="btn btn-primary" onClick={openCreate} disabled={formSubmitting}>
                  Add New Task
                </button>
              </div>
            </div>
          ) : !loading && items.length === 0 && hasFilters ? (
            <div className="panel p-8 text-center grid gap-3 max-w-[720px] mx-auto">
              <h3 className="text-lg font-bold">No tasks match these filters</h3>
              <p className="text-muted text-sm">Try adjusting your search, status, priority, or due date range.</p>
              <div className="flex justify-center gap-2">
                <button className="btn btn-secondary" onClick={handleResetFilters}>Clear Filters</button>
                <button className="btn btn-primary" onClick={openCreate}>New Todo</button>
              </div>
            </div>
          ) : (
            <TodoList items={items} loading={loading} onEdit={openEdit} onDelete={setConfirmTodo} />
          )}
        </div>

        {/* Side rail - AI suggestions */}
        <aside className="hidden xl:block">
          <AiSuggestionsWidget />
        </aside>
      </div>

      {/* Mobile AI bubble */}
      <div className="xl:hidden">
        <AiSuggestionsWidget />
      </div>

      {/* Form dialog */}
      <TodoFormDialog
        open={formOpen}
        mode={formMode}
        initial={activeTodo}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        submitting={formSubmitting}
      />

      {/* Delete confirm dialog */}
      {confirmTodo && (
        <>
          <div className="dialog-overlay" onClick={() => setConfirmTodo(null)} />
          <div className="dialog-content panel p-6 text-center grid gap-4">
            <h3 className="text-lg font-extrabold">Delete Task?</h3>
            <p className="text-muted text-sm">
              Are you sure you want to delete &quot;{confirmTodo.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button className="btn btn-secondary" onClick={() => setConfirmTodo(null)} disabled={deleteMutation.isPending}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
