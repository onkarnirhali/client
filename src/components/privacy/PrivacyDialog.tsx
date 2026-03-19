import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { deleteMyData, exportMyData } from '../../api/privacy';
import { useSnackbar } from '../feedback/SnackbarProvider';
import { useAuth } from '../../auth/useAuth';

type Props = {
  open: boolean;
  onClose: () => void;
};

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function PrivacyDialog({ open, onClose }: Props) {
  const { notify } = useSnackbar();
  const { logout } = useAuth();
  const [confirmation, setConfirmation] = useState('');

  useEffect(() => {
    if (!open) setConfirmation('');
  }, [open]);

  const exportMutation = useMutation({
    mutationFn: exportMyData,
    onSuccess: (payload) => {
      const date = new Date().toISOString().slice(0, 10);
      downloadJson(`my-data-export-${date}.json`, payload);
      notify('Data export downloaded', 'success');
    },
    onError: (err) => {
      notify(err instanceof Error ? err.message : 'Failed to export data', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteMyData('DELETE'),
    onSuccess: async () => {
      notify('Account deleted', 'warning');
      await logout();
    },
    onError: (err) => {
      notify(err instanceof Error ? err.message : 'Failed to delete account', 'error');
    },
  });

  const deleteDisabled = confirmation.trim() !== 'DELETE' || deleteMutation.isPending;

  if (!open) return null;

  return (
    <>
      <div className="dialog-overlay" onClick={deleteMutation.isPending ? undefined : onClose} />
      <div className="dialog-content panel p-6 grid gap-5">
        <h2 className="text-lg font-extrabold">Privacy Controls</h2>

        <div className="mini-card grid gap-3">
          <strong>Export my data</strong>
          <p className="text-muted text-[13px]">
            Download a JSON snapshot of your account profile, todos, suggestion records,
            provider links, and recent audit events.
          </p>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? 'Preparing export...' : 'Download JSON export'}
          </button>
        </div>

        <div className="p-4 rounded-[var(--radius-md)] border border-danger/20 bg-danger-soft/30 grid gap-3">
          <strong className="text-danger">Delete account and data</strong>
          <div className="text-sm text-[#815224] bg-accent-soft p-2 rounded-[var(--radius-xs)]">
            This permanently removes your account and user-owned data. This action cannot be undone.
          </div>
          <div className="grid gap-1.5">
            <label className="field-label">Type DELETE to confirm</label>
            <input
              className="input"
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              autoComplete="off"
            />
          </div>
          <button
            className="btn btn-danger btn-sm"
            disabled={deleteDisabled}
            onClick={() => deleteMutation.mutate()}
          >
            {deleteMutation.isPending ? 'Deleting account...' : 'Permanently delete account'}
          </button>
        </div>

        <div className="flex justify-end">
          <button className="btn btn-secondary" onClick={onClose} disabled={deleteMutation.isPending}>
            Close
          </button>
        </div>
      </div>
    </>
  );
}
