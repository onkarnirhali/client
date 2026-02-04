import { useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { useAdminEvents, useAdminIntegrations, useAdminSummary, useAdminUsers } from '../features/admin/hooks';

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}

function formatNumber(value?: number | null) {
  if (typeof value !== 'number') return '0';
  return value.toLocaleString();
}

function UsersTab() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const { data, isLoading } = useAdminUsers(rowsPerPage, page * rowsPerPage);

  const items = data?.items || [];
  const total = data?.total || 0;

  return (
    <Paper variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Last active</TableCell>
            <TableCell align="right">Suggestions</TableCell>
            <TableCell align="right">Accepted</TableCell>
            <TableCell align="right">Tokens (gen)</TableCell>
            <TableCell align="right">Tokens (embed)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7}>Loading…</TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>No users found.</TableCell>
            </TableRow>
          ) : (
            items.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name || '—'}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.role || 'user'}</TableCell>
                <TableCell>{formatDate(row.lastActiveAt)}</TableCell>
                <TableCell align="right">{formatNumber(row.suggestionsGenerated)}</TableCell>
                <TableCell align="right">{formatNumber(row.suggestionsAccepted)}</TableCell>
                <TableCell align="right">{formatNumber(row.tokensGeneration)}</TableCell>
                <TableCell align="right">{formatNumber(row.tokensEmbedding)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, next) => setPage(next)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(Number(event.target.value));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Paper>
  );
}

function EventsTab() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const { data, isLoading } = useAdminEvents(rowsPerPage, page * rowsPerPage);

  const items = data?.items || [];
  const total = data?.total || 0;

  return (
    <Paper variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Metadata</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4}>Loading…</TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>No events found.</TableCell>
            </TableRow>
          ) : (
            items.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.email || row.userId || '—'}</TableCell>
                <TableCell>{formatDate(row.createdAt)}</TableCell>
                <TableCell>
                  <Box sx={{ maxWidth: 360, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {row.metadata ? JSON.stringify(row.metadata) : '—'}
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, next) => setPage(next)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(Number(event.target.value));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Paper>
  );
}

function IntegrationsTab() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const { data, isLoading } = useAdminIntegrations(rowsPerPage, page * rowsPerPage);

  const items = data?.items || [];
  const total = data?.total || 0;

  return (
    <Paper variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Gmail linked</TableCell>
            <TableCell>Gmail last linked</TableCell>
            <TableCell>Outlook linked</TableCell>
            <TableCell>Outlook last linked</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5}>Loading…</TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>No integrations found.</TableCell>
            </TableRow>
          ) : (
            items.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.gmailLinked ? 'Yes' : 'No'}</TableCell>
                <TableCell>{formatDate(row.gmailLastLinkedAt)}</TableCell>
                <TableCell>{row.outlookLinked ? 'Yes' : 'No'}</TableCell>
                <TableCell>{formatDate(row.outlookLastLinkedAt)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, next) => setPage(next)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(Number(event.target.value));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Paper>
  );
}

export function AdminPage() {
  const [tab, setTab] = useState(0);
  const { data } = useAdminSummary();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Admin
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Activity and usage overview for Might As Well.
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Paper variant="outlined" sx={{ p: 2, minWidth: 220 }}>
          <Typography variant="caption" color="text.secondary">
            Active users (24h)
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {formatNumber(data?.activeUsers24h)}
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, minWidth: 220 }}>
          <Typography variant="caption" color="text.secondary">
            Total users
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {formatNumber(data?.totalUsers)}
          </Typography>
        </Paper>
      </Stack>

      <Tabs value={tab} onChange={(_, value) => setTab(value)}>
        <Tab label="Users" />
        <Tab label="Events" />
        <Tab label="Integrations" />
      </Tabs>

      {tab === 0 && <UsersTab />}
      {tab === 1 && <EventsTab />}
      {tab === 2 && <IntegrationsTab />}
    </Stack>
  );
}
