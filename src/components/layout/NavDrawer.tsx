import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { SettingsRounded } from '@mui/icons-material';
import { NavLink } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/app/providers/AuthProvider';
import { BrandLogo } from './BrandLogo';
import { navItemsFor } from './navItems';

/** `< md` ekranlarda nav linklerini taşıyan koyu drawer. */
export function NavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const items = [
    ...navItemsFor(user?.role),
    { to: '/settings/profile', label: 'nav.settings', icon: <SettingsRounded /> },
  ];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: 280,
            bgcolor: 'inverse.main',
            color: 'inverse.contrastText',
            borderRadius: 0,
            pt: 'env(safe-area-inset-top)',
          },
        },
      }}
    >
      <Box sx={{ px: 2, py: 1.5 }} onClick={onClose}>
        <BrandLogo />
      </Box>
      <Divider sx={{ borderColor: 'inverse.accent', opacity: 0.4 }} />
      <List sx={{ px: 1 }}>
        {items.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            onClick={onClose}
            sx={{
              borderRadius: 2,
              minHeight: 48,
              mb: 0.5,
              '& .MuiListItemIcon-root': { color: 'inherit', minWidth: 40 },
              '&.active': { bgcolor: 'inverse.accentSoft', color: 'inverse.accent' },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={t(item.label)} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
