import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Todo, TodoInput } from '../../features/todos';
import { rephraseDescription } from '../../api/ai';
import { HttpError } from '../../api/http';
import { useSnackbar } from '../feedback/SnackbarProvider';
import { UiPriority, UiStatus, apiPriorityFromUi, apiStatusFromUi, uiPriorityFromApi, uiStatusFromApi } from '../../features/todos/mapping';

type Mode = 'create' | 'edit';

type FormState = {
  title: string;
  description: string;
  status: UiStatus;
  priority: UiPriority;
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
  status: 'To Do',
  priority: 'Normal',
  dueDate: '',
};

function toDateInput(value: string | null) {
  if (!value) return '';
  return value.slice(0, 10);
}

export function TodoFormDialog({ open, mode, initial, onClose, onSubmit, submitting }: Props) {
  const [form, setForm] = useState<FormState>(defaultState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const { notify } = useSnackbar();

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          title: initial.title || '',
          description: initial.description || '',
          status: uiStatusFromApi(initial.status),
          priority: uiPriorityFromApi(initial.priority),
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
      status: apiStatusFromUi(form.status),
      priority: apiPriorityFromUi(form.priority),
      dueDate: form.dueDate ? new Date(`${form.dueDate}T00:00:00.000Z`).toISOString() : null,
    };
    await onSubmit(payload);
  };

  const handleRephrase = async () => {
    const current = form.description.trim();
    if (!current) {
      notify('Add a description first so AI knows what to polish.', 'info');
      return;
    }
    setAiLoading(true);
    try {
      const rephrased = await rephraseDescription(current);
      setForm((prev) => ({ ...prev, description: rephrased }));
      notify('Description polished with AI ✨', 'success');
    } catch (err) {
      const message = err instanceof HttpError ? err.message : 'Unable to rephrase description right now.';
      notify(message, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Dialog open={open} sx={{borderRadius: 0.5}} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === 'create' ? 'New Todo' : 'Edit Todo'}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'grid', gap: 2, mt: 1, borderRadius: 0.5 }}>
          <TextField
            label="Title"
            value={form.title}
            onChange={handleChange('title')}
            error={Boolean(errors.title)}
            helperText={errors.title}
            autoFocus
          />
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <TextField
              label="Description"
              value={form.description}
              onChange={handleChange('description')}
              multiline
              minRows={3}
              sx={{ flex: 1, borderRadius: 0.5 }}
            />
            <Button
              variant="outlined"
              startIcon={<AutoAwesomeIcon fontSize="small" />}
              onClick={handleRephrase}
              disabled={aiLoading || submitting}
              sx={{ alignSelf: 'stretch', whiteSpace: 'nowrap',borderRadius: 0.5 }}
            >
              {aiLoading ? 'Polishing...' : 'Polish with AI'}
            </Button>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Status
              </Typography>
              <RadioGroup
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as UiStatus }))}
              >
                <FormControlLabel value="To Do" control={<Radio />} label="To Do" />
                <FormControlLabel value="In Progress" control={<Radio />} label="In Progress" />
                <FormControlLabel value="Done" control={<Radio />} label="Done" />
              </RadioGroup>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Priority
              </Typography>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 0.5,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3,1fr)',
                  gap: 0.5,
                  p: 0.5,
                }}
              >
                {(['Low', 'Normal', 'High'] as UiPriority[]).map((option) => {
                  const selected = form.priority === option;
                  return (
                    <Button
                      key={option}
                      variant={selected ? 'contained' : 'text'}
                      onClick={() => setForm((prev) => ({ ...prev, priority: option }))}
                      sx={{
                        borderRadius: 0.5,
                        bgcolor: selected ? 'primary.light' : 'transparent',
                        color: selected ? 'primary.contrastText' : 'text.secondary',
                        '&:hover': { bgcolor: selected ? 'primary.main' : 'action.hover' },
                      }}
                    >
                      {option}
                    </Button>
                  );
                })}
              </Box>
            </Box>
          </Box>
          <TextField
            label="Due Date"
            type="date"
            value={form.dueDate}
            onChange={handleChange('dueDate')}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
        {submitting && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Saving...
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ borderRadius: 0.5 }} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} sx={{ borderRadius: 0.5 }} variant="contained" disabled={submitting}>
          {mode === 'create' ? 'Create' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
