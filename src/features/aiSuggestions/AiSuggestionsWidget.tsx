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

  const panelContent = (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-[12px] inline-flex items-center justify-center bg-primary-soft text-primary-strong text-sm font-extrabold">AI</span>
          <span className="font-extrabold text-sm">Suggestions ({count})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRefresh}
            disabled={refreshMutation.isPending || isFetching}
            className="chip cursor-pointer hover:bg-white/90 text-xs"
            title="Refresh"
          >
            Refresh
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="xl:hidden chip cursor-pointer hover:bg-white/90 text-xs"
          >
            Close
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className="btn btn-soft btn-sm text-xs"
          onClick={handleAddAll}
          disabled={addMutation.isPending || acceptMutation.isPending || !hasSuggestions}
        >
          Add All
        </button>
        <button
          className="btn btn-ghost btn-sm text-xs"
          onClick={handleDismissAll}
          disabled={bulkDismissMutation.isPending || !hasSuggestions}
        >
          Dismiss All
        </button>
      </div>

      {refreshHint && <p className="text-muted text-xs">{refreshHint}</p>}

      {(isLoading || isFetching || refreshMutation.isPending) && (
        <div className="text-center py-4">
          <div className="w-6 h-6 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted text-sm mt-2">Loading suggestions...</p>
        </div>
      )}

      {!isLoading && !isFetching && suggestions.length === 0 && (
        <div className="text-center py-4">
          <p className="text-muted text-sm">
            {context?.reasonCode === 'INSUFFICIENT_HISTORY'
              ? 'Create tasks to train AI suggestions or connect Gmail/Outlook.'
              : context?.reasonCode === 'NO_PROVIDER_CONNECTED'
                ? 'Connect Gmail/Outlook to enable email-based suggestions.'
                : 'No suggestions right now'}
          </p>
          <button className="btn btn-secondary btn-sm mt-3 text-xs" onClick={handleRefresh}>
            Refresh
          </button>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="grid gap-3">
          {suggestions.map((s) => {
            const sourceLabel = typeof s.metadata?.sourceLabel === 'string' ? s.metadata.sourceLabel : '';
            return (
              <article key={s.id} className="mini-card grid gap-2">
                <strong className="text-sm leading-snug">{s.title}</strong>
                {s.detail && <p className="text-muted text-[13px] line-clamp-3">{s.detail}</p>}
                {sourceLabel && <span className="text-muted text-xs">Source: {sourceLabel}</span>}
                <div className="flex gap-1.5 mt-1">
                  <button
                    className="btn btn-soft btn-sm text-xs flex-1"
                    onClick={() => handleAdd(s)}
                    disabled={addMutation.isPending}
                  >
                    Add
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-xs flex-1"
                    onClick={() => handleDismiss(s)}
                    disabled={dismissMutation.isPending}
                  >
                    Dismiss
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop: inline panel */}
      <div className="hidden xl:block">
        <div className="panel p-5 sticky top-5">
          <div className="grid gap-2 mb-4">
            <span className="eyebrow"><span className="eyebrow-dot" />ai suggestions</span>
          </div>
          {panelContent}
        </div>
      </div>

      {/* Mobile: floating bubble */}
      <div className="xl:hidden">
        <div className="fixed bottom-20 right-4 z-[10]">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-14 h-14 rounded-full bg-linear-to-br from-[#d0d9fa] to-[#6d8dff] text-white shadow-[0_10px_24px_rgba(55,78,255,0.3)] inline-flex items-center justify-center cursor-pointer hover:shadow-[0_14px_28px_rgba(55,78,255,0.4)] transition-shadow relative"
            aria-label="Open AI suggestions"
          >
            <span className="text-lg font-extrabold">AI</span>
            {hasSuggestions && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-extrabold inline-flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>

        {mobileOpen && (
          <>
            <div className="fixed inset-0 bg-black/30 backdrop-blur-[4px] z-[11]" onClick={() => setMobileOpen(false)} />
            <div className="fixed bottom-0 left-0 right-0 z-[12] panel rounded-t-[22px] p-5 max-h-[70vh] overflow-y-auto">
              {panelContent}
            </div>
          </>
        )}
      </div>
    </>
  );
}
