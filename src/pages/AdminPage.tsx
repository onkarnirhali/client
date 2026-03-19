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
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Admin</h1>
        <p className="text-sm text-muted mt-1">Manage users and access for Might as well.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          <button
            className={`px-4 py-2.5 text-sm font-medium transition-colors -mb-px ${
              tab === TAB_ALL ? 'font-semibold text-primary border-b-2 border-primary' : 'text-muted hover:text-text'
            }`}
            onClick={() => { setTab(TAB_ALL); setPage(0); }}
          >
            All Users
          </button>
          <button
            className={`px-4 py-2.5 text-sm font-medium transition-colors -mb-px ${
              tab === TAB_ADMINS ? 'font-semibold text-primary border-b-2 border-primary' : 'text-muted hover:text-text'
            }`}
            onClick={() => { setTab(TAB_ADMINS); setPage(0); }}
          >
            Admins
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="bg-white rounded-xl border border-gray-200/60 overflow-hidden">
          {(isLoading || isFetching) && (
            <div className="h-1 bg-primary/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-[loading_1.4s_ease-in-out_infinite] w-1/3" />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="bg-[#f6f6f8] border-b border-gray-200/60">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Provider</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Outlook Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Created</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Last Active</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Active</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.length === 0 && !isLoading && (
                  <tr><td colSpan={8} className="text-center text-muted py-6">No users found.</td></tr>
                )}
                {rows.map((rawRow) => {
                  const row = getEffectiveRow(rawRow);
                  const isSelf = row.id === currentUserId;
                  const isPending = pendingIds.has(row.id);
                  const isActive = row.isEnabled !== false;
                  const isAdminUser = row.role === 'admin';
                  return (
                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                            {(safeText(row.name) || '??').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium">{safeText(row.name)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted">{safeText(row.email)}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{safeText(row.providerName)}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted">{safeText(row.outlookAccountEmail) || '--'}</td>
                      <td className="px-4 py-3.5 text-sm text-muted">{formatDateTime(row.createdAt)}</td>
                      <td className="px-4 py-3.5 text-sm text-muted">{formatDateTime(row.lastActiveAt)}</td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          className={`switch-el ${isActive ? 'on' : ''}`}
                          role="switch"
                          aria-checked={isActive}
                          disabled={isPending || isSelf}
                          onClick={() => handleToggleEnabled(row, !isActive)}
                        />
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          className={`switch-el ${isAdminUser ? 'on' : ''}`}
                          role="switch"
                          aria-checked={isAdminUser}
                          disabled={isPending || isSelf}
                          onClick={() => handleToggleAdmin(row, !isAdminUser)}
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
            <div className="flex justify-center gap-2 py-4 border-t border-gray-100">
              <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                Previous
              </button>
              <span className="chip">{page + 1} / {totalPages}</span>
              <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
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
          const isAdminUser = row.role === 'admin';
          return (
            <article key={row.id} className="bg-white rounded-xl border border-gray-200/60 p-4 grid gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-sm">{safeText(row.name)}</div>
                  <p className="text-muted text-xs">{safeText(row.email)}</p>
                </div>
                {isSelf && <span className="badge badge-primary">You</span>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{safeText(row.providerName)}</span>
                {row.outlookAccountEmail && <span className="badge badge-accent">Outlook linked</span>}
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted">Active</span>
                  <button
                    className={`switch-el ${isActive ? 'on' : ''}`}
                    role="switch"
                    aria-checked={isActive}
                    disabled={isPending || isSelf}
                    onClick={() => handleToggleEnabled(row, !isActive)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted">Admin</span>
                  <button
                    className={`switch-el ${isAdminUser ? 'on' : ''}`}
                    role="switch"
                    aria-checked={isAdminUser}
                    disabled={isPending || isSelf}
                    onClick={() => handleToggleAdmin(row, !isAdminUser)}
                  />
                </div>
              </div>
            </article>
          );
        })}

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
