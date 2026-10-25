import { useState } from 'react';
import { IconButton, ListItemIcon, Menu, MenuItem, Tooltip, useColorScheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { themeModeOptions } from '@/components/themeModeOptions';

/** Tema seçici (Açık / Koyu / Sistem) ikon menüsü: header'da ve giriş öncesi sayfaların sağ üstünde. */
export function ThemeModeMenu() {
  const { t } = useTranslation();
  const { mode, setMode } = useColorScheme();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const current = themeModeOptions.find((o) => o.value === mode) ?? themeModeOptions[0];

  return (
    <>
      <Tooltip title={t('nav.theme')}>
        <IconButton
          color="inherit"
          aria-label={t('nav.theme')}
          onClick={(e) => setAnchor(e.currentTarget)}
        >
          {current.icon}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {themeModeOptions.map((o) => (
          <MenuItem
            key={o.value}
            selected={o.value === mode}
            onClick={() => {
              setMode(o.value);
              setAnchor(null);
            }}
          >
            <ListItemIcon>{o.icon}</ListItemIcon>
            {t(o.label)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
