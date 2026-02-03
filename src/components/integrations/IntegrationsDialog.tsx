import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
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
  const ingestEnabled = provider.ingestEnabled;
  const account = provider.metadata?.accountEmail as string | undefined;
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
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'rgba(15,17,26,0.08)',
        borderRadius: 2,
        p: 2.5,
        display: 'grid',
        gap: 1.2,
        backgroundColor: '#fff',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <MailOutlineIcon color={connected ? 'success' : 'disabled'} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {label}
        </Typography>
        {connected ? (
          <Chip size="small" icon={<CheckCircleIcon color="success" />} label="Connected" color="success" variant="outlined" />
        ) : (
          <Chip size="small" icon={<CancelIcon color="error" />} label="Not connected" color="default" variant="outlined" />
        )}
      </Stack>
      {account ? (
        <Typography variant="body2" color="text.secondary">
          Linked account: {account}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Connect to pull emails (and calendar) into AI suggestions.
        </Typography>
      )}
      <Stack direction="row" spacing={1}>
        {connected ? (
          <>
            <Button variant="outlined" size="small" onClick={handleDisconnect} disabled={disconnectMutation.isPending}>
              Disconnect
            </Button>
            {provider.provider === 'outlook' && (
              <Chip
                size="small"
                icon={<CalendarMonthIcon sx={{ fontSize: 16 }} />}
                label={ingestEnabled ? 'Ingest on' : 'Ingest off'}
                variant="outlined"
              />
            )}
          </>
        ) : (
          <Button variant="contained" size="small" onClick={handleConnect}>
            Connect {label}
          </Button>
        )}
      </Stack>
    </Box>
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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Connect email providers</DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Stack alignItems="center" py={3}>
            <CircularProgress />
          </Stack>
        ) : (
          <Stack spacing={2.5}>
            <ProviderCard provider={gmail} />
            <ProviderCard provider={outlook} />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
