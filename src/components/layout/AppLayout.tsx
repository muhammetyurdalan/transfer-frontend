import { Suspense, useState } from 'react';
import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router';
import { PageSkeleton } from '@/components/feedback/LoadingSkeleton';
import { Header } from './Header';
import { NavDrawer } from './NavDrawer';

/** Giriş yapılmış sayfaların çerçevesi: header + drawer + `Container maxWidth="lg"`. */
export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Header onOpenDrawer={() => setDrawerOpen(true)} />
      <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <Container
        component="main"
        maxWidth="lg"
        sx={{ flexGrow: 1, py: { xs: 2, sm: 3, md: 4 }, pb: 'calc(24px + env(safe-area-inset-bottom))' }}
      >
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </Container>
    </Box>
  );
}
