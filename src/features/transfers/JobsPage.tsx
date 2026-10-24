import { useMemo } from 'react';
import { Box, Button, Stack, Tab, Tabs } from '@mui/material';
import { CheckCircleRounded, PlayArrowRounded, WorkRounded } from '@mui/icons-material';
import { useQuery } from '@apollo/client/react';
import { useNavigate, useSearchParams } from 'react-router';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  TransfersDocument,
  type TransferFilter,
  type TransferOrder,
  type TransferRowFragment,
} from '@/graphql/generated/graphql';
import { DataTable, useTableState, type Column, type TableOrdering } from '@/components/data-table';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { PageHeader } from '@/components/PageHeader';
import { useAppEvent } from '@/app/providers/SubscriptionProvider';
import { useAuth } from '@/app/providers/AuthProvider';
import { useIsMobile } from '@/hooks/useIsMobile';
import { can } from './transferPermissions';
import { transferColumns } from './transferColumns';
import { useTransferActions } from './useTransferActions';

type JobsTab = 'upcoming' | 'past';

const TABS: Record<JobsTab, { filters: TransferFilter; ordering: TableOrdering }> = {
  upcoming: {
    filters: { status: { inList: ['ASSIGNED', 'STARTED'] } },
    ordering: { field: 'pickupTime', direction: 'ASC' },
  },
  past: {
    filters: { status: { inList: ['COMPLETED', 'CANCELLED'] } },
    ordering: { field: 'pickupTime', direction: 'DESC' },
  },
};

/** Sürücünün işleri (§8.8). Backend DRIVER'a sadece kendine atananları döner. */
export default function JobsPage() {
  const { t } = useTranslation('transfers');
  const [params, setParams] = useSearchParams();
  const tab: JobsTab = params.get('tab') === 'past' ? 'past' : 'upcoming';

  return (
    <>
      <PageHeader title={t('jobs.title')} />
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v: JobsTab) =>
            setParams(v === 'upcoming' ? {} : { tab: v }, { replace: true })
          }
        >
          <Tab value="upcoming" label={t('jobs.upcoming')} />
          <Tab value="past" label={t('jobs.past')} />
        </Tabs>
      </Box>
      <JobsTable key={tab} tab={tab} />
    </>
  );
}

function JobsTable({ tab }: { tab: JobsTab }) {
  const { t } = useTranslation('transfers');
  const { user } = useAuth();
  const mobile = useIsMobile();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const state = useTableState(TABS[tab].ordering, tab);
  const { actions, dialogs, changeStatus, statusLoading } = useTransferActions({
    driverActions: true,
  });

  const { data, dataState, loading, error, refetch } = useQuery(TransfersDocument, {
    variables: {
      filters: TABS[tab].filters,
      ordering: state.orderingInput as TransferOrder[] | undefined,
      pagination: state.pagination,
    },
  });
  useAppEvent(['TRANSFER_ASSIGNED', 'TRANSFER_CANCELLED'], (e) => {
    void refetch();
    if (e.action === 'TRANSFER_ASSIGNED')
      enqueueSnackbar(t('jobs.assignedEvent'), { variant: 'info' });
    else enqueueSnackbar(t('jobs.cancelledEvent'), { variant: 'warning' });
  });

  const columns = useMemo<Column<TransferRowFragment>[]>(() => {
    const base = transferColumns(t).filter((c) => c.key !== 'driver');
    const quick = (r: TransferRowFragment) => {
      const start = can.start(user, r);
      const complete = can.complete(user, r);
      if (!start && !complete) return null;
      return (
        <Button
          fullWidth
          size="large"
          variant="contained"
          color={start ? 'primary' : 'secondary'}
          loading={statusLoading}
          startIcon={start ? <PlayArrowRounded /> : <CheckCircleRounded />}
          onClick={(e) => {
            e.stopPropagation();
            void changeStatus(r, start ? 'STARTED' : 'COMPLETED');
          }}
          sx={{ mt: 1.5, minHeight: 52 }}
        >
          {t(start ? 'actions.start' : 'actions.complete')}
        </Button>
      );
    };
    // Mobilde büyük Başlat/Tamamla butonu kartın başlık bölümünde yer alır.
    return base.map((c) =>
      c.mobilePrimary && mobile
        ? {
            ...c,
            render: (r: TransferRowFragment) => (
              <Stack>
                {c.render(r)}
                {quick(r)}
              </Stack>
            ),
          }
        : c,
    );
  }, [t, user, mobile, changeStatus, statusLoading]);

  const list = dataState === 'complete' ? data.transfers : undefined;
  if (error && !list) return <ErrorState error={error} onRetry={() => void refetch()} />;

  return (
    <>
      <DataTable
        columns={columns}
        rows={list?.transfers ?? []}
        count={list?.count ?? 0}
        loading={loading}
        page={state.page}
        pageSize={state.pageSize}
        onPageChange={state.setPage}
        onPageSizeChange={state.setPageSize}
        ordering={state.ordering}
        onOrderingChange={state.setOrdering}
        actions={actions}
        // Mobil kartta buton olduğu için kart tıklanabilir değil (iç içe buton olmasın), detay ⋮ menüsünde.
        onRowClick={mobile ? undefined : (r) => void navigate(`/transfers/${r.id}`)}
        emptyState={<EmptyState icon={<WorkRounded />} title={t('jobs.empty')} />}
      />
      {dialogs}
    </>
  );
}
