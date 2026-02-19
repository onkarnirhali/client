import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
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

  return (
    <Dialog open={open} onClose={deleteMutation.isPending ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Privacy Controls</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'rgba(15,17,26,0.08)',
              borderRadius: 2,
              p: 2.5,
              display: 'grid',
              gap: 1.5,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Export my data
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Download a JSON snapshot of your account profile, todos, suggestion records, provider links, and recent audit events.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? 'Preparing export...' : 'Download JSON export'}
            </Button>
          </Box>

          <Box
            sx={{
              border: '1px solid',
              borderColor: 'rgba(180, 35, 24, 0.22)',
              backgroundColor: 'rgba(244, 67, 54, 0.03)',
              borderRadius: 2,
              p: 2.5,
              display: 'grid',
              gap: 1.5,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'error.main' }}>
              Delete account and data
            </Typography>
            <Alert severity="warning">
              This permanently removes your account and user-owned data. This action cannot be undone.
            </Alert>
            <TextField
              label="Type DELETE to confirm"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              autoComplete="off"
              fullWidth
              size="small"
            />
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteForeverIcon />}
              disabled={deleteDisabled}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? 'Deleting account...' : 'Permanently delete account'}
            </Button>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={deleteMutation.isPending}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
