import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useAuth } from '../auth/useAuth';

export function LoginPage() {
  const { login } = useAuth();
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f6f6f8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'rgba(15,17,26,0.08)',
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            VibeCode
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to continue
          </Typography>
        </Stack>
        <Button
          fullWidth
          variant="contained"
          onClick={login}
          startIcon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M22.56 12.25c0-.8-.07-1.57-.2-2.33H12v4.44h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.76 3.28-8.2Z" />
              <path d="M12 23c2.97 0 5.45-.99 7.27-2.7l-3.56-2.77c-.99.66-2.26 1.05-3.71 1.05-2.85 0-5.27-1.92-6.14-4.51H2.16v2.84A11 11 0 0 0 12 23Z" />
              <path d="M5.86 14.07a6.6 6.6 0 0 1 0-4.14V7.09H2.16a11 11 0 0 0 0 9.82l3.7-2.84Z" />
              <path d="M12 4.58c1.62 0 3.07.56 4.21 1.66l3.15-3.15A10.98 10.98 0 0 0 12 1 11 11 0 0 0 2.16 7.09l3.7 2.84C6.73 6.5 9.15 4.58 12 4.58Z" />
            </svg>
          }
          sx={{ fontWeight: 700, py: 1.5 }}
        >
          Sign in with Google
        </Button>
      </Paper>
    </Box>
  );
}
