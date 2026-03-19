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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="dialog-overlay absolute inset-0" />
      <div className="relative bg-white rounded-2xl border border-gray-200/60 shadow-2xl w-full max-w-sm p-6 grid gap-4">
        <h2 className="text-lg font-bold">Unlock Note</h2>
        <p className="text-muted text-sm">This note is password protected. Enter the password to continue.</p>
        <div>
          <label className="block text-sm font-medium mb-1.5">Password</label>
          <input
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end">
          <button
            className="px-6 py-2.5 text-sm font-semibold bg-primary text-white rounded-[10px] hover:opacity-90 transition-colors shadow-sm"
            onClick={handleUnlock}
            disabled={loading || !password.trim()}
          >
            {loading ? 'Verifying...' : 'Unlock'}
          </button>
        </div>
      </div>
    </div>
  );
}

