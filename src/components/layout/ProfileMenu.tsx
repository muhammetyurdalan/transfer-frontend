import { useState } from 'react';
import { Box, Divider, IconButton, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material';
import { LogoutRounded, SettingsRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useCurrentUser, useAuth } from '@/app/providers/AuthProvider';
import { UserAvatar } from '@/components/UserAvatar';

export function ProfileMenu() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  return (
    <>
      <IconButton
        aria-label={t('nav.profile')}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ p: 0.5, ml: 0.5 }}
      >
        <UserAvatar user={user} size={28} ring />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 220 } } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {user.name || [user.firstName, user.lastName].filter(Boolean).join(' ')}
          </Typography>
          <Typography variant="caption" color="primary.dark">
            {user.role && t(`roles.${user.role}`)}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchor(null);
            void navigate('/settings/profile');
          }}
        >
          <ListItemIcon>
            <SettingsRounded fontSize="small" />
          </ListItemIcon>
          {t('nav.settings')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchor(null);
            void logout();
          }}
        >
          <ListItemIcon>
            <LogoutRounded fontSize="small" />
          </ListItemIcon>
          {t('nav.logout')}
        </MenuItem>
      </Menu>
    </>
  );
}
