import { Fragment, useState } from 'react';
import { Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { MoreVertRounded } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { RowAction } from './types';

/** ⋮ menüsü. Görünür aksiyon yoksa hiç render edilmez. Tıklama satır tıklamasını tetiklemez. */
export function RowActions<T>({ row, actions }: { row: T; actions: RowAction<T>[] }) {
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const visible = actions.filter((a) => !a.visible || a.visible(row));
  if (visible.length === 0) return null;

  return (
    <>
      <IconButton
        aria-label={t('actions.more')}
        onClick={(e) => {
          e.stopPropagation();
          setAnchor(e.currentTarget);
        }}
        sx={{ width: 44, height: 44 }}
      >
        <MoreVertRounded />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {visible.map((a, i) => (
          <Fragment key={a.label}>
            {a.dividerBefore && i > 0 && <Divider />}
            <MenuItem
              onClick={() => {
                setAnchor(null);
                a.onClick(row);
              }}
              sx={a.color === 'error' ? { color: 'error.main' } : undefined}
            >
              <ListItemIcon sx={a.color === 'error' ? { color: 'error.main' } : undefined}>{a.icon}</ListItemIcon>
              <ListItemText>{t(a.label)}</ListItemText>
            </MenuItem>
          </Fragment>
        ))}
      </Menu>
    </>
  );
}
