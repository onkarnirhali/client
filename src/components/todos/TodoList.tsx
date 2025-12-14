import {
  Box,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import { Todo } from '../../features/todos';
import { uiPriorityFromApi, uiStatusFromApi } from '../../features/todos/mapping';

type Props = {
  items: Todo[];
  loading?: boolean;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
};

function formatDate(value: string | null) {
  if (!value) return '—';
  return dayjs(value).format('MMM D, YYYY');
}

export function TodoList({ items, loading, onEdit, onDelete }: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'rgba(15,17,26,0.08)',
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      {loading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />}
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'rgba(15,17,26,0.02)' }}>
            <TableCell>Title</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell width={120} align="right">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((todo) => {
            const statusLabel = uiStatusFromApi(todo.status);
            const priorityLabel = uiPriorityFromApi(todo.priority);
            const statusChipProps =
              todo.status === 'done'
                ? { label: statusLabel, sx: { bgcolor: 'rgba(16,185,129,0.15)', color: '#067447' } }
                : { label: statusLabel, sx: { bgcolor: 'rgba(37,99,235,0.12)', color: '#1d4ed8' } };

            const priorityChipProps =
              todo.priority === 'high'
                ? { label: priorityLabel, sx: { bgcolor: 'rgba(251,146,60,0.16)', color: '#c2410c' } }
                : todo.priority === 'low'
                ? { label: priorityLabel, sx: { bgcolor: 'rgba(107,114,128,0.14)', color: '#374151' } }
                : { label: priorityLabel, sx: { bgcolor: 'rgba(234,179,8,0.16)', color: '#854d0e' } };

            return (
              <TableRow key={todo.id} hover>
                <TableCell>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {todo.title}
                  </Typography>
                  {todo.description && (
                    <Typography variant="body2" color="text.secondary">
                      {todo.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip size="small" variant="filled" {...statusChipProps} />
                </TableCell>
                <TableCell>
                  <Chip size="small" variant="filled" {...priorityChipProps} />
                </TableCell>
                <TableCell>{formatDate(todo.dueDate)}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" aria-label="Edit" onClick={() => onEdit(todo)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" aria-label="Delete" onClick={() => onDelete(todo)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}
