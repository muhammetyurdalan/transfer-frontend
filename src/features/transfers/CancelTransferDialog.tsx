import { Stack, Typography } from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { CancelTransferDocument, type TransferStatus } from '@/graphql/generated/graphql';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useAuth } from '@/app/providers/AuthProvider';

type Props = {
  transfer: { id: string; status?: TransferStatus | null } | null;
  onClose: () => void;
};

/** İptal onayı: metin duruma göre değişir (§8.6). */
export function CancelTransferDialog({ transfer, onClose }: Props) {
  const { t } = useTranslation('transfers');
  const { hasRole } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [cancel, { loading }] = useMutation(CancelTransferDocument, {
    refetchQueries: ['Transfers', 'Transfer', 'TransferTransactions'],
  });

  const paid = transfer?.status === 'PAID' || transfer?.status === 'ASSIGNED';

  return (
    <ConfirmDialog
      open={!!transfer}
      destructive
      loading={loading}
      title={t('cancel.title', { id: transfer?.id })}
      confirmLabel={t('cancel.confirm')}
      description={
        <Stack spacing={1}>
          <Typography>{paid ? t('cancel.paid') : t('cancel.pending')}</Typography>
          {paid && hasRole('CUSTOMER') && (
            <Typography variant="body2" color="text.secondary">
              {t('cancel.customerFee')}
            </Typography>
          )}
        </Stack>
      }
      onClose={onClose}
      onConfirm={async () => {
        if (!transfer) return;
        const res = await cancel({ variables: { id: transfer.id } });
        if (!res.error) {
          enqueueSnackbar(t('cancel.done'), { variant: 'success' });
          onClose();
        } else {
          onClose();
        }
      }}
    />
  );
}
