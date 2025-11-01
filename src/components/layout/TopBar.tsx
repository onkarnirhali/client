import { AppBar, Toolbar, Typography, Button, Box, Avatar, Stack } from '@mui/material';
import { useAuth } from '../../auth/useAuth';

export function TopBar() {
  const { user, login, logout } = useAuth();
  const initials = user?.name?.[0] || user?.email?.[0] || '?';
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          VibeCode
        </Typography>
        {user ? (
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2">{user.name || user.email}</Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>{initials.toUpperCase()}</Avatar>
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          </Stack>
        ) : (
          <Button color="inherit" onClick={login}>
            Sign in with Google
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
