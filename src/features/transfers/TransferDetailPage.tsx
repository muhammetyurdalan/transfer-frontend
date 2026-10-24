import { useCallback, useState } from 'react';
import { Badge, Box, Button, Card, CardContent, Grid, Stack, Tab, Tabs } from '@mui/material';
import { ArrowBackRounded, SearchOffRounded } from '@mui/icons-material';
import { useMutation, useQuery } from '@apollo/client/react';
import { Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { TransferDocument, UpdateTransferStatusDocument } from '@/graphql/generated/graphql';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { PageSkeleton } from '@/components/feedback/LoadingSkeleton';
import { PageHeader } from '@/components/PageHeader';
import { StatusChip } from '@/components/StatusChip';
import { StickyActionBar } from '@/components/StickyActionBar';
import { useAppEvent } from '@/app/providers/SubscriptionProvider';
import { useAuth } from '@/app/providers/AuthProvider';
import { useIsMobile } from '@/hooks/useIsMobile';
import { getErrorCode } from '@/lib/errors';
import { MessagePanel } from '@/features/messages/MessagePanel';
import { AssignDriverDialog } from './AssignDriverDialog';
import { CancelTransferDialog } from './CancelTransferDialog';
import { PaymentPendingBanner } from './PaymentPendingBanner';
import { StatusTimeline } from './StatusTimeline';
import { TipDialog } from './TipDialog';
import { PaymentCard, RouteCard, TripCard, VehicleDriverCard } from './TransferDetailCards';
import { TransferDetailActions } from './TransferDetailActions';
import { can } from './transferPermissions';

/** Transfer detayı + mesajlar (§8.6). */
export default function TransferDetailPage() {
  const { id = '' } = useParams();
  const { t } = useTranslation('transfers');
  const { user, hasRole } = useAuth();
  const mobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const tab = location.hash === '#messages' ? 'messages' : 'details';
  const [unread, setUnread] = useState(0);
  const [assignOpen, setAssignOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const { data, dataState, loading, error, refetch } = useQuery(TransferDocument, {
    variables: { id },
    context: { skipErrorToast: true },
  });
  const [updateStatus, { loading: statusLoading }] = useMutation(UpdateTransferStatusDocument, {
    refetchQueries: ['Transfer', 'Transfers'],
  });
  const refresh = useCallback(() => void refetch(), [refetch]);

  // Mobilde mesaj sekmesi kapalıyken gelen mesajlar badge'de sayılır.
  useAppEvent(['MESSAGE'], (e) => {
    if (e.transferId === id && mobile && tab !== 'messages') setUnread((n) => n + 1);
  });

  const transfer = dataState === 'complete' ? data.transfer : undefined;

  if (loading && !transfer) return <PageSkeleton />;
  if (error && getErrorCode(error) !== 'ERR013' && !transfer)
    return <ErrorState error={error} onRetry={refresh} />;
  if (!transfer)
    return (
      <EmptyState
        icon={<SearchOffRounded />}
        title={t('detail.notFound')}
        action={
          <Button component={RouterLink} to="/transfers" variant="contained" color="secondary">
            {t('detail.back')}
          </Button>
        }
      />
    );

  const showMessages = can.readMessages(user, transfer);
  const canWrite = can.message(user, transfer);
  const actionProps = {
    transfer,
    statusLoading,
    onStatus: async (status: 'STARTED' | 'COMPLETED') => {
      const res = await updateStatus({ variables: { data: { id: transfer.id, status } } });
      if (!res.error) enqueueSnackbar(t('detail.statusUpdated'), { variant: 'success' });
    },
    onAssign: () => setAssignOpen(true),
    onTip: () => setTipOpen(true),
    onCancel: () => setCancelOpen(true),
  };
  const messages = showMessages && (
    <MessagePanel
      transferId={transfer.id}
      canWrite={canWrite}
      readOnlyStaff={hasRole('ADMIN', 'STAFF') && !can.participant(user, transfer)}
      height={mobile ? 'calc(100dvh - 240px)' : 560}
    />
  );
  const timeline = (
    <Card>
      <CardContent>
        <StatusTimeline status={transfer.status} />
      </CardContent>
    </Card>
  );
  const infoCards = (
    <Stack spacing={2}>
      <TripCard transfer={transfer} />
      <VehicleDriverCard transfer={transfer} />
      <PaymentCard transfer={transfer} />
    </Stack>
  );

  return (
    <>
      <PageHeader
        back={
          <Button
            component={RouterLink}
            to="/transfers"
            size="small"
            color="inherit"
            startIcon={<ArrowBackRounded />}
            sx={{ mb: 1, ml: -1 }}
          >
            {t('detail.back')}
          </Button>
        }
        title={
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <span>{t('detail.title', { id: transfer.id })}</span>
            <StatusChip status={transfer.status} size="medium" />
          </Stack>
        }
        actions={!mobile && <TransferDetailActions {...actionProps} />}
      />
      <PaymentPendingBanner transferId={transfer.id} status={transfer.status} refetch={refresh} />

      {mobile ? (
        <>
          {showMessages && (
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs
                value={tab}
                variant="fullWidth"
                onChange={(_, v: string) => {
                  if (v === 'messages') setUnread(0);
                  void navigate({ hash: v === 'messages' ? 'messages' : '' }, { replace: true });
                }}
              >
                <Tab value="details" label={t('detail.tabDetails')} />
                <Tab
                  value="messages"
                  label={
                    <Badge
                      color="primary"
                      badgeContent={unread}
                      sx={{ '& .MuiBadge-badge': { right: -12 } }}
                    >
                      {t('detail.tabMessages')}
                    </Badge>
                  }
                />
              </Tabs>
            </Box>
          )}
          {tab === 'messages' && showMessages ? (
            messages
          ) : (
            <Stack spacing={2}>
              {timeline}
              <RouteCard transfer={transfer} />
              {infoCards}
            </Stack>
          )}
          <MobileActions {...actionProps} />
        </>
      ) : (
        <Stack spacing={2}>
          {timeline}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>{infoCards}</Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={2}>
                <RouteCard transfer={transfer} />
                <Box id="messages">{messages}</Box>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      )}

      <AssignDriverDialog
        transferId={assignOpen ? transfer.id : null}
        onClose={() => setAssignOpen(false)}
      />
      <TipDialog transfer={tipOpen ? transfer : null} onClose={() => setTipOpen(false)} />
      <CancelTransferDialog
        transfer={cancelOpen ? transfer : null}
        onClose={() => setCancelOpen(false)}
      />
    </>
  );
}

function MobileActions(props: React.ComponentProps<typeof TransferDetailActions>) {
  const { user } = useAuth();
  // Gösterilecek buton yoksa bar da gösterilmez.
  if (!can.anyDetailAction(user, props.transfer)) return null;
  return (
    <StickyActionBar>
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{ flexWrap: 'wrap', width: '100%', '& > *': { flex: '1 1 auto' } }}
      >
        <TransferDetailActions {...props} onDark />
      </Stack>
    </StickyActionBar>
  );
}
