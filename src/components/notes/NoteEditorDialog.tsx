import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
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

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Title"
            value={noteTitle}
            onChange={(event) => setNoteTitle(event.target.value)}
            autoFocus
            error={Boolean(error && !noteTitle.trim())}
          />
          <NoteEditor value={content} onChange={setContent} editable />
          <Box>
            <FormControlLabel
              control={(
                <Checkbox
                  checked={passwordProtected}
                  onChange={(event) => setPasswordProtected(event.target.checked)}
                />
              )}
              label="Password Protect"
            />
            {passwordProtected && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1 }}>
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  fullWidth
                  error={passwordTooShort && password.length > 0}
                  helperText={passwordTooShort ? 'Min 6 characters' : ' '}
                />
                <TextField
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  fullWidth
                  error={passwordMismatch && confirmPassword.length > 0}
                  helperText={passwordMismatch ? 'Passwords do not match' : ' '}
                />
              </Stack>
            )}
          </Box>
          {error && (
            <Typography color="error.main" variant="body2">
              {error}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={disableSave}>
          {saveLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

