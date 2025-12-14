import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, Card, CardContent, Grid, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { ChangeEvent } from 'react';
import { UiPriority, UiStatus } from '../../features/todos/mapping';

export type TodoFiltersDraft = {
  status: '' | UiStatus;
  priority: '' | UiPriority;
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
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'rgba(15,17,26,0.08)', borderRadius: 3 }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={6}>
            <TextField
              label="Search tasks"
              value={draft.q}
              onChange={handleChange('q')}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3} lg={3}>
            <TextField select label="Status" value={draft.status} onChange={handleChange('status')} fullWidth>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="To Do">To Do</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Done">Done</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3} lg={3}>
            <TextField select label="Priority" value={draft.priority} onChange={handleChange('priority')} fullWidth>
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Normal">Normal</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3} lg={3}>
            <TextField
              label="Due From"
              type="date"
              value={draft.dueFrom}
              onChange={handleChange('dueFrom')}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3} lg={3}>
            <TextField
              label="Due To"
              type="date"
              value={draft.dueTo}
              onChange={handleChange('dueTo')}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1 }}>
          <Button variant="outlined" onClick={onReset} disabled={busy}>
            Reset
          </Button>
          <Button variant="contained" onClick={onApply} disabled={busy}>
            Apply
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
          Status “To Do” and “In Progress” both map to pending tasks on the API.
        </Typography>
      </CardContent>
    </Card>
  );
}
