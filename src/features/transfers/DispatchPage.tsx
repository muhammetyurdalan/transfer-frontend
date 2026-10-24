import { useMemo } from 'react';
import { Badge, Box, Tab, Tabs } from '@mui/material';
import { HeadsetMicRounded } from '@mui/icons-material';
import { useQuery } from '@apollo/client/react';
import { useNavigate, useSearchParams } from 'react-router';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  TransfersDocument,
  type TransferFilter,
  type TransferOrder,
} from '@/graphql/generated/graphql';
import { DataTable, useTableState, type TableOrdering } from '@/components/data-table';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { PageHeader } from '@/components/PageHeader';
import { useAppEvent } from '@/app/providers/SubscriptionProvider';
import { timeToPickupColumn, transferColumns } from './transferColumns';
import { useTransferActions } from './useTransferActions';

type DispatchTab = 'waiting' | 'assigned';

const TABS: Record<DispatchTab, TransferFilter> = {
  waiting: { status: { exact: 'PAID' } },
  assigned: { status: { inList: ['ASSIGNED', 'STARTED'] } },
};
const ORDERING: TableOrdering = { field: 'pickupTime', direction: 'ASC' };
const DISPATCH_ACTIONS = [
  'transfers:actions.details',
  'transfers:actions.assignDriver',
  'transfers:actions.cancel',
];

/** Atama bekleyen / atanmış işler (§8.7). */
export default function DispatchPage() {
  const { t } = useTranslation('transfers');
  const [params, setParams] = useSearchParams();
  const tab: DispatchTab = params.get('tab') === 'assigned' ? 'assigned' : 'waiting';

  // Bekleyen sayısı sekme badge'i için ayrıca sorgulanır.
  const waitingCount = useQuery(TransfersDocument, {
    variables: { filters: TABS.waiting, pagination: { offset: 0, limit: 1 } },
  });
  const { enqueueSnackbar } = useSnackbar();
  useAppEvent(['TRANSFER_PAID'], (e) => {
    void waitingCount.refetch();
    enqueueSnackbar(t('dispatch.newPaid', { id: e.transferId }), { variant: 'info' });
  });
  const pending =
    waitingCount.dataState === 'complete' ? (waitingCount.data.transfers.count ?? 0) : 0;

  return (
    <>
      <PageHeader title={t('dispatch.title')} subtitle={t('dispatch.subtitle')} />
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v: DispatchTab) =>
            setParams(v === 'waiting' ? {} : { tab: v }, { replace: true })
          }
          variant="scrollable"
          allowScrollButtonsMobile
        >
          <Tab
            value="waiting"
            label={
              <Badge
                color="primary"
                badgeContent={pending}
                sx={{ '& .MuiBadge-badge': { right: -14 } }}
              >
                {t('dispatch.waiting')}
              </Badge>
            }
            sx={{ pr: pending ? 4 : undefined }}
          />
          <Tab value="assigned" label={t('dispatch.assigned')} />
        </Tabs>
      </Box>
      <DispatchTable key={tab} tab={tab} />
    </>
  );
}

function DispatchTable({ tab }: { tab: DispatchTab }) {
  const { t } = useTranslation('transfers');
  const navigate = useNavigate();
  const state = useTableState(ORDERING, tab);
  const { actions, dialogs } = useTransferActions();
  const columns = useMemo(() => {
    const base = transferColumns(t);
    const idx = base.findIndex((c) => c.key === 'pickupTime');
    base.splice(idx + 1, 0, timeToPickupColumn(t));
    return base;
  }, [t]);

  const { data, dataState, loading, error, refetch } = useQuery(TransfersDocument, {
    variables: {
      filters: TABS[tab],
      ordering: state.orderingInput as TransferOrder[] | undefined,
      pagination: state.pagination,
    },
  });
  useAppEvent(['TRANSFER_PAID'], () => {
    if (tab === 'waiting') void refetch();
  });
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
        actions={actions.filter((a) => DISPATCH_ACTIONS.includes(a.label))}
        onRowClick={(r) => void navigate(`/transfers/${r.id}`)}
        emptyState={<EmptyState icon={<HeadsetMicRounded />} title={t('dispatch.empty')} />}
      />
      {dialogs}
    </>
  );
}
