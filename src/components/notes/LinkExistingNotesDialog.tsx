import { useEffect, useMemo, useState } from 'react';
import { NoteSummary, useNotes } from '../../features/notes';

type Props = {
  open: boolean;
  linkedNoteIds: number[];
  onClose: () => void;
  onLink: (notes: NoteSummary[]) => void;
};

export function LinkExistingNotesDialog({ open, linkedNoteIds, onClose, onLink }: Props) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const { data, isLoading } = useNotes({ limit: 200, offset: 0 });
  const items = data?.items || [];

  useEffect(() => {
    if (!open) return;
    setSearch('');
    setSelected(new Set());
  }, [open]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((item) => item.title.toLowerCase().includes(q));
  }, [items, search]);

  const linkedSet = useMemo(() => new Set(linkedNoteIds), [linkedNoteIds]);
  const selectedItems = useMemo(
    () => items.filter((item) => selected.has(item.id)),
    [items, selected]
  );

  if (!open) return null;

  return (
    <>
      <div className="dialog-overlay" onClick={onClose} />
      <div className="dialog-content panel p-6 grid gap-4">
        <h2 className="text-lg font-extrabold">Link Existing Notes</h2>

        <div className="grid gap-1.5">
          <label className="field-label">Search notes by title</label>
          <input
            className="input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
          />
        </div>

        <div className="max-h-[360px] overflow-y-auto grid gap-1">
          {isLoading && <p className="text-muted text-sm">Loading notes...</p>}
          {!isLoading && filtered.length === 0 && <p className="text-muted text-sm">No notes found.</p>}
          {!isLoading && filtered.map((note) => {
            const isLinked = linkedSet.has(note.id);
            return (
              <label
                key={note.id}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-xs)] cursor-pointer hover:bg-white/60 ${isLinked ? 'opacity-50' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(note.id)}
                  disabled={isLinked}
                  onChange={(e) => {
                    setSelected((prev) => {
                      const next = new Set(prev);
                      if (e.target.checked) next.add(note.id);
                      else next.delete(note.id);
                      return next;
                    });
                  }}
                  className="accent-primary w-4 h-4"
                />
                <span className="flex items-center gap-1.5 text-sm">
                  {note.isPasswordProtected && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-danger"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  )}
                  {note.title}
                  {isLinked && <span className="text-muted text-xs">(Already linked)</span>}
                </span>
              </label>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            disabled={!selectedItems.length}
            onClick={() => { onLink(selectedItems); onClose(); }}
          >
            Link
          </button>
        </div>
      </div>
    </>
  );
}

