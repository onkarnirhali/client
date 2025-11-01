import { Box, Button, MenuItem, TextField } from '@mui/material';
import { ChangeEvent } from 'react';

export type TodoFiltersDraft = {
  status: string;
  q: string;
  dueFrom: string;
  dueTo: string;
};

type Props = {
  draft: TodoFiltersDraft;
  onDraftChange: (draft: TodoFiltersDraft) => void;
  onApply: () => void;
  onReset: () => void;
  busy?: boolean;
};

export function TodoFilters({ draft, onDraftChange, onApply, onReset, busy }: Props) {
  const handleChange = (field: keyof TodoFiltersDraft) => (event: ChangeEvent<HTMLInputElement>) => {
    onDraftChange({ ...draft, [field]: event.target.value });
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
      <TextField
        label="Search"
        value={draft.q}
        onChange={handleChange('q')}
        size="small"
        sx={{ minWidth: 200 }}
      />
      <TextField
        select
        label="Status"
        value={draft.status}
        onChange={handleChange('status')}
        size="small"
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="pending">Pending</MenuItem>
        <MenuItem value="done">Done</MenuItem>
      </TextField>
      <TextField
        label="Due From"
        type="date"
        value={draft.dueFrom}
        onChange={handleChange('dueFrom')}
        size="small"
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Due To"
        type="date"
        value={draft.dueTo}
        onChange={handleChange('dueTo')}
        size="small"
        InputLabelProps={{ shrink: true }}
      />
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Button variant="contained" onClick={onApply} disabled={busy}>Apply</Button>
        <Button variant="text" onClick={onReset} disabled={busy}>Reset</Button>
      </Box>
    </Box>
  );
}
