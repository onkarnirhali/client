import { Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';

export function AppLayout() {
  return (
    <>
      <TopBar />
      <Container maxWidth="md" sx={{ mt: 3 }}>
        <Outlet />
      </Container>
    </>
  );
}

