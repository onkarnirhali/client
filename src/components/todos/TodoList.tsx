import {
  Box,
  Chip,
  IconButton,
  LinearProgress,
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

function statusColor(status: Todo['status']) {
  return status === 'done' ? 'success' : 'warning';
}

export function TodoList({ items, loading, onEdit, onDelete }: Props) {
  if (!loading && items.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body1">No todos yet. Create one to get started.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {loading && <LinearProgress sx={{ position: 'absolute', top: -8, left: 0, right: 0 }} />}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Due</TableCell>
            <TableCell width={120} align="right">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((todo) => (
            <TableRow key={todo.id} hover>
              <TableCell>
                <Typography variant="subtitle2">{todo.title}</Typography>
                {todo.description && (
                  <Typography variant="body2" color="text.secondary">
                    {todo.description}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Chip label={todo.status} color={statusColor(todo.status)} size="small" />
              </TableCell>
              <TableCell>
                <Chip label={todo.priority} size="small" />
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
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
