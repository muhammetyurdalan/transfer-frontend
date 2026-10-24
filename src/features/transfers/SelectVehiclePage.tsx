import { useEffect, useState } from 'react';
import { Box, Button, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { DirectionsCarRounded, EditRounded, LockRounded } from '@mui/icons-material';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import { Navigate, Link as RouterLink, useLocation, useParams } from 'react-router';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  BookingTransferDocument,
  PayTransferDocument,
  VehicleOptionsDocument,
} from '@/graphql/generated/graphql';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Money } from '@/components/Money';
import { PageHeader } from '@/components/PageHeader';
import { StickyActionBar } from '@/components/StickyActionBar';
import { getErrorCode } from '@/lib/errors';
import { pendingPaymentStore } from '@/lib/storage';
import type { VehicleRouteState } from '@/features/booking/navigation';
import { TripSummaryCard } from '@/features/booking/TripSummaryCard';
import { VehicleOptionCard } from '@/features/booking/VehicleOptionCard';
import NotFoundPage from '@/features/errors/NotFoundPage';

/** `/transfers/:id/vehicle` (§8.4): kategori seç → payTransfer → ödeme sayfası. */
export default function SelectVehiclePage() {
  const { id = '' } = useParams();
  const { t } = useTranslation('booking');
  const { enqueueSnackbar } = useSnackbar();
  const client = useApolloClient();
  const location = useLocation();
  const stateOptions = (location.state as VehicleRouteState | null)?.vehicleOptions;
  const [seeded] = useState(() => {
    // Route state'teki seçenekler cache'e yazılır; sorgu yine aktif kalır (dil değişince tazelenebilsin).
    if (stateOptions) {
      client.writeQuery({
        query: VehicleOptionsDocument,
        variables: { transferId: id },
        data: { vehicleOptions: stateOptions },
      });
    }
    return !!stateOptions;
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const transferQuery = useQuery(BookingTransferDocument, {
    variables: { id },
    fetchPolicy: 'cache-and-network',
  });
  const optionsQuery = useQuery(VehicleOptionsDocument, {
    variables: { transferId: id },
    fetchPolicy: seeded ? 'cache-first' : 'network-only',
  });
  const [payTransfer, { loading: paying }] = useMutation(PayTransferDocument);

  const transfer = transferQuery.data?.transfer;
  const options = optionsQuery.data?.vehicleOptions;
  const selected = options?.find((o) => o.vehicleCategory.id === selectedId) ?? null;

  const notPending = !!transfer && transfer.status !== 'PENDING';
  useEffect(() => {
    if (notPending)
      enqueueSnackbar(t('vehicle.notPending'), { variant: 'info', preventDuplicate: true });
  }, [notPending, enqueueSnackbar, t]);

  if (transferQuery.error && !transfer) {
    return <ErrorState error={transferQuery.error} onRetry={() => void transferQuery.refetch()} />;
  }
  if (!transferQuery.loading && transferQuery.data && !transfer) return <NotFoundPage />;
  if (notPending) return <Navigate to={`/transfers/${id}`} replace />;

  const pay = async () => {
    if (!selected) return;
    try {
      const { data } = await payTransfer({
        variables: { data: { id, vehicleCategoryId: selected.vehicleCategory.id } },
      });
      const link = data?.payTransfer.paymentLink;
      if (!link) return;
      pendingPaymentStore.set({ transferId: id, kind: 'payment' });
      window.location.assign(link);
    } catch (e) {
      // Mesaj global snackbar'da gösterilir; ERR025'te seçenekler tazelenir.
      if (getErrorCode(e) === 'ERR025') {
        setSelectedId(null);
        await optionsQuery.refetch();
        enqueueSnackbar(t('vehicle.refreshed'), { variant: 'info' });
      }
    }
  };

  return (
    <>
      <PageHeader title={t('vehicle.title')} subtitle={t('vehicle.subtitle')} />
      <Stack spacing={3}>
        <TripSummaryCard transfer={transfer} />

        {optionsQuery.error && !options ? (
          <ErrorState error={optionsQuery.error} onRetry={() => void optionsQuery.refetch()} />
        ) : !options ? (
          <Grid container spacing={2}>
            {[0, 1, 2].map((i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Skeleton variant="rounded" height={280} sx={{ borderRadius: 4 }} />
              </Grid>
            ))}
          </Grid>
        ) : options.length === 0 ? (
          <Box
            sx={{ border: 1, borderColor: 'divider', borderRadius: 4, bgcolor: 'background.paper' }}
          >
            <EmptyState
              icon={<DirectionsCarRounded />}
              title={t('vehicle.empty')}
              description={t('vehicle.emptyBody')}
              action={
                <Button
                  component={RouterLink}
                  to={`/transfers/${id}/edit`}
                  variant="contained"
                  startIcon={<EditRounded />}
                >
                  {t('vehicle.editTransfer')}
                </Button>
              }
            />
          </Box>
        ) : (
          <Grid container spacing={2} role="radiogroup" aria-label={t('vehicle.title')}>
            {options.map((o) => (
              <Grid key={o.vehicleCategory.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <VehicleOptionCard
                  option={o}
                  selected={o.vehicleCategory.id === selectedId}
                  onSelect={() => setSelectedId(o.vehicleCategory.id)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>

      {!!options?.length && (
        <StickyActionBar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            {selected ? (
              <>
                <Typography variant="caption" sx={{ opacity: 0.75 }} component="p">
                  {selected.vehicleCategory.name}
                </Typography>
                <Money
                  amount={selected.price}
                  currency={selected.currency}
                  variant="h5"
                  sx={{ fontWeight: 700, color: 'inverse.accent' }}
                />
              </>
            ) : (
              <Typography variant="body2" sx={{ opacity: 0.75 }}>
                {t('vehicle.selectFirst')}
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<LockRounded />}
            disabled={!selected}
            loading={paying}
            onClick={() => void pay()}
            sx={{
              minWidth: { xs: '100%', sm: 200 },
              '&.Mui-disabled': {
                bgcolor: 'inverse.light',
                color: 'inverse.contrastText',
                opacity: 0.6,
              },
            }}
          >
            {t('vehicle.pay')}
          </Button>
        </StickyActionBar>
      )}
    </>
  );
}
