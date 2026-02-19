import { useEffect, useMemo, useState } from 'react';
import {
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
import LockIcon from '@mui/icons-material/Lock';
import { NoteSummary, useNotes } from '../../features/notes';

type Props = {
  open: boolean;
  linkedNoteIds: number[];
  onClose: () => void;
  onLink: (notes: NoteSummary[]) => void;
};

export function LinkExistingNotesDialog({ open, linkedNoteIds, onClose, onLink }: Props) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const { data, isLoading } = useNotes({ limit: 200, offset: 0 });
  const items = data?.items || [];

  useEffect(() => {
    if (!open) return;
    setSearch('');
    setSelected(new Set());
  }, [open]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((item) => item.title.toLowerCase().includes(q));
  }, [items, search]);

  const linkedSet = useMemo(() => new Set(linkedNoteIds), [linkedNoteIds]);
  const selectedItems = useMemo(
    () => items.filter((item) => selected.has(item.id)),
    [items, selected]
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Link Existing Notes</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5}>
          <TextField
            label="Search notes by title"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Stack spacing={0.75} sx={{ maxHeight: 360, overflowY: 'auto' }}>
            {isLoading && <Typography color="text.secondary">Loading notes...</Typography>}
            {!isLoading && filtered.length === 0 && (
              <Typography color="text.secondary">No notes found.</Typography>
            )}
            {!isLoading && filtered.map((note) => {
              const disabled = linkedSet.has(note.id);
              return (
                <FormControlLabel
                  key={note.id}
                  disabled={disabled}
                  control={(
                    <Checkbox
                      checked={selected.has(note.id)}
                      onChange={(event) => {
                        setSelected((prev) => {
                          const next = new Set(prev);
                          if (event.target.checked) next.add(note.id);
                          else next.delete(note.id);
                          return next;
                        });
                      }}
                    />
                  )}
                  label={(
                    <Stack direction="row" spacing={1} alignItems="center">
                      {note.isPasswordProtected && <LockIcon fontSize="small" color="action" />}
                      <Typography variant="body2">{note.title}</Typography>
                      {disabled && (
                        <Typography variant="caption" color="text.secondary">
                          Already linked
                        </Typography>
                      )}
                    </Stack>
                  )}
                />
              );
            })}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!selectedItems.length}
          onClick={() => {
            onLink(selectedItems);
            onClose();
          }}
        >
          Link
        </Button>
      </DialogActions>
    </Dialog>
  );
}

