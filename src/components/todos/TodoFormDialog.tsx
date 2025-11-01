import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { Todo, TodoInput } from '../../features/todos';

type Mode = 'create' | 'edit';

type FormState = {
  title: string;
  description: string;
  status: Todo['status'];
  priority: Todo['priority'];
  dueDate: string;
};

type Props = {
  open: boolean;
  mode: Mode;
  initial?: Todo | null;
  onClose: () => void;
  onSubmit: (payload: TodoInput) => Promise<void>;
  submitting?: boolean;
};

const defaultState: FormState = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'normal',
  dueDate: '',
};

function toDateInput(value: string | null) {
  if (!value) return '';
  return value.slice(0, 10);
}

export function TodoFormDialog({ open, mode, initial, onClose, onSubmit, submitting }: Props) {
  const [form, setForm] = useState<FormState>(defaultState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          title: initial.title || '',
          description: initial.description || '',
          status: initial.status,
          priority: initial.priority,
          dueDate: toDateInput(initial.dueDate),
        });
      } else {
        setForm(defaultState);
      }
      setErrors({});
    }
  }, [open, initial]);

  const handleChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async () => {
    const nextErrors: Record<string, string> = {};
    if (!form.title.trim()) nextErrors.title = 'Title is required';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    const payload: TodoInput = {
      title: form.title.trim(),
      description: form.description.trim() ? form.description.trim() : null,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate ? new Date(`${form.dueDate}T00:00:00.000Z`).toISOString() : null,
    };
    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === 'create' ? 'New Todo' : 'Edit Todo'}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
          <TextField
            label="Title"
            value={form.title}
            onChange={handleChange('title')}
            error={Boolean(errors.title)}
            helperText={errors.title}
            autoFocus
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={handleChange('description')}
            multiline
            minRows={3}
          />
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              select
              label="Status"
              value={form.status}
              onChange={handleChange('status')}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="done">Done</MenuItem>
            </TextField>
            <TextField
              select
              label="Priority"
              value={form.priority}
              onChange={handleChange('priority')}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>
            <TextField
              label="Due Date"
              type="date"
              value={form.dueDate}
              onChange={handleChange('dueDate')}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Box>
        {submitting && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Saving...
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {mode === 'create' ? 'Create' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
