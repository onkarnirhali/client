import { useCallback, useMemo, useState } from 'react';
import { Box, Stack, Switch, Tab, Tabs, Typography } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import { useAuth } from '../auth/useAuth';
import { AdminUser } from '../api/admin';
import { useAdminUsers, useUpdateAdminUser } from '../features/admin/hooks';
import { useSnackbar } from '../components/feedback/SnackbarProvider';

const TAB_ALL = 0;
const TAB_ADMINS = 1;

function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
}

function safeText(value?: string | null) {
  if (!value) return '-';
  const trimmed = String(value).trim();
  return trimmed ? trimmed : '-';
}

function usePendingSet() {
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
  const setPending = useCallback((id: number, pending: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (pending) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);
  return { pendingIds, setPending };
}

export function AdminPage() {
  const { user } = useAuth();
  const { notify } = useSnackbar();
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [overrides, setOverrides] = useState<Record<number, Partial<AdminUser>>>({});
  const { pendingIds, setPending } = usePendingSet();

  const roleFilter = tab === TAB_ADMINS ? 'admin' : null;
  const { data, isLoading, isFetching, refetch } = useAdminUsers(pageSize, page * pageSize, roleFilter);
  const updateUser = useUpdateAdminUser();

  const rows = data?.items || [];
  const rowCount = data?.total || 0;
  const currentUserId = user?.id || null;

  const getEffectiveRow = useCallback(
    (row: AdminUser) => {
      const override = overrides[row.id];
      return override ? { ...row, ...override } : row;
    },
    [overrides]
  );

  const clearOverride = useCallback((id: number) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const applyOverride = useCallback((id: number, patch: Partial<AdminUser>) => {
    setOverrides((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  }, []);

  const handleUpdate = useCallback(
    async (id: number, patch: { role?: string; isEnabled?: boolean }, successMessage: string) => {
      applyOverride(id, patch);
      setPending(id, true);
      try {
        await updateUser.mutateAsync({ id, payload: patch });
        await refetch();
        notify(successMessage, 'success');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Update failed';
        notify(message, 'error');
      } finally {
        clearOverride(id);
        setPending(id, false);
      }
    },
    [applyOverride, clearOverride, notify, refetch, setPending, updateUser]
  );

  const handleToggleEnabled = useCallback(
    (row: AdminUser, next: boolean) =>
      handleUpdate(row.id, { isEnabled: next }, next ? 'User enabled' : 'User disabled'),
    [handleUpdate]
  );

  const handleToggleAdmin = useCallback(
    (row: AdminUser, next: boolean) =>
      handleUpdate(row.id, { role: next ? 'admin' : 'user' }, next ? 'Admin access granted' : 'Admin access removed'),
    [handleUpdate]
  );

  const columns = useMemo<GridColDef<AdminUser>[]>(() => {
    return [
      { field: 'name', headerName: 'Name', minWidth: 180, flex: 1, valueGetter: (_value, row) => safeText(row.name) },
      {
        field: 'email',
        headerName: 'Email',
        minWidth: 220,
        flex: 1,
        valueGetter: (_value, row) => safeText(row.email),
      },
      {
        field: 'providerName',
        headerName: 'Provider',
        minWidth: 120,
        valueGetter: (_value, row) => safeText(row.providerName),
      },
      {
        field: 'providerId',
        headerName: 'Provider ID',
        minWidth: 220,
        valueGetter: (_value, row) => safeText(row.providerId),
      },
      {
        field: 'outlookAccountEmail',
        headerName: 'Outlook Email',
        minWidth: 220,
        valueGetter: (_value, row) => safeText(row.outlookAccountEmail),
      },
      {
        field: 'outlookTenantId',
        headerName: 'Outlook Tenant',
        minWidth: 180,
        valueGetter: (_value, row) => safeText(row.outlookTenantId),
      },
      {
        field: 'createdAt',
        headerName: 'Created',
        minWidth: 160,
        valueGetter: (_value, row) => formatDate(row.createdAt),
      },
      {
        field: 'lastActiveAt',
        headerName: 'Last Active',
        minWidth: 160,
        valueGetter: (_value, row) => formatDate(row.lastActiveAt),
      },
      {
        field: 'active',
        headerName: 'Active',
        minWidth: 120,
        sortable: false,
        renderCell: (params: GridRenderCellParams<AdminUser>) => {
          const row = getEffectiveRow(params.row);
          const checked = row.isEnabled !== false;
          const disabled = pendingIds.has(row.id) || row.id === currentUserId;
          return (
            <Switch
              size="small"
              checked={checked}
              disabled={disabled}
              onChange={(event) => handleToggleEnabled(row, event.target.checked)}
            />
          );
        },
      },
      {
        field: 'adminAccess',
        headerName: 'Admin Access',
        minWidth: 140,
        sortable: false,
        renderCell: (params: GridRenderCellParams<AdminUser>) => {
          const row = getEffectiveRow(params.row);
          const checked = row.role === 'admin';
          const disabled = pendingIds.has(row.id) || row.id === currentUserId;
          return (
            <Switch
              size="small"
              checked={checked}
              disabled={disabled}
              onChange={(event) => handleToggleAdmin(row, event.target.checked)}
            />
          );
        },
      },
    ];
  }, [currentUserId, getEffectiveRow, handleToggleAdmin, handleToggleEnabled, pendingIds]);

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Admin
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage users and access for Might As Well.
        </Typography>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, value) => {
          setTab(value);
          setPage(0);
        }}
      >
        <Tab label="All Users" />
        <Tab label="Admins" />
      </Tabs>

      <Box sx={{ width: '100%', height: { xs: 420, sm: 520, md: 640, lg: 720 }, overflowX: 'auto' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          rowCount={rowCount}
          loading={isLoading || isFetching}
          paginationMode="server"
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(model: GridPaginationModel) => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          sx={{ minWidth: 1200, height: '100%' }}
          localeText={{ noRowsLabel: 'No users found.' }}
        />
      </Box>
    </Stack>
  );
}
