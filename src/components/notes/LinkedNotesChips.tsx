export type LinkedNoteChip = {
  key: string;
  label: string;
  isPasswordProtected?: boolean;
  isNew?: boolean;
};

type Props = {
  items: LinkedNoteChip[];
  onRemove: (key: string) => void;
  disabled?: boolean;
};

export function LinkedNotesChips({ items, onRemove, disabled = false }: Props) {
  if (!items.length) return null;
  return (
    <div className="grid gap-2 mt-2">
      <span className="field-label">Linked Notes</span>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item.key} className="chip gap-1.5">
            {item.isPasswordProtected && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-danger"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            )}
            {item.label}{item.isNew ? ' (new)' : ''}
            {!disabled && (
              <button
                onClick={() => onRemove(item.key)}
                className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

