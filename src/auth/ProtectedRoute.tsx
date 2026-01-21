import { Box, CircularProgress } from '@mui/material';
import { PropsWithChildren } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { user, loading, error, login } = useAuth();
  const loc = useLocation();
  // Gate routes: show spinner during auth fetch, offer re-login on session expiry
  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error && !user) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children ? <>{children}</> : <Outlet />;
}
