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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Notes</h1>
          <p className="text-sm text-muted mt-0.5">Your personal notes and documentation.</p>
        </div>
        <button
          className="inline-flex items-center gap-2 bg-primary text-white rounded-[10px] px-4 py-2.5 text-sm font-semibold hover:bg-primary-strong transition-colors shadow-sm self-start sm:self-auto"
          onClick={() => setCreateOpen(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
          Add New Note
        </button>
      </div>

      {/* Search & View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5f6571" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex border border-gray-200 rounded-[10px] overflow-hidden self-start">
          <button
            className={`px-3 py-2.5 transition-colors ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-gray-50'}`}
            onClick={() => handleChangeView('list')}
            title="List view"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
          <button
            className={`px-3 py-2.5 border-l border-gray-200 transition-colors ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-gray-50'}`}
            onClick={() => handleChangeView('grid')}
            title="Grid view"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[10px] p-4 text-red-700 text-sm font-medium">
          Failed to load notes.
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && items.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200/60 p-8 text-center grid gap-3">
          <h3 className="text-lg font-bold">No notes yet</h3>
          <p className="text-muted text-sm">Create your first note to get started.</p>
          <div className="flex justify-center">
            <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>Add New Note</button>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      {!isLoading && items.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-xl border border-gray-200/60 hover:shadow-md hover:border-primary/20 transition-all duration-150 cursor-pointer group"
              onClick={() => navigate(`/app/notes/${note.id}`)}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold leading-snug">{note.title}</h3>
                    {note.isPasswordProtected && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5f6571" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    )}
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 text-muted hover:text-danger transition-all p-1 -mr-1"
                    title="Delete"
                    onClick={(e) => { e.stopPropagation(); setPendingDelete({ note, force: false }); }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-muted leading-relaxed line-clamp-3 mb-4">
                  {note.isPasswordProtected ? <em>Protected note — preview hidden</em> : note.preview || 'No preview'}
                </p>
                <div className="flex items-center gap-2">
                  {note.linkedTaskCount > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                      {note.linkedTaskCount} {note.linkedTaskCount === 1 ? 'task' : 'tasks'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-muted px-2 py-0.5 rounded-full font-medium">
                      0 tasks
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notes List */}
      {!isLoading && items.length > 0 && viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-gray-200/60 divide-y divide-gray-100">
          {items.map((note) => (
            <div
              key={note.id}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
              onClick={() => navigate(`/app/notes/${note.id}`)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm truncate">{note.title}</span>
                  {note.isPasswordProtected && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5f6571" strokeWidth="2" strokeLinecap="round" className="shrink-0"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  )}
                </div>
                <p className="text-muted text-xs truncate">
                  {note.isPasswordProtected ? 'Protected note' : note.preview || 'No preview'}
                </p>
              </div>
              <span className="text-muted text-xs shrink-0">{note.linkedTaskCount} {note.linkedTaskCount === 1 ? 'task' : 'tasks'}</span>
              <button
                className="opacity-0 group-hover:opacity-100 text-muted hover:text-danger transition-all p-1 shrink-0"
                onClick={(e) => { e.stopPropagation(); setPendingDelete({ note, force: false }); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 mx-auto border-3 border-primary border-t-transparent rounded-full animate-spin" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="dialog-overlay absolute inset-0" onClick={() => setPendingDelete(null)} />
          <div className="relative bg-white rounded-2xl border border-gray-200/60 shadow-2xl w-full max-w-sm p-6 grid gap-4">
            <h3 className="text-lg font-bold">
              {pendingDelete.force ? 'Delete linked note?' : 'Delete note?'}
            </h3>
            <p className="text-muted text-sm">
              {pendingDelete.force
                ? `This note is linked to ${pendingDelete.linkCount || 0} task(s). Deleting it will unlink all tasks.`
                : 'This action cannot be undone.'}
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2.5 text-sm font-medium text-muted border border-gray-200 rounded-[10px] hover:bg-gray-50 transition-colors"
                onClick={() => setPendingDelete(null)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-[10px] hover:bg-red-700 transition-colors"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
