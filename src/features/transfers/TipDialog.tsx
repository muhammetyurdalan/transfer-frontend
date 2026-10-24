import { useState } from 'react';
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { TipDriverDocument } from '@/graphql/generated/graphql';
import { useIsMobile } from '@/hooks/useIsMobile';
import { errorKey, getErrorCode } from '@/lib/errors';
import { formatMoney, toDecimal } from '@/lib/format';
import { pendingPaymentStore } from '@/lib/storage';

const PRESETS = [50, 100, 200, 500];

type Props = {
  transfer: { id: string; currency?: string | null } | null;
  onClose: () => void;
};

/** Bahşiş: hazır tutar çipleri + serbest tutar, ardından ödeme linkine gidilir (§8.6). */
export function TipDialog({ transfer, onClose }: Props) {
  const { t } = useTranslation('transfers');
  const mobile = useIsMobile();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [tip, { loading }] = useMutation(TipDriverDocument, { context: { skipErrorToast: true } });
  const currency = transfer?.currency ?? 'TRY';
  const value = Number(amount.replace(',', '.'));

  const close = () => {
    setAmount('');
    setError(null);
    onClose();
  };

  const submit = async () => {
    if (!transfer) return;
    if (!(value > 0)) {
      setError(t('tip.invalid'));
      return;
    }
    const res = await tip({ variables: { data: { id: transfer.id, amount: toDecimal(value) } } });
    const link = res.data?.tipDriver.paymentLink;
    if (res.error || !link) {
      setError(t(errorKey(getErrorCode(res.error))));
      return;
    }
    pendingPaymentStore.set({ transferId: transfer.id, kind: 'tip' });
    window.location.assign(link);
  };

  return (
    <Dialog
      open={!!transfer}
      onClose={loading ? undefined : close}
      fullWidth
      maxWidth="xs"
      fullScreen={mobile}
    >
      <DialogTitle>{t('tip.title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {PRESETS.map((p) => (
              <Chip
                key={p}
                label={formatMoney(p, currency)}
                color={value === p ? 'primary' : 'default'}
                variant={value === p ? 'filled' : 'outlined'}
                onClick={() => {
                  setAmount(String(p));
                  setError(null);
                }}
                sx={{ minHeight: 40, px: 1 }}
              />
            ))}
          </Stack>
          <TextField
            label={t('tip.custom')}
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value.replace(/[^\d.,]/g, ''));
              setError(null);
            }}
            error={!!error}
            helperText={error ?? ' '}
            slotProps={{
              htmlInput: { inputMode: 'decimal' },
              input: { endAdornment: <InputAdornment position="end">{currency}</InputAdornment> },
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={close} disabled={loading}>
          {t('common:actions.cancel')}
        </Button>
        <Button variant="contained" loading={loading} onClick={() => void submit()}>
          {t('tip.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
