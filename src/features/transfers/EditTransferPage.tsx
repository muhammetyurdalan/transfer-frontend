import { useEffect, useMemo } from 'react';
import { Button } from '@mui/material';
import { ArrowBackRounded } from '@mui/icons-material';
import { useMutation, useQuery } from '@apollo/client/react';
import { Navigate, Link as RouterLink, useNavigate, useParams } from 'react-router';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { BookingTransferDocument, UpdateTransferDocument } from '@/graphql/generated/graphql';
import { PageHeader } from '@/components/PageHeader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { PageSkeleton } from '@/components/feedback/LoadingSkeleton';
import { getErrorCode } from '@/lib/errors';
import { LegsReadOnly } from '@/features/booking/LegsSection';
import { TransferForm } from '@/features/booking/TransferForm';
import { fromTransfer, routeFromTransfer, toUpdateInput } from '@/features/booking/values';
import type { VehicleRouteState } from '@/features/booking/navigation';
import NotFoundPage from '@/features/errors/NotFoundPage';

// Sadece değişiklik tespiti için; gönderimde formdaki gerçek rota kullanılır.
const NO_ROUTE = { distance: '0', duration: 0 };

/** `/transfers/:id/edit` (§8.5). Sadece PENDING; yalnızca değişen alanlar gönderilir. */
export default function EditTransferPage() {
  const { id = '' } = useParams();
  const { t } = useTranslation('booking');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { data, loading, error, refetch } = useQuery(BookingTransferDocument, {
    variables: { id },
    fetchPolicy: 'network-only',
  });
  const [updateTransfer, { loading: saving }] = useMutation(UpdateTransferDocument, {
    context: { skipErrorToast: true },
  });
  const transfer = data?.transfer;
  const defaults = useMemo(() => (transfer ? fromTransfer(transfer) : null), [transfer]);
  const initialRoute = useMemo(() => (transfer ? routeFromTransfer(transfer) : null), [transfer]);
  const notEditable = !!transfer && transfer.status !== 'PENDING';

  useEffect(() => {
    if (notEditable)
      enqueueSnackbar(t('edit.notEditable'), { variant: 'info', preventDuplicate: true });
  }, [notEditable, enqueueSnackbar, t]);

  if (loading && !transfer) return <PageSkeleton />;
  if (error && !transfer) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!transfer || !defaults) return <NotFoundPage />;
  if (notEditable) return <Navigate to={`/transfers/${id}`} replace />;

  return (
    <>
      <PageHeader
        title={t('edit.title', { id })}
        back={
          <Button
            component={RouterLink}
            to={`/transfers/${id}`}
            startIcon={<ArrowBackRounded />}
            color="inherit"
            sx={{ mb: 1, ml: -1 }}
          >
            {t('common:actions.back')}
          </Button>
        }
      />
      <TransferForm
        // Yeni veri geldiğinde form sıfırdan kurulur.
        key={transfer.id}
        mode="edit"
        defaultValues={defaults}
        initialRoute={initialRoute}
        legsSlot={<LegsReadOnly legs={transfer.legs ?? []} />}
        submitLabel={t('edit.submit')}
        submitting={saving}
        canSubmit={(values) =>
          toUpdateInput(id, values, defaults, initialRoute ?? NO_ROUTE).changed
        }
        onSubmit={async (values, route) => {
          const {
            data: input,
            changed,
            resetsVehicle,
          } = toUpdateInput(id, values, defaults, route);
          if (!changed) {
            enqueueSnackbar(t('edit.noChanges'), { variant: 'info' });
            return null;
          }
          try {
            const res = await updateTransfer({ variables: { data: input } });
            enqueueSnackbar(t('edit.saved'), { variant: 'success' });
            if (resetsVehicle) {
              const state: VehicleRouteState = {
                vehicleOptions: res.data?.updateTransfer.vehicleOptions,
              };
              void navigate(`/transfers/${id}/vehicle`, { state });
            } else {
              void navigate(`/transfers/${id}`);
            }
            return null;
          } catch (e) {
            return getErrorCode(e) ?? 'unknown';
          }
        }}
      />
    </>
  );
}
