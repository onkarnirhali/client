import { AppBar, Toolbar, Typography, Button, Box, Avatar, Stack } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';

export function TopBar() {
  const { user, login, logout } = useAuth();
  const initials = user?.name?.[0] || user?.email?.[0] || '?';
  const navigate = useNavigate();
  const location = useLocation();

  const handleNewTodo = () => {
    const params = new URLSearchParams(location.search);
    params.set('new', '1');
    navigate({ pathname: '/app', search: params.toString() ? `?${params.toString()}` : '' });
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
            VibeCode
          </Typography>
        </Stack>

        {user ? (
          <Stack direction="row" spacing={2} alignItems="center">
            <Button variant="contained" onClick={handleNewTodo} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
              New Todo
            </Button>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" fontWeight={600}>
                  {user.name || user.email}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>{initials.toUpperCase()}</Avatar>
              <Button variant="text" color="inherit" onClick={logout} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
                Logout
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Button variant="contained" onClick={login}>
            Sign in with Google
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
