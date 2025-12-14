import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';

export function AppLayout() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <TopBar />
      <Container maxWidth="lg" sx={{ mt: 4, pb: 6 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
