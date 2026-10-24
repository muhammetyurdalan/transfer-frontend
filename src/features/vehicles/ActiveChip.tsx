import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

export function ActiveChip({ active }: { active?: boolean | null }) {
  const { t } = useTranslation();
  return (
    <Chip
      size="small"
      color={active ? 'success' : 'default'}
      variant={active ? 'filled' : 'outlined'}
      label={t(active ? 'active' : 'inactive')}
    />
  );
}
