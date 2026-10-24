import { Chip, type ChipProps } from '@mui/material';
import {
  AssignmentIndRounded,
  CancelRounded,
  CheckCircleRounded,
  DirectionsCarRounded,
  HourglassEmptyRounded,
  PaymentsRounded,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { TransactionCategory, TransferStatus } from '@/graphql/generated/graphql';

const STATUS: Record<TransferStatus, { color: ChipProps['color']; icon: React.ReactElement }> = {
  PENDING: { color: 'default', icon: <HourglassEmptyRounded /> },
  PAID: { color: 'info', icon: <PaymentsRounded /> },
  ASSIGNED: { color: 'primary', icon: <AssignmentIndRounded /> },
  STARTED: { color: 'warning', icon: <DirectionsCarRounded /> },
  COMPLETED: { color: 'success', icon: <CheckCircleRounded /> },
  CANCELLED: { color: 'error', icon: <CancelRounded /> },
};

export function StatusChip({ status, size = 'small' }: { status?: TransferStatus | null; size?: ChipProps['size'] }) {
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
