import { MouseEvent, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Stack, Menu, MenuItem } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { IntegrationsDialog } from '../integrations/IntegrationsDialog';

export function TopBar() {
  const { user, login, logout } = useAuth();
  const initials = user?.name?.[0] || user?.email?.[0] || '?';
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [integrationsOpen, setIntegrationsOpen] = useState(false);

  const handleNewTodo = () => {
    const params = new URLSearchParams(location.search);
    params.set('new', '1');
    navigate({ pathname: '/app', search: params.toString() ? `?${params.toString()}` : '' });
  };

  const handleAdmin = () => {
    navigate('/admin');
  };

  const handleAvatarClick = (event: MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => setMenuAnchor(null);

  const handleLogoutClick = () => {
    handleCloseMenu();
    logout();
  };

  const handleAddProvider = () => {
    handleCloseMenu();
    setIntegrationsOpen(true);
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
              <MenuItem
                onClick={handleAddProvider}
                sx={{
                  bgcolor: '#7b1f1f',
                  color: '#fff',
                  borderRadius: 1,
                  '&:hover': { bgcolor: '#611717' },
                  mx: 1,
                  mt: 0.5,
                }}
              >
                Add Gmail
              </MenuItem>
              <MenuItem
                onClick={handleAddProvider}
                sx={{
                  bgcolor: '#1a73e8',
                  color: '#fff',
                  borderRadius: 1,
                  '&:hover': { bgcolor: '#155ec0' },
                  mx: 1,
                  mt: 0.5,
                }}
              >
                Add Outlook
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
      <IntegrationsDialog open={integrationsOpen} onClose={() => setIntegrationsOpen(false)} />
    </AppBar>
  );
}
