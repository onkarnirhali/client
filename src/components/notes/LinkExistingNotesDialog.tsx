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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="dialog-overlay absolute inset-0" onClick={onClose} />
      <div className="relative bg-white rounded-2xl border border-gray-200/60 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold">Link Existing Notes</h2>
          <button onClick={onClose} className="text-muted hover:text-text p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <input
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes by title..."
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
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 ${isLinked ? 'opacity-50' : ''}`}
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
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-red-500"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    )}
                    {note.title}
                    {isLinked && <span className="text-muted text-xs">(Already linked)</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-[#f6f6f8]/50 flex justify-end gap-3 rounded-b-2xl">
          <button className="px-4 py-2.5 text-sm font-medium text-muted border border-gray-200 rounded-[10px] hover:bg-white transition-colors" onClick={onClose}>Cancel</button>
          <button
            className="px-6 py-2.5 text-sm font-semibold bg-primary text-white rounded-[10px] hover:opacity-90 transition-colors shadow-sm"
            disabled={!selectedItems.length}
            onClick={() => { onLink(selectedItems); onClose(); }}
          >
            Link
          </button>
        </div>
      </div>
    </div>
  );
}

