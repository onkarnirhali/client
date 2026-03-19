import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HttpError } from '../api/http';
import { useSnackbar } from '../components/feedback/SnackbarProvider';
import { NoteEditor, NoteUnlockDialog, EMPTY_NOTE_CONTENT } from '../components/notes';
import { NoteContent, useNote, useOpenProtectedNote, useUpdateNote } from '../features/notes';

export function NoteDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const navigate = useNavigate();
  const { notify } = useSnackbar();
  const { data, isLoading, error } = useNote(id);
  const openMutation = useOpenProtectedNote(id);
  const updateMutation = useUpdateNote(id, { limit: 200, offset: 0 });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState<NoteContent>(EMPTY_NOTE_CONTENT);
  const [editMode, setEditMode] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [protectionEnabled, setProtectionEnabled] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  useEffect(() => {
    if (!data) return;
    setTitle(data.title);
    setContent((data.content || EMPTY_NOTE_CONTENT) as NoteContent);
    setProtectionEnabled(Boolean(data.isPasswordProtected));
    setEditMode(false);
    setPassword('');
    setConfirmPassword('');
    setCurrentPassword('');
  }, [data]);

  const passwordTooShort = useMemo(
    () => !data?.isPasswordProtected && protectionEnabled && password.length > 0 && password.length < 6,
    [data?.isPasswordProtected, protectionEnabled, password]
  );
  const passwordMismatch = useMemo(
    () => !data?.isPasswordProtected && protectionEnabled && confirmPassword.length > 0 && password !== confirmPassword,
    [data?.isPasswordProtected, protectionEnabled, password, confirmPassword]
  );
  const disablingProtection = data?.isPasswordProtected && !protectionEnabled;
  const enablingProtection = !data?.isPasswordProtected && protectionEnabled;

  const handleSave = async () => {
    if (!data) return;
    if (!title.trim()) {
      notify('Title is required', 'error');
      return;
    }

    if (enablingProtection) {
      if (password.length < 6) {
        notify('Password must be at least 6 characters', 'error');
        return;
      }
      if (password !== confirmPassword) {
        notify('Passwords do not match', 'error');
        return;
      }
    }

    if (disablingProtection && !currentPassword.trim()) {
      notify('Current password is required to disable protection', 'error');
      return;
    }

    const payload: any = {
      title: title.trim(),
      content,
    };
    if (enablingProtection) {
      payload.passwordProtection = {
        enabled: true,
        password,
      };
    } else if (disablingProtection) {
      payload.passwordProtection = {
        enabled: false,
        currentPassword,
      };
    }

    try {
      await updateMutation.mutateAsync(payload);
      notify('Note updated', 'success');
      setEditMode(false);
      setPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to save note', 'error');
    }
  };

  const needsUnlock = Boolean(data?.requiresUnlock && data?.isPasswordProtected);

  return (
    <div className="max-w-4xl mx-auto grid gap-6">
      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 mx-auto border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[10px] p-4 text-red-700 text-sm font-medium">
          Failed to load note.
        </div>
      )}

      {!isLoading && !error && data && (
        <>
          {/* Top Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/app/notes')}
                className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors border border-gray-200 rounded-[10px] px-3 py-2 hover:bg-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                Back to Notes
              </button>
              <button
                onClick={() => navigate('/app')}
                className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors border border-gray-200 rounded-[10px] px-3 py-2 hover:bg-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Dashboard
              </button>
            </div>
            {/* Edit Toggle */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <span className={`text-sm ${!editMode ? 'font-semibold text-text' : 'text-muted'}`}>View</span>
              <button
                onClick={() => !needsUnlock && setEditMode(!editMode)}
                disabled={needsUnlock}
                className={`switch-el ${editMode ? 'on' : ''}`}
                role="switch"
                aria-checked={editMode}
              />
              <span className={`text-sm ${editMode ? 'font-semibold text-primary' : 'text-muted'}`}>Edit</span>
            </div>
          </div>

          {/* Note Editor Card */}
          <div className="editor-card">
            {/* Title */}
            <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!editMode}
                className="w-full text-xl font-bold bg-transparent border-0 border-b-2 border-gray-100 focus:border-primary pb-3 focus:outline-none transition-colors placeholder:text-gray-300"
                placeholder="Note title..."
              />
            </div>

            {/* Rich Text Editor */}
            <div className="px-5 sm:px-6 pb-2">
              <NoteEditor
                value={(content || EMPTY_NOTE_CONTENT) as NoteContent}
                onChange={setContent}
                editable={editMode}
              />
            </div>

            {/* Password Protection Section */}
            {editMode && (
              <>
                <div className="mx-5 sm:mx-6 border-t border-gray-100 my-2" />
                <div className="px-5 sm:px-6 py-4">
                  <label className="flex items-center gap-3 mb-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={protectionEnabled}
                      onChange={(e) => setProtectionEnabled(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/30 cursor-pointer accent-primary"
                    />
                    <span className="text-sm font-medium flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Password Protect this Note
                    </span>
                  </label>

                  {enablingProtection && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-7">
                      <div>
                        <label className="block text-xs font-medium text-muted mb-1.5">Password</label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className={`input ${passwordTooShort ? 'border-danger' : ''}`}
                        />
                        {passwordTooShort && <span className="text-danger text-xs mt-1 block">Min 6 characters</span>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted mb-1.5">Confirm Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className={`input ${passwordMismatch ? 'border-danger' : ''}`}
                        />
                        {passwordMismatch && <span className="text-danger text-xs mt-1 block">Passwords do not match</span>}
                      </div>
                    </div>
                  )}

                  {disablingProtection && (
                    <div className="grid gap-1.5 pl-7 max-w-sm">
                      <label className="block text-xs font-medium text-muted mb-1.5">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="input"
                        placeholder="Enter current password"
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Footer / Save */}
            {editMode && (
              <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                <button
                  className="px-4 py-2.5 text-sm font-medium text-muted border border-gray-200 rounded-[10px] hover:bg-white transition-colors"
                  onClick={() => {
                    if (data) {
                      setTitle(data.title);
                      setContent((data.content || EMPTY_NOTE_CONTENT) as NoteContent);
                      setProtectionEnabled(Boolean(data.isPasswordProtected));
                      setPassword('');
                      setConfirmPassword('');
                      setCurrentPassword('');
                      setEditMode(false);
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2.5 text-sm font-semibold bg-primary text-white rounded-[10px] hover:bg-primary-strong transition-colors shadow-sm"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <NoteUnlockDialog
        open={needsUnlock}
        loading={openMutation.isPending}
        error={unlockError}
        onUnlock={async (notePassword) => {
          setUnlockError(null);
          try {
            await openMutation.mutateAsync(notePassword);
          } catch (err) {
            if (err instanceof HttpError && err.status === 401) {
              setUnlockError('Incorrect password');
              return;
            }
            setUnlockError(err instanceof Error ? err.message : 'Unable to unlock note');
          }
        }}
      />
    </div>
  );
}
