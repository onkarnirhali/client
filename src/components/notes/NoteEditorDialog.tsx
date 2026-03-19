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
    <>
      <div className="dialog-overlay" onClick={submitting ? undefined : onClose} />
      <div className="dialog-content panel p-6 grid gap-5" style={{ width: 'min(720px, calc(100% - 32px))' }}>
        <h2 className="text-lg font-extrabold">{title}</h2>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <label className="field-label">Title</label>
            <input
              className={`input ${error && !noteTitle.trim() ? 'border-danger' : ''}`}
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              autoFocus
              placeholder="Note title"
            />
          </div>

          <NoteEditor value={content} onChange={setContent} editable />

          <div className="grid gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
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
                <div className="grid gap-1.5">
                  <label className="field-label">Password</label>
                  <input
                    className={`input ${passwordTooShort && password.length > 0 ? 'border-danger' : ''}`}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {passwordTooShort && password.length > 0 && <span className="text-danger text-xs">Min 6 characters</span>}
                </div>
                <div className="grid gap-1.5">
                  <label className="field-label">Confirm Password</label>
                  <input
                    className={`input ${passwordMismatch && confirmPassword.length > 0 ? 'border-danger' : ''}`}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {passwordMismatch && confirmPassword.length > 0 && <span className="text-danger text-xs">Passwords do not match</span>}
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={disableSave}>{saveLabel}</button>
        </div>
      </div>
    </>
  );
}

