import { useState } from 'react';

type Props = {
  disabled?: boolean;
  onNewNote: () => void;
  onLinkExisting: () => void;
};

export function AddNotesMenuButton({ disabled = false, onNewNote, onLinkExisting }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => setMenuOpen(!menuOpen)}
        disabled={disabled}
      >
        Add Notes
      </button>
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-full mt-1 w-48 panel p-1.5 z-50 grid gap-0.5">
            <button
              className="text-left px-3 py-2 rounded-[var(--radius-xs)] hover:bg-white/60 text-sm font-bold cursor-pointer"
              onClick={() => { setMenuOpen(false); onNewNote(); }}
            >
              New Note
            </button>
            <button
              className="text-left px-3 py-2 rounded-[var(--radius-xs)] hover:bg-white/60 text-sm font-bold cursor-pointer"
              onClick={() => { setMenuOpen(false); onLinkExisting(); }}
            >
              Link Existing Notes
            </button>
          </div>
        </>
      )}
    </div>
  );
}

