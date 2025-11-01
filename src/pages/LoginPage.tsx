import { Box, Button, Paper, Typography } from '@mui/material';
import { useAuth } from '../auth/useAuth';

export function LoginPage() {
  const { login } = useAuth();
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', height: '70vh' }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Welcome to VibeCode
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Sign in to continue
        </Typography>
        <Button variant="contained" onClick={login}>Sign in with Google</Button>
      </Paper>
    </Box>
  );
}

