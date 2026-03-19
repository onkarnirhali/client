import { useEffect, useState } from 'react';
import { AiSuggestion } from '../../api/ai';
import {
  useAcceptSuggestion,
  useAddTodoFromSuggestion,
  useAiSuggestions,
  useBulkDismiss,
  useDismissSuggestion,
  useRefreshAiSuggestions,
  useSuggestionsPolling,
} from './hooks';
import { useSnackbar } from '../../components/feedback/SnackbarProvider';

export function AiSuggestionsWidget() {
  const { notify } = useSnackbar();
  const { data, isLoading, refetch, isFetching, error } = useAiSuggestions();
  const refreshMutation = useRefreshAiSuggestions();
  const acceptMutation = useAcceptSuggestion();
  const dismissMutation = useDismissSuggestion();
  const bulkDismissMutation = useBulkDismiss();
  const addMutation = useAddTodoFromSuggestion();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [refreshHint, setRefreshHint] = useState<string | null>(null);

  const suggestions = data?.suggestions || [];
  const context = data?.context;
  const count = suggestions.length;
  const hasSuggestions = count > 0;

  useSuggestionsPolling({ enabled: false, hasSuggestions, refetch });

  useEffect(() => {
    if (error) {
      notify(error instanceof Error ? error.message : 'Failed to load AI suggestions', 'error');
    }
  }, [error, notify]);

  const handleRefresh = async () => {
    try {
      const payload = await refreshMutation.mutateAsync();
      const refreshMeta = payload.refresh;
      if (refreshMeta?.generationFallbackUsed) {
        setRefreshHint('Using cached/history suggestions due to temporary AI formatting issue.');
      } else if (refreshMeta?.partial) {
        if (refreshMeta.scheduleState === 'scheduled') {
          setRefreshHint('Showing latest suggestions now; full inbox catch-up is continuing.');
        } else if (refreshMeta.scheduleState === 'already_running') {
          setRefreshHint('Showing latest suggestions now; inbox catch-up is already running.');
        } else {
          setRefreshHint('Showing latest suggestions now; refresh was limited by time budget.');
        }
      } else if (refreshMeta?.preservedExisting) {
        setRefreshHint('No new suggestions were generated, so previous suggestions are still shown.');
      } else {
        setRefreshHint(null);
      }
      await refetch();
      let message = 'Suggestions refreshed';
      if (refreshMeta?.generationFallbackUsed) {
        message = 'Suggestions refreshed with fallback due to temporary AI formatting issue.';
      } else if (refreshMeta?.preservedExisting) {
        message = 'Refresh completed. Keeping previous suggestions because no new suggestions were generated.';
      } else if (refreshMeta?.partial) {
        if (refreshMeta.scheduleState === 'scheduled') {
          message = 'Suggestions refreshed. Full inbox catch-up is continuing.';
        } else if (refreshMeta.scheduleState === 'already_running') {
          message = 'Suggestions refreshed. Inbox catch-up is already running.';
        } else {
          message = 'Suggestions refreshed with a time limit.';
        }
      }
      notify(message, 'info');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to refresh suggestions', 'error');
    }
  };

  const handleAdd = async (s: AiSuggestion) => {
    try {
      await addMutation.mutateAsync({ suggestion: s });
      await acceptMutation.mutateAsync(s.id).catch(() => undefined);
      notify('Added to Todos', 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to add suggestion', 'error');
    }
  };

  const handleDismiss = async (s: AiSuggestion) => {
    try {
      await dismissMutation.mutateAsync(s.id);
      notify('Suggestion dismissed', 'info');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to dismiss', 'error');
    }
  };

  const handleAddAll = async () => {
    if (!suggestions.length) return;
    try {
      for (const s of suggestions) {
        await handleAdd(s);
      }
      notify('All suggestions added', 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to add all', 'error');
    }
  };

  const handleDismissAll = async () => {
    if (!suggestions.length) return;
    const confirmed = window.confirm('Dismiss all suggestions?');
    if (!confirmed) return;
    try {
      const ids = suggestions.map((s) => s.id);
      await bulkDismissMutation.mutateAsync(ids);
      notify('Dismissed all suggestions', 'info');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to dismiss all', 'error');
    }
  };

  const sparkleIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  );

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Expandable Panel */}
      {mobileOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white rounded-xl border border-gray-200/60 shadow-xl overflow-hidden">
          {/* Panel Header */}
          <div className="bg-gradient-to-r from-[var(--color-primary)] to-indigo-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {sparkleIcon}
              <span className="text-sm font-bold">AI Suggestions</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshMutation.isPending || isFetching}
                className="hover:bg-white/20 rounded-lg p-1 transition-colors disabled:opacity-50"
                title="Refresh suggestions"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
              </button>
              <button
                onClick={() => setMobileOpen(false)}
                className="hover:bg-white/20 rounded-lg p-1 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          {/* Suggestions List */}
          <div className="max-h-[50vh] overflow-y-auto divide-y divide-gray-100">
            {refreshHint && <p className="text-muted text-xs px-4 py-2">{refreshHint}</p>}

            {(isLoading || isFetching || refreshMutation.isPending) && (
              <div className="text-center py-6">
                <div className="w-6 h-6 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted text-sm mt-2">Loading suggestions...</p>
              </div>
            )}

            {!isLoading && !isFetching && suggestions.length === 0 && (
              <div className="text-center py-6 px-4">
                <p className="text-muted text-sm">
                  {context?.reasonCode === 'INSUFFICIENT_HISTORY'
                    ? 'Create tasks to train AI suggestions or connect Gmail/Outlook.'
                    : context?.reasonCode === 'NO_PROVIDER_CONNECTED'
                      ? 'Connect Gmail/Outlook to enable email-based suggestions.'
                      : 'No suggestions right now'}
                </p>
                <button className="text-xs text-primary font-medium mt-2 hover:underline" onClick={handleRefresh}>
                  Refresh
                </button>
              </div>
            )}

            {suggestions.map((s) => {
              const sourceLabel = typeof s.metadata?.sourceLabel === 'string' ? s.metadata.sourceLabel : '';
              return (
                <div key={s.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                  <h4 className="text-sm font-semibold mb-1">{s.title}</h4>
                  {s.detail && <p className="text-xs text-muted mb-2.5 line-clamp-3">{s.detail}</p>}
                  {sourceLabel && !s.detail && <p className="text-xs text-muted mb-2.5">Source: {sourceLabel}</p>}
                  <div className="flex items-center gap-2">
                    <button
                      className="text-xs bg-primary text-white px-2.5 py-1 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50"
                      onClick={() => handleAdd(s)}
                      disabled={addMutation.isPending}
                    >
                      Add as Todo
                    </button>
                    <button
                      className="text-xs text-muted hover:text-text px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      onClick={() => handleDismiss(s)}
                      disabled={dismissMutation.isPending}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Panel Footer */}
          {hasSuggestions && (
            <div className="border-t border-gray-100 px-4 py-2.5 flex justify-between items-center">
              <span className="text-[11px] text-muted">{count} suggestion{count !== 1 ? 's' : ''}</span>
              <div className="flex gap-3">
                <button
                  className="text-[11px] text-primary font-medium hover:underline disabled:opacity-50"
                  onClick={handleAddAll}
                  disabled={addMutation.isPending || acceptMutation.isPending}
                >
                  Add All
                </button>
                <button
                  className="text-[11px] text-muted hover:text-text font-medium disabled:opacity-50"
                  onClick={handleDismissAll}
                  disabled={bulkDismissMutation.isPending}
                >
                  Dismiss All
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="relative w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-[var(--color-primary)] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
        aria-label="Open AI suggestions"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        </svg>
        {hasSuggestions && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {count}
          </span>
        )}
      </button>
    </div>
  );
}
