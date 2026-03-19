import { useEffect, useState } from 'react';

type Props = {
  open: boolean;
  loading?: boolean;
  error?: string | null;
  onUnlock: (password: string) => Promise<void> | void;
};

export function NoteUnlockDialog({ open, loading = false, error, onUnlock }: Props) {
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!open) return;
    setPassword('');
  }, [open]);

  const handleUnlock = async () => {
    if (!password.trim()) return;
    await onUnlock(password);
  };

  if (!open) return null;

  return (
    <>
      <div className="dialog-overlay" />
      <div className="dialog-content panel p-6 grid gap-4" style={{ width: 'min(400px, calc(100% - 32px))' }}>
        <h2 className="text-lg font-extrabold">Unlock Note</h2>
        <p className="text-muted text-sm">This note is password protected. Enter the password to continue.</p>
        <div className="grid gap-1.5">
          <label className="field-label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
          />
        </div>
        {error && <p className="text-danger text-sm">{error}</p>}
        <div className="flex justify-end">
          <button className="btn btn-primary" onClick={handleUnlock} disabled={loading || !password.trim()}>
            {loading ? 'Verifying...' : 'Unlock'}
          </button>
        </div>
      </div>
    </>
  );
}

