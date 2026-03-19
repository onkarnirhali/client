import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HttpError } from '../api/http';
import { useSnackbar } from '../components/feedback/SnackbarProvider';
import { NoteEditorDialog } from '../components/notes';
import {
  NoteSummary,
  NoteViewMode,
  useCreateNote,
  useDeleteNote,
  useNotes,
  useUpdateNotePreference,
} from '../features/notes';

type PendingDelete = {
  note: NoteSummary;
  force: boolean;
  linkCount?: number;
};

export function NotesPage() {
  const navigate = useNavigate();
  const { notify } = useSnackbar();
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<NoteViewMode>('grid');
  const [viewModeLoaded, setViewModeLoaded] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const listQuery = useMemo(() => ({ q: query.trim(), limit: 200, offset: 0 }), [query]);
  const { data, isLoading, error } = useNotes(listQuery);
  const createMutation = useCreateNote(listQuery);
  const deleteMutation = useDeleteNote(listQuery);
  const preferenceMutation = useUpdateNotePreference(listQuery);

  useEffect(() => {
    if (viewModeLoaded) return;
    if (!data?.viewMode) return;
    setViewMode(data.viewMode);
    setViewModeLoaded(true);
  }, [data?.viewMode, viewModeLoaded]);

  const items = data?.items || [];

  const handleChangeView = async (next: NoteViewMode) => {
    const previous = viewMode;
    setViewMode(next);
    try {
      await preferenceMutation.mutateAsync(next);
    } catch (err) {
      setViewMode(previous);
      notify(err instanceof Error ? err.message : 'Failed to save view preference', 'error');
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMutation.mutateAsync({ id: pendingDelete.note.id, force: pendingDelete.force });
      notify('Note deleted', 'success');
      setPendingDelete(null);
    } catch (err) {
      if (err instanceof HttpError && err.status === 409 && err.code === 'NOTE_LINKED') {
        const linkCount = Number((err.data as any)?.error?.linkCount || 0);
        setPendingDelete((current) => (current ? { ...current, force: true, linkCount } : current));
        return;
      }
      notify(err instanceof Error ? err.message : 'Failed to delete note', 'error');
    }
  };

  const protectedCount = items.filter((n) => n.isPasswordProtected).length;
  const linkedCount = items.filter((n) => n.linkedTaskCount > 0).length;

  return (
    <div className="grid gap-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <article className="metric-card">
          <div className="metric-label">Total notes</div>
          <div className="metric-value">{items.length}</div>
          <div className="metric-trend">{linkedCount} linked to tasks</div>
        </article>
        <article className="metric-card">
          <div className="metric-label">Protected</div>
          <div className="metric-value">{protectedCount}</div>
          <div className="metric-trend">Lock state exposed on cards</div>
        </article>
        <article className="metric-card">
          <div className="metric-label">View mode</div>
          <div className="metric-value capitalize">{viewMode}</div>
        </article>
        <article className="metric-card">
          <div className="metric-label">Search</div>
          <div className="metric-value">{query ? 'Active' : 'None'}</div>
        </article>
      </div>

      {/* Search + controls */}
      <div className="panel p-4 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <input
            className="input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes..."
          />
        </div>
        <div className="flex gap-1.5">
          <button
            className={`tab-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => handleChangeView('list')}
          >
            List
          </button>
          <button
            className={`tab-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => handleChangeView('grid')}
          >
            Grid
          </button>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setCreateOpen(true)}>New note</button>
      </div>

      {/* Error */}
      {error && (
        <div className="panel p-4 border-danger/20 bg-danger-soft text-danger text-sm font-bold">
          Failed to load notes.
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && items.length === 0 && (
        <div className="panel p-8 text-center grid gap-3">
          <h3 className="text-lg font-bold">No notes yet</h3>
          <p className="text-muted text-sm">Create your first note to get started.</p>
          <div className="flex justify-center">
            <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>Add New Note</button>
          </div>
        </div>
      )}

      {/* Note layout: grid + side rail */}
      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
          <div className="panel p-5">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((note) => (
                  <article
                    key={note.id}
                    className="note-card"
                    onClick={() => navigate(`/app/notes/${note.id}`)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="grid gap-1 flex-1 min-w-0">
                        <div className="font-bold text-sm flex items-center gap-1.5">
                          {note.isPasswordProtected && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-danger shrink-0"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                          )}
                          <span className="truncate">{note.title}</span>
                        </div>
                        <p className="text-muted text-[13px] line-clamp-2">
                          {note.isPasswordProtected ? 'Protected note' : note.preview || 'No preview'}
                        </p>
                      </div>
                      {note.isPasswordProtected ? (
                        <span className="badge badge-danger shrink-0">Locked</span>
                      ) : note.linkedTaskCount > 0 ? (
                        <span className="badge badge-primary shrink-0">{note.linkedTaskCount} {note.linkedTaskCount === 1 ? 'task' : 'tasks'}</span>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-muted text-xs">Tasks: {note.linkedTaskCount}</span>
                      <button
                        className="btn btn-danger btn-sm text-xs"
                        onClick={(e) => { e.stopPropagation(); setPendingDelete({ note, force: false }); }}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="grid gap-2">
                {items.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] hover:bg-white/60 cursor-pointer transition-colors"
                    onClick={() => navigate(`/app/notes/${note.id}`)}
                  >
                    <div className="flex-1 min-w-0 grid gap-0.5">
                      <div className="font-bold text-sm flex items-center gap-1.5">
                        {note.isPasswordProtected && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-danger shrink-0"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        )}
                        <span className="truncate">{note.title}</span>
                      </div>
                      <p className="text-muted text-[13px] truncate">
                        {note.isPasswordProtected ? 'Protected note' : note.preview || 'No preview'}
                      </p>
                    </div>
                    <span className="text-muted text-xs shrink-0">Tasks: {note.linkedTaskCount}</span>
                    <button
                      className="btn btn-danger btn-sm text-xs shrink-0"
                      onClick={(e) => { e.stopPropagation(); setPendingDelete({ note, force: false }); }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Side rail */}
          <aside className="hidden xl:grid gap-4 content-start">
            <section className="panel p-5 grid gap-4">
              <span className="eyebrow"><span className="eyebrow-dot" />quick capture</span>
              <h3 className="text-base font-extrabold">Capture first, organize second.</h3>
              <button className="btn btn-primary w-full" onClick={() => setCreateOpen(true)}>Create note</button>
              <button className="btn btn-secondary w-full" onClick={() => navigate('/app')}>Back to board</button>
            </section>
          </aside>
        </div>
      )}

      {/* Create dialog */}
      <NoteEditorDialog
        open={createOpen}
        title="Add New Note"
        submitting={createMutation.isPending}
        onClose={() => setCreateOpen(false)}
        onSave={async (payload) => {
          await createMutation.mutateAsync(payload);
          notify('Note created', 'success');
          setCreateOpen(false);
        }}
        saveLabel="Save"
      />

      {/* Delete confirm dialog */}
      {pendingDelete && (
        <>
          <div className="dialog-overlay" onClick={() => setPendingDelete(null)} />
          <div className="dialog-content panel p-6 grid gap-4">
            <h3 className="text-lg font-extrabold">
              {pendingDelete.force ? 'Delete linked note?' : 'Delete note?'}
            </h3>
            <p className="text-muted text-sm">
              {pendingDelete.force
                ? `This note is linked to ${pendingDelete.linkCount || 0} task(s). Deleting it will unlink all tasks.`
                : 'This action cannot be undone.'}
            </p>
            <div className="flex justify-end gap-2">
              <button className="btn btn-secondary" onClick={() => setPendingDelete(null)} disabled={deleteMutation.isPending}>
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
