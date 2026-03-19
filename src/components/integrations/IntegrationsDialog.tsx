import { Provider, useProviders, useDisconnectProvider } from '../../features/integrations/hooks';
import { API_BASE_URL } from '../../app/config/env';
import { useSnackbar } from '../feedback/SnackbarProvider';

type Props = {
  open: boolean;
  onClose: () => void;
};

function ProviderCard({ provider }: { provider: Provider }) {
  const label = provider.displayName || provider.provider;
  const connected = provider.linked;
  const account = provider.metadata?.accountEmail as string | undefined;
  const reconnectRequired = provider.metadata?.reconnectRequired === true;
  const { notify } = useSnackbar();
  const disconnectMutation = useDisconnectProvider();

  const handleConnect = () => {
    const base = API_BASE_URL || '';
    if (provider.provider === 'outlook') {
      window.location.href = `${base}/auth/outlook/start`;
    } else if (provider.provider === 'gmail') {
      window.location.href = `${base}/auth/google`;
    } else {
      notify('Unsupported provider', 'error');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectMutation.mutateAsync(provider.provider);
      notify(`${label} disconnected`, 'info');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to disconnect', 'error');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200/60 p-4 grid gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <strong className="text-sm">{label}</strong>
        {connected ? (
          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Connected</span>
        ) : reconnectRequired ? (
          <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">Reconnect required</span>
        ) : (
          <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-medium">Not connected</span>
        )}
      </div>
      {reconnectRequired && !connected && (
        <div className="text-sm text-amber-800 bg-amber-50 p-2 rounded-lg">
          Access expired. Reconnect to resume ingestion.
        </div>
      )}
      <p className="text-muted text-[13px]">
        {account ? `Linked account: ${account}` : 'Connect to pull emails into AI suggestions.'}
      </p>
      <div className="flex gap-2">
        {connected ? (
          <button className="px-3 py-1.5 text-xs font-medium text-muted border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" onClick={handleDisconnect} disabled={disconnectMutation.isPending}>
            Disconnect
          </button>
        ) : (
          <button className="px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:opacity-90 transition-colors" onClick={handleConnect}>
            {reconnectRequired ? `Reconnect ${label}` : `Connect ${label}`}
          </button>
        )}
      </div>
    </div>
  );
}

export function IntegrationsDialog({ open, onClose }: Props) {
  const { data: providers = [], isLoading } = useProviders();

  const outlook = providers.find((p) => p.provider === 'outlook') || {
    provider: 'outlook',
    displayName: 'Outlook',
    linked: false,
    ingestEnabled: false,
  };
  const gmail = providers.find((p) => p.provider === 'gmail') || {
    provider: 'gmail',
    displayName: 'Gmail',
    linked: false,
    ingestEnabled: false,
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="dialog-overlay absolute inset-0" onClick={onClose} />
      <div className="relative bg-white rounded-2xl border border-gray-200/60 shadow-2xl w-full max-w-md">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold">Connect email providers</h2>
          <button onClick={onClose} className="text-muted hover:text-text p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="px-6 py-5">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4">
              <ProviderCard provider={gmail} />
              <ProviderCard provider={outlook} />
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-[#f6f6f8]/50 flex justify-end rounded-b-2xl">
          <button className="px-4 py-2.5 text-sm font-medium text-muted border border-gray-200 rounded-[10px] hover:bg-white transition-colors" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
