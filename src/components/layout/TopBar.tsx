import { MouseEvent, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Stack, Menu, MenuItem, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { IntegrationsDialog } from '../integrations/IntegrationsDialog';
import { PrivacyDialog } from '../privacy/PrivacyDialog';
import { useProviders } from '../../features/integrations/hooks';
import { API_BASE_URL } from '../../app/config/env';
import { useSnackbar } from '../feedback/SnackbarProvider';

export function TopBar() {
  const { user, login, logout } = useAuth();
  const { data: providers = [], isLoading: providersLoading } = useProviders();
  const { notify } = useSnackbar();
  const initials = user?.name?.[0] || user?.email?.[0] || '?';
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [integrationsOpen, setIntegrationsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const handleNewTodo = () => {
    const params = new URLSearchParams(location.search);
    params.set('new', '1');
    navigate({ pathname: '/app', search: params.toString() ? `?${params.toString()}` : '' });
  };

  const handleAdmin = () => {
    navigate('/admin');
  };

  const handleNotes = () => {
    navigate('/app/notes');
  };

  const handleAvatarClick = (event: MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => setMenuAnchor(null);

  const handleLogoutClick = () => {
    handleCloseMenu();
    logout();
  };

  const gmail = providers.find((p) => p.provider === 'gmail') || {
    provider: 'gmail',
    displayName: 'Gmail',
    linked: false,
    ingestEnabled: false,
  };
  const outlook = providers.find((p) => p.provider === 'outlook') || {
    provider: 'outlook',
    displayName: 'Outlook',
    linked: false,
    ingestEnabled: false,
  };
  const reconnectRequiredProviders = providers.filter(
    (provider) => !provider.linked && provider.metadata?.reconnectRequired === true
  );
  const reconnectPrimary = reconnectRequiredProviders[0] || null;
  const reconnectLabel = reconnectPrimary?.displayName || reconnectPrimary?.provider || 'provider';

  const getProviderStateText = (linked: boolean, ingestEnabled: boolean) => {
    if (!linked) return 'Not connected';
    if (!ingestEnabled) return 'Connected (ingest off)';
    return 'Connected';
  };

  const connectProvider = (provider: string) => {
    const base = API_BASE_URL || '';
    if (provider === 'outlook') {
      window.location.href = `${base}/auth/outlook/start`;
      return;
    }
    if (provider === 'gmail') {
      window.location.href = `${base}/auth/google`;
      return;
    }
    notify('Unsupported provider', 'error');
  };

  const handleProviderMenuAction = (provider: string, linked: boolean) => {
    handleCloseMenu();
    if (linked) {
      setIntegrationsOpen(true);
      return;
    }
    connectProvider(provider);
  };

  const handleReconnectAction = () => {
    if (!reconnectPrimary) {
      setIntegrationsOpen(true);
      return;
    }
    if (reconnectRequiredProviders.length > 1) {
      setIntegrationsOpen(true);
      return;
    }
    connectProvider(reconnectPrimary.provider);
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      color="transparent"
      sx={{
        borderBottom: '1px solid',
        borderColor: 'rgba(15, 17, 26, 0.06)',
        backgroundColor: '#ffffff',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ gap: 2, py: 1.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1 }}>
          <Box
            component="span"
            sx={{
              width: 28,
              height: 28,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
            }}
          >
            <Box
              component="span"
              sx={{
                width: 24,
                height: 24,
                backgroundImage: 'url(/assets/logo-mark.svg)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
              }}
            />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Might as well
          </Typography>
        </Stack>

        {user ? (
          <Stack direction="row" spacing={2} alignItems="center">
            <Button variant="contained" onClick={handleNewTodo} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
              New Todo
            </Button>
            <Button variant="outlined" onClick={handleNotes}>
              Notes
            </Button>
            {user.role === 'admin' && (
              <Button variant="outlined" onClick={handleAdmin} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
                Admin
              </Button>
            )}
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" fontWeight={600}>
                  {user.name || user.email}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Avatar
                onClick={handleAvatarClick}
                sx={{ bgcolor: 'primary.main', width: 40, height: 40, cursor: 'pointer' }}
                aria-haspopup="true"
                aria-controls="profile-menu"
              >
                {initials.toUpperCase()}
              </Avatar>
            </Stack>
            <Menu
              id="profile-menu"
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleCloseMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { minWidth: 180, mt: 1 } }}
            >
              {providersLoading ? (
                <MenuItem disabled sx={{ mx: 1, mt: 0.5, borderRadius: 1 }}>
                  Loading connections...
                </MenuItem>
              ) : (
                <>
                  <MenuItem
                    onClick={() => handleProviderMenuAction('gmail', gmail.linked)}
                    sx={{
                      bgcolor: gmail.linked && gmail.ingestEnabled ? '#1b5e20' : gmail.linked ? '#7d6608' : '#7b1f1f',
                      color: '#fff',
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: gmail.linked && gmail.ingestEnabled ? '#144a19' : gmail.linked ? '#6a5607' : '#611717',
                      },
                      mx: 1,
                      mt: 0.5,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      {gmail.linked && gmail.ingestEnabled ? (
                        <CheckCircleIcon fontSize="small" />
                      ) : gmail.linked ? (
                        <SyncProblemIcon fontSize="small" />
                      ) : (
                        <LinkOffIcon fontSize="small" />
                      )}
                      <Typography variant="body2">
                        {gmail.linked ? 'Gmail Connected' : 'Connect Gmail'}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {getProviderStateText(gmail.linked, gmail.ingestEnabled)}
                      </Typography>
                    </Stack>
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleProviderMenuAction('outlook', outlook.linked)}
                    sx={{
                      bgcolor: outlook.linked && outlook.ingestEnabled ? '#1a73e8' : outlook.linked ? '#7d6608' : '#374151',
                      color: '#fff',
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: outlook.linked && outlook.ingestEnabled ? '#155ec0' : outlook.linked ? '#6a5607' : '#1f2937',
                      },
                      mx: 1,
                      mt: 0.5,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      {outlook.linked && outlook.ingestEnabled ? (
                        <CheckCircleIcon fontSize="small" />
                      ) : outlook.linked ? (
                        <SyncProblemIcon fontSize="small" />
                      ) : (
                        <LinkOffIcon fontSize="small" />
                      )}
                      <Typography variant="body2">
                        {outlook.linked ? 'Outlook Connected' : 'Connect Outlook'}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {getProviderStateText(outlook.linked, outlook.ingestEnabled)}
                      </Typography>
                    </Stack>
                  </MenuItem>
                </>
              )}
              <MenuItem
                onClick={() => {
                  handleCloseMenu();
                  setIntegrationsOpen(true);
                }}
                sx={{ mx: 1, mt: 0.5, borderRadius: 1 }}
              >
                Manage Integrations
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleCloseMenu();
                  setPrivacyOpen(true);
                }}
                sx={{ mx: 1, mt: 0.5, borderRadius: 1 }}
              >
                Privacy Controls
              </MenuItem>
              <MenuItem onClick={handleLogoutClick} sx={{ mx: 1, mt: 0.5, borderRadius: 1 }}>
                Logout
              </MenuItem>
            </Menu>
          </Stack>
        ) : (
          <Button variant="contained" onClick={login}>
            Sign in with Google
          </Button>
        )}
      </Toolbar>
      {reconnectRequiredProviders.length > 0 && (
        <Box sx={{ px: 2, pb: 1.5 }}>
          <Alert
            severity="warning"
            action={(
              <Button color="inherit" size="small" onClick={handleReconnectAction}>
                {reconnectRequiredProviders.length === 1 ? `Reconnect ${reconnectLabel}` : 'Manage Integrations'}
              </Button>
            )}
          >
            {reconnectRequiredProviders.length === 1
              ? `${reconnectLabel} access expired. Reconnect to resume email-based suggestions.`
              : 'Some email providers need reconnection to resume email-based suggestions.'}
          </Alert>
        </Box>
      )}
      <IntegrationsDialog open={integrationsOpen} onClose={() => setIntegrationsOpen(false)} />
      <PrivacyDialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </AppBar>
  );
}
