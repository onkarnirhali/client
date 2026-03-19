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
    <div className="mini-card grid gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <strong>{label}</strong>
        {connected ? (
          <span className="badge badge-done">Connected</span>
        ) : reconnectRequired ? (
          <span className="badge badge-accent">Reconnect required</span>
        ) : (
          <span className="badge badge-danger">Not connected</span>
        )}
      </div>
      {reconnectRequired && !connected && (
        <div className="text-sm text-[#815224] bg-accent-soft p-2 rounded-[var(--radius-xs)]">
          Access expired. Reconnect to resume ingestion.
        </div>
      )}
      <p className="text-muted text-[13px]">
        {account ? `Linked account: ${account}` : 'Connect to pull emails into AI suggestions.'}
      </p>
      <div className="flex gap-2">
        {connected ? (
          <button className="btn btn-secondary btn-sm" onClick={handleDisconnect} disabled={disconnectMutation.isPending}>
            Disconnect
          </button>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={handleConnect}>
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
    <>
      <div className="dialog-overlay" onClick={onClose} />
      <div className="dialog-content panel p-6 grid gap-5">
        <h2 className="text-lg font-extrabold">Connect email providers</h2>
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
        <div className="flex justify-end">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  );
}
