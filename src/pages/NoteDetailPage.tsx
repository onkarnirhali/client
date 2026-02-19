import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
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
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/app/notes')}>
            Back to Notes
          </Button>
          <Button variant="outlined" startIcon={<HomeIcon />} onClick={() => navigate('/app')}>
            Dashboard
          </Button>
        </Stack>
        {data && (
          <FormControlLabel
            control={(
              <Switch
                checked={editMode}
                onChange={(event) => setEditMode(event.target.checked)}
                disabled={needsUnlock}
              />
            )}
            label="Edit mode"
          />
        )}
      </Box>

      {isLoading && <Typography color="text.secondary">Loading note...</Typography>}
      {error && <Typography color="error.main">Failed to load note.</Typography>}
      {!isLoading && !error && data && (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'rgba(15,17,26,0.08)', borderRadius: 3, p: 3 }}>
          <Stack spacing={2}>
            <TextField
              label="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={!editMode}
            />
            <NoteEditor
              value={(content || EMPTY_NOTE_CONTENT) as NoteContent}
              onChange={setContent}
              editable={editMode}
            />

            {editMode && (
              <>
                <Divider />
                <Stack spacing={1.5}>
                  <FormControlLabel
                    control={(
                      <Checkbox
                        checked={protectionEnabled}
                        onChange={(event) => setProtectionEnabled(event.target.checked)}
                      />
                    )}
                    label="Password Protect"
                  />
                  {enablingProtection && (
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                      <TextField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        error={passwordTooShort}
                        helperText={passwordTooShort ? 'Min 6 characters' : ' '}
                        fullWidth
                      />
                      <TextField
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        error={passwordMismatch}
                        helperText={passwordMismatch ? 'Passwords do not match' : ' '}
                        fullWidth
                      />
                    </Stack>
                  )}
                  {disablingProtection && (
                    <TextField
                      label="Current Password"
                      type="password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                    />
                  )}
                </Stack>
                <Box>
                  <Button variant="contained" onClick={handleSave} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </Box>
              </>
            )}
          </Stack>
        </Paper>
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
    </Stack>
  );
}

