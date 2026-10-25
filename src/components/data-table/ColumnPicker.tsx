import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
} from '@mui/material';
import { ViewColumnRounded } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { Column } from './types';

type Props<T> = {
  columns: Column<T>[];
  visible: string[];
  onChange: (keys: string[]) => void;
  onReset: () => void;
};

/** "Sütunları düzenle" butonu: checkbox'lı menüden tabloda gösterilecek sütunlar seçilir (en az bir sütun kalır). */
export function ColumnPicker<T>({ columns, visible, onChange, onReset }: Props<T>) {
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const toggle = (key: string) => {
    if (visible.includes(key)) {
      if (visible.length > 1) onChange(visible.filter((k) => k !== key));
    } else onChange([...visible, key]);
  };

  return (
    <>
      <Button
        size="small"
        color="inherit"
        startIcon={<ViewColumnRounded fontSize="small" />}
        aria-haspopup="menu"
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
      >
        {t('table.editColumns')}
      </Button>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { maxHeight: 420 } } }}
      >
        <ListSubheader disableSticky sx={{ lineHeight: '36px' }}>{t('table.columns')}</ListSubheader>
        {columns.map((c) => {
          const checked = visible.includes(c.key);
          return (
            <MenuItem
              key={c.key}
              dense
              onClick={() => toggle(c.key)}
              disabled={checked && visible.length === 1}
            >
              <ListItemIcon>
                <Checkbox checked={checked} size="small" edge="start" disableRipple />
              </ListItemIcon>
              <ListItemText primary={t(c.columnLabel ?? c.header)} />
            </MenuItem>
          );
        })}
        <Box sx={{ px: 1.5, pt: 0.5 }}>
          <Button size="small" fullWidth onClick={onReset}>
            {t('table.resetColumns')}
          </Button>
        </Box>
      </Menu>
    </>
  );
}
