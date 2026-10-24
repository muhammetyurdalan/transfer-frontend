import { AppBar, Box, Button, IconButton, Stack, Toolbar, Tooltip } from '@mui/material';
import { AddRounded, MenuRounded } from '@mui/icons-material';
import { NavLink, Link as RouterLink } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/app/providers/AuthProvider';
import { NotificationMenu } from '@/features/notifications/NotificationMenu';
import { useIsCompact, useIsMobile } from '@/hooks/useIsMobile';
import { BrandLogo } from './BrandLogo';
import { LanguageMenu } from './LanguageMenu';
import { ProfileMenu } from './ProfileMenu';
import { navItemsFor } from './navItems';

/** Koyu siyah, alt kenarı altın çizgili sticky header (§6.1). */
export function Header({ onOpenDrawer }: { onOpenDrawer: () => void }) {
  const { t } = useTranslation();
  const { user, hasRole } = useAuth();
  const compact = useIsCompact();
  const mobile = useIsMobile();
  const items = navItemsFor(user?.role);

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
                component={NavLink}
                to={item.to}
                color="inherit"
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
        {hasRole('CUSTOMER') &&
          (mobile ? (
            <Tooltip title={t('nav.createTransfer')}>
              <IconButton
                component={RouterLink}
                to="/transfers/new"
                size="large"
                aria-label={t('nav.createTransfer')}
                sx={{ color: 'inverse.accent' }}
              >
                <AddRounded />
              </IconButton>
            </Tooltip>
          ) : (
            <Button
              component={RouterLink}
              to="/transfers/new"
              variant="contained"
              startIcon={<AddRounded />}
              sx={{ mr: 1 }}
            >
              {t('nav.createTransfer')}
            </Button>
          ))}
        <NotificationMenu />
        <LanguageMenu />
        <ProfileMenu />
      </Toolbar>
    </AppBar>
  );
}
