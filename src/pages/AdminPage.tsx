import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { AdminUser } from '../api/admin';
import { useAdminUsers, useUpdateAdminUser } from '../features/admin/hooks';
import { useSnackbar } from '../components/feedback/SnackbarProvider';
import { formatDateTime } from '../utils/date';
import { safeText } from '../utils/text';

const TAB_ALL = 0;
const TAB_ADMINS = 1;

function usePendingSet() {
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
  const setPending = useCallback((id: number, pending: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (pending) next.add(id);
      else next.delete(id);
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
  const [pageSize] = useState(25);
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

  const adminsCount = useMemo(() => rows.filter((r) => r.role === 'admin').length, [rows]);
  const totalPages = Math.ceil(rowCount / pageSize);

  return (
    <div className="grid gap-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <article className="metric-card">
          <div className="metric-label">Users</div>
          <div className="metric-value">{rowCount}</div>
        </article>
        <article className="metric-card">
          <div className="metric-label">Admins</div>
          <div className="metric-value">{adminsCount}</div>
          <div className="metric-trend">Current user cannot demote self</div>
        </article>
        <article className="metric-card">
          <div className="metric-label">Page</div>
          <div className="metric-value">{page + 1}</div>
          <div className="metric-trend">of {totalPages || 1}</div>
        </article>
        <article className="metric-card">
          <div className="metric-label">View</div>
          <div className="metric-value">{tab === TAB_ADMINS ? 'Admins' : 'All'}</div>
        </article>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          className={`tab-btn ${tab === TAB_ALL ? 'active' : ''}`}
          onClick={() => { setTab(TAB_ALL); setPage(0); }}
        >
          All users
        </button>
        <button
          className={`tab-btn ${tab === TAB_ADMINS ? 'active' : ''}`}
          onClick={() => { setTab(TAB_ADMINS); setPage(0); }}
        >
          Admins
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="panel p-5">
          {(isLoading || isFetching) && (
            <div className="h-1 bg-primary/20 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-primary rounded-full animate-[loading_1.4s_ease-in-out_infinite] w-1/3" />
            </div>
          )}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Provider</th>
                  <th>Outlook</th>
                  <th>Created</th>
                  <th>Last active</th>
                  <th>Active</th>
                  <th>Admin</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && !isLoading && (
                  <tr><td colSpan={8} className="text-center text-muted py-6">No users found.</td></tr>
                )}
                {rows.map((rawRow) => {
                  const row = getEffectiveRow(rawRow);
                  const isSelf = row.id === currentUserId;
                  const isPending = pendingIds.has(row.id);
                  const isActive = row.isEnabled !== false;
                  const isAdmin = row.role === 'admin';
                  return (
                    <tr key={row.id}>
                      <td>
                        <strong>{safeText(row.name)}</strong>
                        {isSelf && <><br /><span className="text-muted text-xs">Current user</span></>}
                      </td>
                      <td>{safeText(row.email)}</td>
                      <td><span className="badge badge-info">{safeText(row.providerName)}</span></td>
                      <td>{safeText(row.outlookAccountEmail) || '-'}</td>
                      <td>{formatDateTime(row.createdAt)}</td>
                      <td>{formatDateTime(row.lastActiveAt)}</td>
                      <td>
                        <button
                          className={`switch-el ${isActive ? 'on' : ''}`}
                          role="switch"
                          aria-checked={isActive}
                          disabled={isPending || isSelf}
                          onClick={() => handleToggleEnabled(row, !isActive)}
                        />
                      </td>
                      <td>
                        <button
                          className={`switch-el ${isAdmin ? 'on' : ''}`}
                          role="switch"
                          aria-checked={isAdmin}
                          disabled={isPending || isSelf}
                          onClick={() => handleToggleAdmin(row, !isAdmin)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                className="btn btn-secondary btn-sm"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span className="chip">{page + 1} / {totalPages}</span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile user cards */}
      <div className="md:hidden grid gap-3">
        {(isLoading || isFetching) && (
          <div className="text-center text-muted text-sm py-4">Loading...</div>
        )}
        {rows.map((rawRow) => {
          const row = getEffectiveRow(rawRow);
          const isSelf = row.id === currentUserId;
          const isPending = pendingIds.has(row.id);
          const isActive = row.isEnabled !== false;
          const isAdmin = row.role === 'admin';
          return (
            <article key={row.id} className="user-card grid gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-sm">{safeText(row.name)}</div>
                  <p className="text-muted text-[13px]">{safeText(row.email)}</p>
                </div>
                {isSelf && <span className="badge badge-primary">Current</span>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="badge badge-info">{safeText(row.providerName)}</span>
                {row.outlookAccountEmail && <span className="badge badge-accent">Outlook linked</span>}
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted">Active</span>
                  <button
                    className={`switch-el ${isActive ? 'on' : ''}`}
                    role="switch"
                    aria-checked={isActive}
                    disabled={isPending || isSelf}
                    onClick={() => handleToggleEnabled(row, !isActive)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted">Admin</span>
                  <button
                    className={`switch-el ${isAdmin ? 'on' : ''}`}
                    role="switch"
                    aria-checked={isAdmin}
                    disabled={isPending || isSelf}
                    onClick={() => handleToggleAdmin(row, !isAdmin)}
                  />
                </div>
              </div>
            </article>
          );
        })}

        {/* Mobile pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</button>
            <span className="chip">{page + 1} / {totalPages}</span>
            <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(200%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
