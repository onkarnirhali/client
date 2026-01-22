import { Box, Button, Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import { useAuth } from '../auth/useAuth';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

export function LoginPage() {
  const { login } = useAuth();
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#ffffff', // Clean white background as per screenshot
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Main Hero Section */}
      <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', alignItems: 'center', py: { xs: 4, md: 8 } }}>
        <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
          {/* Text Content */}
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                color: '#0f111a',
              }}
            >
              Turn important emails into tasks
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                mb: 4,
                fontSize: { xs: '1.125rem', md: '1.25rem' },
                lineHeight: 1.6,
                maxWidth: 480,
                mx: { xs: 'auto', md: 0 },
              }}
            >
              Might As Well uses AI to automatically extract actionable to-dos from your inbox, saving you time and effort.
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={login}
              startIcon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M22.56 12.25c0-.8-.07-1.57-.2-2.33H12v4.44h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.76 3.28-8.2Z" />
                  <path d="M12 23c2.97 0 5.45-.99 7.27-2.7l-3.56-2.77c-.99.66-2.26 1.05-3.71 1.05-2.85 0-5.27-1.92-6.14-4.51H2.16v2.84A11 11 0 0 0 12 23Z" />
                  <path d="M5.86 14.07a6.6 6.6 0 0 1 0-4.14V7.09H2.16a11 11 0 0 0 0 9.82l3.7-2.84Z" />
                  <path d="M12 4.58c1.62 0 3.07.56 4.21 1.66l3.15-3.15A10.98 10.98 0 0 0 12 1 11 11 0 0 0 2.16 7.09l3.7 2.84C6.73 6.5 9.15 4.58 12 4.58Z" />
                </svg>
              }
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '50px',
                bgcolor: '#1a73e8',
                boxShadow: '0 4px 12px rgba(26,115,232,0.25)',
                '&:hover': {
                  bgcolor: '#1557b0',
                  boxShadow: '0 6px 16px rgba(26,115,232,0.35)',
                },
              }}
            >
              Sign in with Google
            </Button>
          </Grid>

          {/* Hero Illustration */}
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box
              component="img"
              src="/assets/welcome-hero.png"
              alt="Illustration of task management"
              sx={{
                width: '100%',
                maxWidth: 600,
                height: 'auto',
                filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.06))',
              }}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Features / How it works Footer */}
      <Box sx={{ bgcolor: '#ffffff', py: 8, borderTop: '1px solid', borderColor: 'rgba(0,0,0,0.04)' }}>
        <Container maxWidth="lg">
          <Typography variant="h6" align="center" sx={{ fontWeight: 700, mb: 6 }}>
            How it works
          </Typography>

          <Grid container spacing={4} transform="translateZ(0)">
            {/* Feature 1 */}
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={2.5}>
                <MarkEmailReadIcon fontSize="large" sx={{ color: 'primary.main', fontSize: 40 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Connect Your Inbox
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    We analyze incoming emails.
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            {/* Feature 2 */}
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={2.5}>
                <PsychologyIcon fontSize="large" sx={{ color: 'primary.main', fontSize: 40 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                    AI Extracts Tasks
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Smart technology identifies actions.
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            {/* Feature 3 */}
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={2.5}>
                <AssignmentTurnedInIcon fontSize="large" sx={{ color: 'primary.main', fontSize: 40 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Get Organized
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Review and manage your to-dos.
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
