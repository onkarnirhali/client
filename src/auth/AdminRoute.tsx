import { Box, CircularProgress } from '@mui/material';
import { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export function AdminRoute({ children }: PropsWithChildren) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/app" replace />;
  }

  return children ? <>{children}</> : null;
}
