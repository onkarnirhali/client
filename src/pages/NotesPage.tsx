import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LockIcon from '@mui/icons-material/Lock';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { HttpError } from '../api/http';
import { useSnackbar } from '../components/feedback/SnackbarProvider';
import { NoteEditorDialog } from '../components/notes';
import {
  NoteSummary,
  NoteViewMode,
  useCreateNote,
  useDeleteNote,
  useNotes,
  useUpdateNotePreference,
} from '../features/notes';

type PendingDelete = {
  note: NoteSummary;
  force: boolean;
  linkCount?: number;
};

export function NotesPage() {
  const navigate = useNavigate();
  const { notify } = useSnackbar();
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<NoteViewMode>('list');
  const [viewModeLoaded, setViewModeLoaded] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const listQuery = useMemo(() => ({ q: query.trim(), limit: 200, offset: 0 }), [query]);
  const { data, isLoading, error } = useNotes(listQuery);
  const createMutation = useCreateNote(listQuery);
  const deleteMutation = useDeleteNote(listQuery);
  const preferenceMutation = useUpdateNotePreference(listQuery);

  useEffect(() => {
    if (viewModeLoaded) return;
    if (!data?.viewMode) return;
    setViewMode(data.viewMode);
    setViewModeLoaded(true);
  }, [data?.viewMode, viewModeLoaded]);

  const items = data?.items || [];

  const handleChangeView = async (next: NoteViewMode) => {
    const previous = viewMode;
    setViewMode(next);
    try {
      await preferenceMutation.mutateAsync(next);
    } catch (err) {
      setViewMode(previous);
      notify(err instanceof Error ? err.message : 'Failed to save view preference', 'error');
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMutation.mutateAsync({ id: pendingDelete.note.id, force: pendingDelete.force });
      notify('Note deleted', 'success');
      setPendingDelete(null);
    } catch (err) {
      if (err instanceof HttpError && err.status === 409 && err.code === 'NOTE_LINKED') {
        const linkCount = Number((err.data as any)?.error?.linkCount || 0);
        setPendingDelete((current) => (current ? { ...current, force: true, linkCount } : current));
        return;
      }
      notify(err instanceof Error ? err.message : 'Failed to delete note', 'error');
    }
  };

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Stack spacing={0.5}>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Notes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage your personal notes.
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/app')}>
            Back to Dashboard
          </Button>
          <Button variant="contained" onClick={() => setCreateOpen(true)}>
            Add New Note
          </Button>
        </Stack>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'rgba(15,17,26,0.08)', borderRadius: 3, p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
          <TextField
            label="Search notes"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            sx={{ minWidth: { md: 320 } }}
          />
          <ToggleButtonGroup
            exclusive
            size="small"
            value={viewMode}
            onChange={(_, next) => {
              if (next) handleChangeView(next as NoteViewMode);
            }}
          >
            <ToggleButton value="list">
              <ViewListIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="grid">
              <GridViewIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Paper>

      {error && (
        <Paper elevation={0} sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 2 }}>
          Failed to load notes.
        </Paper>
      )}

      {!isLoading && !error && items.length === 0 && (
        <Paper elevation={0} sx={{ p: 5, textAlign: 'center', border: '1px solid', borderColor: 'rgba(15,17,26,0.08)', borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            No notes yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Create your first note to get started.
          </Typography>
        </Paper>
      )}

      {!isLoading && items.length > 0 && viewMode === 'list' && (
        <Stack spacing={1.25}>
          {items.map((note) => (
            <Paper
              key={note.id}
              elevation={0}
              sx={{
                p: 1.5,
                border: '1px solid',
                borderColor: 'rgba(15,17,26,0.08)',
                borderRadius: 2,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                <CardActionArea
                  onClick={() => navigate(`/app/notes/${note.id}`)}
                  sx={{ borderRadius: 1, p: 1, flex: 1, textAlign: 'left' }}
                >
                  <Stack spacing={0.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {note.isPasswordProtected && <LockIcon fontSize="small" color="action" />}
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {note.title}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {note.isPasswordProtected ? 'Protected note preview hidden' : note.preview || 'No preview available'}
                    </Typography>
                  </Stack>
                </CardActionArea>
                <IconButton
                  aria-label="Delete note"
                  color="error"
                  onClick={() => setPendingDelete({ note, force: false })}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {!isLoading && items.length > 0 && viewMode === 'grid' && (
        <Grid container spacing={2}>
          {items.map((note) => (
            <Grid key={note.id} item xs={12} sm={6} lg={4}>
              <Card
                elevation={0}
                sx={{ border: '1px solid', borderColor: 'rgba(15,17,26,0.08)', borderRadius: 3, height: '100%' }}
              >
                <CardActionArea
                  onClick={() => navigate(`/app/notes/${note.id}`)}
                  sx={{ height: '100%', display: 'flex', alignItems: 'stretch' }}
                >
                  <CardContent sx={{ width: '100%', display: 'grid', gap: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="start">
                      <Stack direction="row" spacing={1} alignItems="center">
                        {note.isPasswordProtected && <LockIcon fontSize="small" color="action" />}
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {note.title}
                        </Typography>
                      </Stack>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(event) => {
                          event.stopPropagation();
                          setPendingDelete({ note, force: false });
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {note.isPasswordProtected ? 'Protected note preview hidden' : note.preview || 'No preview available'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Linked tasks: {note.linkedTaskCount}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <NoteEditorDialog
        open={createOpen}
        title="Add New Note"
        submitting={createMutation.isPending}
        onClose={() => setCreateOpen(false)}
        onSave={async (payload) => {
          await createMutation.mutateAsync(payload);
          notify('Note created', 'success');
          setCreateOpen(false);
        }}
        saveLabel="Save"
      />

      <Dialog open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)}>
        <DialogTitle>{pendingDelete?.force ? 'Delete linked note?' : 'Delete note?'}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            {pendingDelete?.force
              ? `This note is linked to ${pendingDelete.linkCount || 0} task(s). Deleting it will unlink all tasks.`
              : 'This action cannot be undone.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDelete(null)} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
