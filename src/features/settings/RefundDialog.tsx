import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, TextField } from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { RefundTransactionDocument, type TransactionItemFragment } from '@/graphql/generated/graphql';
import { useIsMobile } from '@/hooks/useIsMobile';
import { errorKey, getErrorCode } from '@/lib/errors';
import { formatMoney, toDecimal } from '@/lib/format';

const schema = z.object({
  amount: z
    .string()
    .refine((v) => v.trim() === '' || (/^\d+([.,]\d{1,2})?$/.test(v.trim()) && Number(v.replace(',', '.')) > 0), 'settings:statement.refund.invalidAmount'),
  note: z.string(),
});
type FormValues = z.infer<typeof schema>;

type Props = { transaction: TransactionItemFragment | null; onClose: () => void; onDone: () => void };

/** İade (§8.12, ADMIN/STAFF). Tutar boşsa kalan tutarın tamamı iade edilir. */
export function RefundDialog({ transaction, ...rest }: Props) {
  return transaction ? <Inner transaction={transaction} {...rest} /> : null;
}

function Inner({ transaction, onClose, onDone }: Props & { transaction: TransactionItemFragment }) {
  const { t } = useTranslation();
  const mobile = useIsMobile();
  const { enqueueSnackbar } = useSnackbar();
  const [refund, { loading }] = useMutation(RefundTransactionDocument, { context: { skipErrorToast: true } });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { amount: '', note: '' } });

  const onSubmit = handleSubmit(async (v) => {
    try {
      await refund({
        variables: {
          data: {
            id: transaction.id,
            amount: v.amount.trim() ? toDecimal(v.amount.replace(',', '.')) : undefined,
            note: v.note.trim() || undefined,
          },
        },
      });
      enqueueSnackbar(t('settings:statement.refund.done'), { variant: 'success' });
      onDone();
      onClose();
    } catch (error) {
      const code = getErrorCode(error);
      if (code === 'ERR032') setError('amount', { message: errorKey(code) });
      else enqueueSnackbar(t(errorKey(code)), { variant: 'error' });
    }
  });

  return (
    <Dialog open onClose={loading ? undefined : onClose} fullWidth maxWidth="xs" fullScreen={mobile}>
      <form onSubmit={onSubmit} noValidate style={{ display: 'contents' }}>
        <DialogTitle>{t('settings:statement.refund.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t('settings:statement.refund.body', { amount: formatMoney(transaction.orderAmount, transaction.currency) })}
          </DialogContentText>
          <Stack spacing={2}>
            <TextField
              autoFocus
              label={t('settings:statement.refund.amount')}
              {...register('amount')}
              error={!!errors.amount}
              helperText={errors.amount?.message ? t(errors.amount.message) : t('settings:statement.refund.amountHelp')}
              slotProps={{ htmlInput: { inputMode: 'decimal' } }}
            />
            <TextField multiline minRows={2} label={t('settings:statement.refund.note')} {...register('note')} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={onClose} disabled={loading}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit" variant="contained" color="warning" loading={loading}>
            {t('settings:statement.refund.submit')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
