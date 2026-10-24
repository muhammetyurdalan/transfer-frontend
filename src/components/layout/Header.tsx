import { AppBar, Box, Button, IconButton, Stack, Toolbar } from '@mui/material';
import { MenuRounded } from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/app/providers/AuthProvider';
import { NotificationMenu } from '@/features/notifications/NotificationMenu';
import { useIsCompact } from '@/hooks/useIsMobile';
import { BrandLogo } from './BrandLogo';
import { LanguageMenu } from './LanguageMenu';
import { ProfileMenu } from './ProfileMenu';
import { activeNavPath, navItemsFor } from './navItems';

/** Alt kenarı altın çizgili sticky header (§6.1). Renkler `inverse` token'ından. */
export function Header({ onOpenDrawer }: { onOpenDrawer: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const compact = useIsCompact();
  const items = navItemsFor(user?.role);
  const active = activeNavPath(items, pathname);

  return (
    <AppBar position="sticky" sx={{ pt: 'env(safe-area-inset-top)' }}>
      <Toolbar sx={{ gap: { xs: 0.5, sm: 1 }, minHeight: { xs: 60, sm: 68 } }}>
        {compact && (
          <IconButton color="inherit" size="large" edge="start" aria-label={t('nav.openMenu')} onClick={onOpenDrawer}>
            <MenuRounded />
          </IconButton>
        )}
        <BrandLogo />
        {!compact && (
          <Stack direction="row" spacing={0.5} sx={{ ml: 4 }} component="nav">
            {items.map((item) => (
              <Button
                key={item.to}
                component={RouterLink}
                to={item.to}
                color="inherit"
                className={item.to === active ? 'active' : undefined}
                aria-current={item.to === active ? 'page' : undefined}
                sx={{
                  px: 1.75,
                  opacity: 0.8,
                  borderRadius: 2,
                  '&.active': { opacity: 1, color: 'inverse.accent', bgcolor: 'inverse.accentSoft' },
                  '&:hover': { opacity: 1 },
                }}
              >
                {t(item.label)}
              </Button>
            ))}
          </Stack>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <NotificationMenu />
        <LanguageMenu />
        <ProfileMenu />
      </Toolbar>
    </AppBar>
  );
}
