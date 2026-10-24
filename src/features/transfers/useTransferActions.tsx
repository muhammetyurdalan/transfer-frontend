import { useState } from 'react';
import {
  AssignmentIndRounded,
  CancelRounded,
  ChatRounded,
  CheckCircleRounded,
  DirectionsRounded,
  EditRounded,
  PaymentsRounded,
  PlayArrowRounded,
  VisibilityRounded,
  VolunteerActivismRounded,
} from '@mui/icons-material';
import { useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  UpdateTransferStatusDocument,
  type TransferRowFragment,
} from '@/graphql/generated/graphql';
import type { RowAction } from '@/components/data-table';
import { useAuth } from '@/app/providers/AuthProvider';
import { directionsLink } from '@/lib/geo';
import { AssignDriverDialog } from './AssignDriverDialog';
import { CancelTransferDialog } from './CancelTransferDialog';
import { TipDialog } from './TipDialog';
import { can } from './transferPermissions';

type Options = {
  /** Sürücü işlerinde başlat/tamamla ve yol tarifi de ⋮ menüsünde gösterilir */
  driverActions?: boolean;
};

/** Listelerde ⋮ aksiyonları ve bunların dialog'ları (§8.2, §8.7, §8.8). */
export function useTransferActions({ driverActions }: Options = {}) {
  const { t } = useTranslation('transfers');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [assignId, setAssignId] = useState<string | null>(null);
  const [tipTarget, setTipTarget] = useState<TransferRowFragment | null>(null);
  const [cancelTarget, setCancelTarget] = useState<TransferRowFragment | null>(null);
  const [updateStatus, { loading: statusLoading }] = useMutation(UpdateTransferStatusDocument, {
    refetchQueries: ['Transfers', 'Transfer'],
  });

  const changeStatus = async (row: TransferRowFragment, status: 'STARTED' | 'COMPLETED') => {
    const res = await updateStatus({ variables: { data: { id: row.id, status } } });
    if (!res.error) enqueueSnackbar(t('detail.statusUpdated'), { variant: 'success' });
  };

  const actions: RowAction<TransferRowFragment>[] = [
    {
      label: 'transfers:actions.details',
      icon: <VisibilityRounded />,
      onClick: (r) => void navigate(`/transfers/${r.id}`),
    },
    {
      label: 'transfers:actions.selectVehicle',
      icon: <PaymentsRounded />,
      visible: (r) => can.pay(user, r),
      onClick: (r) => void navigate(`/transfers/${r.id}/vehicle`),
    },
    {
      label: 'transfers:actions.edit',
      icon: <EditRounded />,
      visible: (r) => can.edit(user, r),
      onClick: (r) => void navigate(`/transfers/${r.id}/edit`),
    },
    {
      label: 'transfers:actions.assignDriver',
      icon: <AssignmentIndRounded />,
      visible: (r) => can.assign(user, r),
      onClick: (r) => setAssignId(r.id),
    },
    ...(driverActions
      ? [
          {
            label: 'transfers:actions.start',
            icon: <PlayArrowRounded />,
            visible: (r: TransferRowFragment) => can.start(user, r),
            onClick: (r: TransferRowFragment) => void changeStatus(r, 'STARTED'),
          },
          {
            label: 'transfers:actions.complete',
            icon: <CheckCircleRounded />,
            visible: (r: TransferRowFragment) => can.complete(user, r),
            onClick: (r: TransferRowFragment) => void changeStatus(r, 'COMPLETED'),
          },
          {
            label: 'transfers:actions.directions',
            icon: <DirectionsRounded />,
            visible: (r: TransferRowFragment) => !!r.pickupLatitude && !!r.pickupLongitude,
            onClick: (r: TransferRowFragment) =>
              window.open(
                directionsLink({ lat: Number(r.pickupLatitude), lng: Number(r.pickupLongitude) }),
                '_blank',
                'noopener',
              ),
          },
        ]
      : []),
    {
      label: 'transfers:actions.messages',
      icon: <ChatRounded />,
      visible: (r) => can.message(user, r),
      onClick: (r) => void navigate(`/transfers/${r.id}#messages`),
    },
    {
      label: 'transfers:actions.tip',
      icon: <VolunteerActivismRounded />,
      visible: (r) => can.tip(user, r),
      onClick: (r) => setTipTarget(r),
    },
    {
      label: 'transfers:actions.cancel',
      icon: <CancelRounded />,
      color: 'error',
      dividerBefore: true,
      visible: (r) => can.cancel(user, r),
      onClick: (r) => setCancelTarget(r),
    },
  ];

  const dialogs = (
    <>
      <AssignDriverDialog transferId={assignId} onClose={() => setAssignId(null)} />
      <TipDialog transfer={tipTarget} onClose={() => setTipTarget(null)} />
      <CancelTransferDialog transfer={cancelTarget} onClose={() => setCancelTarget(null)} />
    </>
  );

  return { actions, dialogs, changeStatus, statusLoading };
}
