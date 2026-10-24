import type { ReactNode } from 'react';
import { Button } from '@mui/material';
import {
  AssignmentIndRounded,
  CancelRounded,
  CheckCircleRounded,
  EditRounded,
  PaymentsRounded,
  PlayArrowRounded,
  VolunteerActivismRounded,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { TransferDetailFragment } from '@/graphql/generated/graphql';
import { useAuth } from '@/app/providers/AuthProvider';
import { can } from './transferPermissions';

type Props = {
  transfer: TransferDetailFragment;
  /** Koyu alt bar içinde (mobil) */
  onDark?: boolean;
  statusLoading: boolean;
  onStatus: (status: 'STARTED' | 'COMPLETED') => void;
  onAssign: () => void;
  onTip: () => void;
  onCancel: () => void;
};

/** Detay aksiyon butonları (§8.6). Masaüstünde PageHeader sağında, mobilde alt sabit bar'da. */
export function TransferDetailActions({
  transfer,
  onDark,
  statusLoading,
  onStatus,
  onAssign,
  onTip,
  onCancel,
}: Props) {
  const { t } = useTranslation('transfers');
  const { user } = useAuth();
  const buttons: ReactNode[] = [];
  const secondaryColor = onDark ? 'inherit' : 'secondary';

  if (can.pay(user, transfer))
    buttons.push(
      <Button
        key="pay"
        variant="contained"
        component={RouterLink}
        to={`/transfers/${transfer.id}/vehicle`}
        startIcon={<PaymentsRounded />}
      >
        {t('actions.selectVehicle')}
      </Button>,
    );
  if (can.edit(user, transfer))
    buttons.push(
      <Button
        key="edit"
        variant="outlined"
        color={secondaryColor}
        component={RouterLink}
        to={`/transfers/${transfer.id}/edit`}
        startIcon={<EditRounded />}
      >
        {t('actions.edit')}
      </Button>,
    );
  if (can.assign(user, transfer))
    buttons.push(
      <Button
        key="assign"
        variant="contained"
        onClick={onAssign}
        startIcon={<AssignmentIndRounded />}
      >
        {t(transfer.status === 'ASSIGNED' ? 'actions.changeDriver' : 'actions.assignDriver')}
      </Button>,
    );
  if (can.start(user, transfer))
    buttons.push(
      <Button
        key="start"
        variant="contained"
        loading={statusLoading}
        onClick={() => onStatus('STARTED')}
        startIcon={<PlayArrowRounded />}
      >
        {t('actions.start')}
      </Button>,
    );
  if (can.complete(user, transfer))
    buttons.push(
      <Button
        key="complete"
        variant="contained"
        loading={statusLoading}
        onClick={() => onStatus('COMPLETED')}
        startIcon={<CheckCircleRounded />}
      >
        {t('actions.complete')}
      </Button>,
    );
  if (can.tip(user, transfer))
    buttons.push(
      <Button
        key="tip"
        variant="contained"
        onClick={onTip}
        startIcon={<VolunteerActivismRounded />}
      >
        {t('actions.tip')}
      </Button>,
    );
  if (can.cancel(user, transfer))
    buttons.push(
      <Button
        key="cancel"
        variant="outlined"
        color="error"
        onClick={onCancel}
        startIcon={<CancelRounded />}
      >
        {t('actions.cancel')}
      </Button>,
    );

  return buttons.length ? <>{buttons}</> : null;
}
