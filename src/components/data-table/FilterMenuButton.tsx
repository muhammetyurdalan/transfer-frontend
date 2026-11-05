import { useState, type ReactNode } from 'react';
import { Badge, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import { CheckRounded } from '@mui/icons-material';

export type FilterMenuOption = { value: string; label: string };

type Props = {
  /** Tooltip ve erişilebilirlik etiketi */
  label: string;
  icon: ReactNode;
  /** Seçili değer; `null` = filtre yok */
  value: string | null;
  /** İlk satırda gösterilen "tümü" seçeneği (seçilince `null` döner) */
  allLabel: string;
  options: FilterMenuOption[];
  onChange: (value: string | null) => void;
};

/** Tek seçimli filtre: ikon buton + açılır liste. Filtre aktifken ikon renklenir ve nokta badge görünür. */
export function FilterMenuButton({ label, icon, value, allLabel, options, onChange }: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const select = (v: string | null) => {
    onChange(v);
    setAnchor(null);
  };
  const item = (v: string | null, text: string) => (
    <MenuItem key={v ?? ''} selected={value === v} onClick={() => select(v)} dense>
      <ListItemIcon>{value === v && <CheckRounded fontSize="small" />}</ListItemIcon>
      <ListItemText primary={text} />
    </MenuItem>
  );

  return (
    <>
      <Tooltip title={label}>
        <IconButton
          aria-label={label}
          aria-haspopup="menu"
          onClick={(e) => setAnchor(e.currentTarget)}
          color={value ? 'primary' : 'default'}
        >
          <Badge variant="dot" invisible={!value} color="primary">
            {icon}
          </Badge>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { maxHeight: 400, minWidth: 200 } } }}
      >
        {item(null, allLabel)}
        {options.map((o) => item(o.value, o.label))}
      </Menu>
    </>
  );
}
