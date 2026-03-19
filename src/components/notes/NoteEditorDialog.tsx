import { useEffect, useState } from 'react';
import { EMPTY_NOTE_CONTENT, NoteEditor } from './NoteEditor';
import { NoteContent, NoteInput } from '../../features/notes';

type Props = {
  open: boolean;
  title?: string;
  initialTitle?: string;
  initialContent?: NoteContent;
  onClose: () => void;
  onSave: (payload: NoteInput) => Promise<void> | void;
  submitting?: boolean;
  saveLabel?: string;
};

export function NoteEditorDialog({
  open,
  title = 'New Note',
  initialTitle = '',
  initialContent = EMPTY_NOTE_CONTENT,
  onClose,
  onSave,
  submitting = false,
  saveLabel = 'Save',
}: Props) {
  const [noteTitle, setNoteTitle] = useState(initialTitle);
  const [content, setContent] = useState<NoteContent>(initialContent);
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setNoteTitle(initialTitle || '');
    setContent(initialContent || EMPTY_NOTE_CONTENT);
    setPasswordProtected(false);
    setPassword('');
    setConfirmPassword('');
    setError(null);
  }, [open, initialTitle, initialContent]);

  const passwordMismatch = passwordProtected && password !== confirmPassword;
  const passwordTooShort = passwordProtected && password.length < 6;
  const disableSave = submitting || !noteTitle.trim() || passwordMismatch || passwordTooShort;

  const handleSave = async () => {
    if (!noteTitle.trim()) {
      setError('Title is required');
      return;
    }
    if (passwordProtected) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }
    setError(null);
    await onSave({
      title: noteTitle.trim(),
      content: content || EMPTY_NOTE_CONTENT,
      ...(passwordProtected ? { passwordProtection: { enabled: true, password } } : {}),
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="dialog-overlay absolute inset-0" onClick={submitting ? undefined : onClose} />
      <div className="relative bg-white rounded-2xl border border-gray-200/60 shadow-2xl w-full max-h-[90vh] overflow-y-auto" style={{ maxWidth: '720px' }}>
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} disabled={submitting} className="text-muted hover:text-text p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Title <span className="text-red-500">*</span></label>
            <input
              className={`w-full px-3 py-2.5 text-sm border rounded-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${error && !noteTitle.trim() ? 'border-red-400' : 'border-gray-200'}`}
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              autoFocus
              placeholder="Note title"
            />
          </div>

          <NoteEditor value={content} onChange={setContent} editable />

          <div className="grid gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              <input
                type="checkbox"
                checked={passwordProtected}
                onChange={(e) => setPasswordProtected(e.target.checked)}
                className="accent-primary w-4 h-4"
              />
              Password Protect
            </label>
            {passwordProtected && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Password</label>
                  <input
                    className={`w-full px-3 py-2.5 text-sm border rounded-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${passwordTooShort && password.length > 0 ? 'border-red-400' : 'border-gray-200'}`}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {passwordTooShort && password.length > 0 && <span className="text-red-500 text-xs">Min 6 characters</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
                  <input
                    className={`w-full px-3 py-2.5 text-sm border rounded-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${passwordMismatch && confirmPassword.length > 0 ? 'border-red-400' : 'border-gray-200'}`}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {passwordMismatch && confirmPassword.length > 0 && <span className="text-red-500 text-xs">Passwords do not match</span>}
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-[#f6f6f8]/50 flex justify-end gap-3 rounded-b-2xl">
          <button className="px-4 py-2.5 text-sm font-medium text-muted border border-gray-200 rounded-[10px] hover:bg-white transition-colors" onClick={onClose} disabled={submitting}>Cancel</button>
          <button className="px-6 py-2.5 text-sm font-semibold bg-primary text-white rounded-[10px] hover:opacity-90 transition-colors shadow-sm" onClick={handleSave} disabled={disableSave}>{saveLabel}</button>
        </div>
      </div>
    </div>
  );
}

