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
        className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
        onClick={() => setMenuOpen(!menuOpen)}
        disabled={disabled}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
        Link existing note or create new
      </button>
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-xl border border-gray-200/60 shadow-lg p-1.5 z-50 grid gap-0.5">
            <button
              className="text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium cursor-pointer transition-colors"
              onClick={() => { setMenuOpen(false); onNewNote(); }}
            >
              New Note
            </button>
            <button
              className="text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium cursor-pointer transition-colors"
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

