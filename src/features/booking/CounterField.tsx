import { IconButton, Stack, Typography } from '@mui/material';
import { AddRounded, RemoveRounded } from '@mui/icons-material';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  label: string;
  icon?: ReactNode;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  error?: string;
};

/** − değer + stepper (44px dokunma hedefleri). */
export function CounterField({ label, icon, value, onChange, min = 0, max = 99, error }: Props) {
  const { t } = useTranslation('booking');
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        border: 1,
        borderColor: error ? 'error.main' : 'divider',
        borderRadius: 3,
        pl: 1.5,
        pr: 0.5,
        py: 0.5,
        minHeight: 56,
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0, color: 'text.secondary' }}>
        {icon}
        <Typography variant="body2" color="text.primary" noWrap>
          {label}
        </Typography>
      </Stack>
      <Stack direction="row" sx={{ alignItems: 'center' }}>
        <IconButton
          aria-label={t('fields.decrease', { field: label })}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          sx={{ width: 44, height: 44 }}
        >
          <RemoveRounded />
        </IconButton>
        <Typography
          aria-live="polite"
          sx={{ minWidth: 28, textAlign: 'center', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
        >
          {value}
        </Typography>
        <IconButton
          aria-label={t('fields.increase', { field: label })}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          sx={{ width: 44, height: 44, color: 'primary.dark' }}
        >
          <AddRounded />
        </IconButton>
      </Stack>
    </Stack>
  );
}
