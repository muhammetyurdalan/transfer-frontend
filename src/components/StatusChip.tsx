import { Chip, type ChipProps } from '@mui/material';
import {
  AssignmentIndRounded,
  CancelRounded,
  CheckCircleRounded,
  DirectionsCarRounded,
  HourglassEmptyRounded
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { TransactionCategory, TransferStatus } from '@/graphql/generated/graphql';

const STATUS: Record<TransferStatus, { color: ChipProps['color']; icon: React.ReactElement }> = {
  PENDING: { color: 'default', icon: <HourglassEmptyRounded /> },
  ACCEPTED: { color: 'info', icon: <AssignmentIndRounded /> },
  STARTED: { color: 'warning', icon: <DirectionsCarRounded /> },
  COMPLETED: { color: 'success', icon: <CheckCircleRounded /> },
  CANCELLED: { color: 'error', icon: <CancelRounded /> },
  WITHDRAWN: { color: 'error', icon: <CancelRounded /> }
};

/** Tablolarda tüm durumlar aynı genişlikte görünsün diye en uzun etiketi ("Kabul edildi", "İptal edildi") sığdıran genişlik */
const FIXED_WIDTH = 100;

export function StatusChip({
  status,
  size = 'small',
  fixedWidth,
}: {
  status?: TransferStatus | null;
  size?: ChipProps['size'];
  /** Tüm durumlar aynı genişlikte (etiket daha uzunsa genişler) */
  fixedWidth?: boolean;
}) {
  const { t } = useTranslation();
  if (!status) return null;
  const s = STATUS[status];
  return (
    <Chip
      size={size}
      color={s.color}
      icon={s.icon}
      label={t(`status.${status}`)}
      variant={status === 'PENDING' ? 'outlined' : 'filled'}
      sx={
        fixedWidth
          ? { minWidth: FIXED_WIDTH, justifyContent: 'flex-start', '& .MuiChip-label': { px: 0.75 } }
          : undefined
      }
    />
  );
}

const CATEGORY: Record<TransactionCategory, ChipProps['color']> = {
  PAYMENT: 'primary',
  TIP: 'secondary',
  REFUND: 'warning',
};

export function TransactionChip({ category }: { category?: TransactionCategory | null }) {
  const { t } = useTranslation();
  if (!category) return null;
  return <Chip size="small" color={CATEGORY[category]} label={t(`transactionCategory.${category}`)} />;
}
