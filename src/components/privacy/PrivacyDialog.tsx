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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="dialog-overlay absolute inset-0" onClick={deleteMutation.isPending ? undefined : onClose} />
      <div className="relative bg-white rounded-2xl border border-gray-200/60 shadow-2xl w-full max-w-md">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold">Privacy Controls</h2>
          <button onClick={onClose} disabled={deleteMutation.isPending} className="text-muted hover:text-text p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200/60 p-4 grid gap-3">
            <strong className="text-sm">Export my data</strong>
            <p className="text-muted text-[13px]">
              Download a JSON snapshot of your account profile, todos, suggestion records,
              provider links, and recent audit events.
            </p>
            <button
              className="px-3 py-1.5 text-xs font-medium text-muted border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-fit"
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? 'Preparing export...' : 'Download JSON export'}
            </button>
          </div>

          <div className="p-4 rounded-xl border border-red-200/40 bg-red-50/30 grid gap-3">
            <strong className="text-red-600 text-sm">Delete account and data</strong>
            <div className="text-sm text-amber-800 bg-amber-50 p-2 rounded-lg">
              This permanently removes your account and user-owned data. This action cannot be undone.
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Type DELETE to confirm</label>
              <input
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                type="text"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                autoComplete="off"
              />
            </div>
            <button
              className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-fit disabled:opacity-50"
              disabled={deleteDisabled}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? 'Deleting account...' : 'Permanently delete account'}
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-[#f6f6f8]/50 flex justify-end rounded-b-2xl">
          <button className="px-4 py-2.5 text-sm font-medium text-muted border border-gray-200 rounded-[10px] hover:bg-white transition-colors" onClick={onClose} disabled={deleteMutation.isPending}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
