import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';

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

  return (
    <Dialog open={open} fullWidth maxWidth="xs" disableEscapeKeyDown>
      <DialogTitle>Unlock Note</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            This note is password protected. Enter the password to continue.
          </Typography>
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
          />
          {error && (
            <Typography color="error.main" variant="body2">
              {error}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleUnlock} variant="contained" disabled={loading || !password.trim()}>
          {loading ? 'Verifying...' : 'Unlock'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

