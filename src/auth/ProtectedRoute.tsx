import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { PropsWithChildren } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { user, loading, error, login } = useAuth();
  const loc = useLocation();
  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error && !user) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', height: '60vh', textAlign: 'center', px: 2 }}>
        <Typography variant="h6" gutterBottom>
          Session expired
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please sign in again to continue.
        </Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={login}>
          Sign in
        </Button>
      </Box>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children ? <>{children}</> : <Outlet />;
}
