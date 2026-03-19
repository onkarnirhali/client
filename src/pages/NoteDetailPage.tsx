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
    <div className="grid gap-6">
      {/* Loading */}
      {isLoading && (
        <div className="text-muted text-sm py-8 text-center">Loading note...</div>
      )}

      {/* Error */}
      {error && (
        <div className="panel p-4 border-danger/20 bg-danger-soft text-danger text-sm font-bold">
          Failed to load note.
        </div>
      )}

      {!isLoading && !error && data && (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
          {/* Editor */}
          <div className="editor-card grid gap-5">
            <div className="grid gap-1.5">
              <label className="field-label">Title</label>
              <input
                className="input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!editMode}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="chip">Owner: You</span>
              {data.isPasswordProtected && <span className="badge badge-danger">Password protected</span>}
            </div>

            <NoteEditor
              value={(content || EMPTY_NOTE_CONTENT) as NoteContent}
              onChange={setContent}
              editable={editMode}
            />

            {editMode && (
              <div className="grid gap-4 pt-2 border-t border-border">
                <div className="grid gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
                    <input
                      type="checkbox"
                      checked={protectionEnabled}
                      onChange={(e) => setProtectionEnabled(e.target.checked)}
                      className="accent-primary w-4 h-4"
                    />
                    Password Protect
                  </label>

                  {enablingProtection && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      <div className="grid gap-1.5">
                        <label className="field-label">Password</label>
                        <input
                          className={`input ${passwordTooShort ? 'border-danger' : ''}`}
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        {passwordTooShort && <span className="text-danger text-xs">Min 6 characters</span>}
                      </div>
                      <div className="grid gap-1.5">
                        <label className="field-label">Confirm Password</label>
                        <input
                          className={`input ${passwordMismatch ? 'border-danger' : ''}`}
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        {passwordMismatch && <span className="text-danger text-xs">Passwords do not match</span>}
                      </div>
                    </div>
                  )}

                  {disablingProtection && (
                    <div className="grid gap-1.5 mt-2 max-w-sm">
                      <label className="field-label">Current Password</label>
                      <input
                        className="input"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button className="btn btn-primary" onClick={handleSave} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Saving...' : 'Save changes'}
                  </button>
                  <button className="btn btn-secondary" onClick={() => {
                    if (data) {
                      setTitle(data.title);
                      setContent((data.content || EMPTY_NOTE_CONTENT) as NoteContent);
                      setProtectionEnabled(Boolean(data.isPasswordProtected));
                      setPassword('');
                      setConfirmPassword('');
                      setCurrentPassword('');
                      setEditMode(false);
                    }
                  }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Side rail */}
          <aside className="grid gap-4 content-start">
            <section className="panel p-5 grid gap-4">
              <div className="flex items-center justify-between gap-2">
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/app/notes')}>Back to notes</button>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app')}>Board</button>
              </div>
              <div className="flex items-center gap-2">
                <span className="field-label">Edit mode</span>
                <button
                  onClick={() => setEditMode(!editMode)}
                  disabled={needsUnlock}
                  className={`switch-el ${editMode ? 'on' : ''}`}
                  role="switch"
                  aria-checked={editMode}
                />
              </div>
            </section>

            {data.linkedTaskCount > 0 && (
              <section className="panel p-5 grid gap-3">
                <span className="eyebrow"><span className="eyebrow-dot" />linked tasks</span>
                <h3 className="text-sm font-extrabold">Task context stays beside the note.</h3>
                <p className="text-muted text-sm">{data.linkedTaskCount} linked task{data.linkedTaskCount !== 1 ? 's' : ''}</p>
              </section>
            )}

            <section className="panel p-5 grid gap-3">
              <span className="eyebrow"><span className="eyebrow-dot" />protection</span>
              <h3 className="text-sm font-extrabold">Security controls stay in context.</h3>
              <div className="flex flex-wrap gap-2">
                {data.isPasswordProtected ? (
                  <span className="badge badge-danger">Enabled</span>
                ) : (
                  <span className="badge badge-primary">Disabled</span>
                )}
                <span className="chip text-xs">Require password to open</span>
              </div>
            </section>
          </aside>
        </div>
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
