import { useEffect, useState } from 'react';
import { Alert, Button, LinearProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import type { TransferStatus } from '@/graphql/generated/graphql';
import { useAppEvent } from '@/app/providers/SubscriptionProvider';
import { pendingPaymentStore, type PendingPayment } from '@/lib/storage';

const POLL_MS = 5_000;
const MAX_WAIT_MS = 120_000;

type Props = {
  transferId: string;
  status?: TransferStatus | null;
  refetch: () => void;
};

type Phase = 'checking' | 'failed' | 'timeout';

/**
 * Ödeme sayfasından dönüşte sonucu bekler (§8.4 "Ödeme sonrası").
 * URL parametresine güvenilmez: WebSocket olayı veya (ödeme için) status poll'u ile doğrulanır.
 */
export function PaymentPendingBanner({ transferId, status, refetch }: Props) {
  const { t } = useTranslation('transfers');
  const { enqueueSnackbar } = useSnackbar();
  const [pending, setPending] = useState<PendingPayment | null>(() => {
    const p = pendingPaymentStore.get();
    return p?.transferId === transferId ? p : null;
  });
  const [phase, setPhase] = useState<Phase>('checking');
  const isTip = pending?.kind === 'tip';
  // Poll/olay sonrası status değiştiyse (PAID veya ileri) ödeme sonuçlanmıştır.
  const resolvedByStatus =
    !!pending && !isTip && phase === 'checking' && !!status && status !== 'PENDING';

  const finish = (ok: boolean) => {
    pendingPaymentStore.set(null);
    refetch();
    if (ok) {
      enqueueSnackbar(t(isTip ? 'payment.tipSuccess' : 'payment.success'), { variant: 'success' });
      setPending(null);
    } else {
      setPhase('failed');
    }
  };

  useAppEvent(
    ['PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'TIP_PAYMENT_SUCCESS', 'TIP_PAYMENT_FAILED'],
    (e) => {
      if (!pending || phase !== 'checking' || e.transferId !== transferId) return;
      const tipEvent = e.action.startsWith('TIP_');
      if (tipEvent !== isTip) return;
      finish(e.action.endsWith('SUCCESS'));
    },
  );

  // Ödemede yedek kontrol: status PENDING kaldıkça 5 sn'de bir, en fazla 2 dk.
  useEffect(() => {
    if (!pending || phase !== 'checking' || resolvedByStatus) return;
    const started = Date.now();
    const id = setInterval(() => {
      if (Date.now() - started > MAX_WAIT_MS) {
        setPhase('timeout');
        pendingPaymentStore.set(null);
        clearInterval(id);
        return;
      }
      if (!isTip) refetch();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [pending, phase, isTip, refetch, resolvedByStatus]);

  useEffect(() => {
    if (!resolvedByStatus) return;
    pendingPaymentStore.set(null);
    if (status !== 'CANCELLED') enqueueSnackbar(t('payment.success'), { variant: 'success' });
  }, [resolvedByStatus, status, enqueueSnackbar, t]);

  if (!pending || resolvedByStatus) return null;

  if (phase === 'failed') {
    return (
      <Alert
        severity="error"
        sx={{ mb: 2 }}
        onClose={() => setPending(null)}
        action={
          !isTip && (
            <Button
              color="inherit"
              size="small"
              component={RouterLink}
              to={`/transfers/${transferId}/vehicle`}
            >
              {t('payment.payAgain')}
            </Button>
          )
        }
      >
        {t(isTip ? 'payment.tipFailed' : 'payment.failed')}
      </Alert>
    );
  }

  if (phase === 'timeout') {
    return (
      <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setPending(null)}>
        {t('payment.timeout')}
      </Alert>
    );
  }

  return (
    <Alert
      severity="info"
      icon={false}
      sx={{
        mb: 2,
        display: 'block',
        bgcolor: 'highlight.main',
        color: 'text.primary',
        border: 1,
        borderColor: 'highlight.border',
      }}
    >
      {t(isTip ? 'payment.checkingTip' : 'payment.checking')}
      <LinearProgress sx={{ mt: 1, borderRadius: 2 }} />
    </Alert>
  );
}
