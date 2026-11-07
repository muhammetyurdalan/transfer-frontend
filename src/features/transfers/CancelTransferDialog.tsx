import { Box, Divider, Stack, Typography } from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { CancelTransferDocument, type TransferStatus } from '@/graphql/generated/graphql';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useAuth } from '@/app/providers/AuthProvider';
import { formatMoney } from '@/lib/format';
import { applicableTier, penaltyTiers, refundSplit, type PenaltyTier } from './refundPolicy';

type Props = {
  transfer: {
    id: string;
    status?: TransferStatus | null;
    pickupTime?: string | null;
    price?: string | null;
    currency?: string | null;
    /** Detay sayfasından gelir; bölgenin iptal cezası basamakları */
    state?: { customerImposedHours?: unknown; customerImposedRates?: unknown } | null;
  } | null;
  onClose: () => void;
};

const pct = (rate: number) => Math.round(rate * 10000) / 100;

/** İptal onayı: metin duruma göre değişir (§8.6). Ödenmiş transferde iade politikası ve tutarlar gösterilir. */
export function CancelTransferDialog({ transfer, onClose }: Props) {
  const { t } = useTranslation('transfers');
  const { hasRole } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [cancel, { loading }] = useMutation(CancelTransferDocument, {
    refetchQueries: ['Transfers', 'Transfer', 'TransferTransactions'],
  });

  const paid = transfer?.status === 'ACCEPTED';
  const isCustomer = hasRole('CUSTOMER');
  // Politika sadece bölge bilgisi yüklenmiş (detay sayfası) ve ödenmiş transferlerde hesaplanır
  const withPolicy = paid && !!transfer && 'state' in transfer && transfer.price != null;

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
          {withPolicy ? (
            <RefundPolicy transfer={transfer} customer={isCustomer} />
          ) : (
            paid &&
            isCustomer && (
              <Typography variant="body2" color="text.secondary">
                {t('cancel.customerFee')}
              </Typography>
            )
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

function RefundPolicy({ transfer, customer }: { transfer: NonNullable<Props['transfer']>; customer: boolean }) {
  const { t } = useTranslation('transfers');
  const tiers = penaltyTiers(transfer.state);
  const current = applicableTier(tiers, transfer.pickupTime);
  // Kesinti sadece müşteri iptalinde uygulanır; personel iptalinde tamamı iade edilir
  const rate = customer ? (current?.rate ?? 0) : 0;
  const { total, deducted, refund } = refundSplit(transfer.price, rate);
  const money = (v: number) => formatMoney(v, transfer.currency);

  // Politika satırları: en uzun eşikten önce ücretsiz, sonra eşikler büyükten küçüğe
  const longest = tiers.at(-1);
  const rows: { key: string; text: string; tier: PenaltyTier | null }[] = tiers.length
    ? [
        { key: 'free', text: t('cancel.policy.free', { hours: longest!.hours }), tier: null },
        ...[...tiers].reverse().map((x) => ({
          key: String(x.hours),
          text: t('cancel.policy.tier', { hours: x.hours, percent: pct(x.rate) }),
          tier: x,
        })),
      ]
    : [];
  const isActive = (tier: PenaltyTier | null) => customer && tier === current;

  return (
    <Stack spacing={2} sx={{ pt: 1 }}>
      <Box>
        <Typography variant="overline" color="text.secondary">
          {t('cancel.policy.title')}
        </Typography>
        {rows.length ? (
          <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.5 }}>
            {rows.map((r) => (
              <Typography
                key={r.key}
                component="li"
                variant="body2"
                sx={isActive(r.tier) ? { fontWeight: 700, color: 'text.primary' } : { color: 'text.secondary' }}
              >
                {r.text}
                {isActive(r.tier) && ` — ${t('cancel.policy.current')}`}
              </Typography>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('cancel.policy.none')}
          </Typography>
        )}
        {!customer && tiers.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t('cancel.policy.staff')}
          </Typography>
        )}
      </Box>

      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>
        <Stack spacing={1}>
          <AmountRow label={t('cancel.amounts.paid')} value={money(total)} />
          <AmountRow
            label={rate > 0 ? t('cancel.amounts.deductedRate', { percent: pct(rate) }) : t('cancel.amounts.deducted')}
            value={deducted > 0 ? `−${money(deducted)}` : money(0)}
            color={deducted > 0 ? 'error.main' : undefined}
          />
          <Divider />
          <AmountRow label={t('cancel.amounts.refund')} value={money(refund)} strong />
        </Stack>
      </Box>
    </Stack>
  );
}

function AmountRow({ label, value, strong, color }: { label: string; value: string; strong?: boolean; color?: string }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
      <Typography variant="body2" sx={{ fontWeight: strong ? 700 : 400 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: strong ? 700 : 500, color, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
    </Stack>
  );
}
