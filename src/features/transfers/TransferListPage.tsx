import { useMemo } from 'react';
import { Button } from '@mui/material';
import { AddRounded, ListAltRounded } from '@mui/icons-material';
import { useQuery } from '@apollo/client/react';
import { Link as RouterLink, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { TransfersDocument, type TransferOrder } from '@/graphql/generated/graphql';
import {
  ColumnPicker,
  DataTable,
  useColumnVisibility,
  useTableState,
  type TableOrdering,
} from '@/components/data-table';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/app/providers/AuthProvider';
import { useIsMobile } from '@/hooks/useIsMobile';
import { extraTransferColumns, transferColumns } from './transferColumns';
import { transferFilterFrom } from './transferFilter';
import { TransferFilters } from './TransferFilters';
import { useTransferActions } from './useTransferActions';

const DEFAULT_ORDERING: TableOrdering = { field: 'pickupTime', direction: 'DESC' };
/** Sütun seçicide listelenen ama varsayılan olarak gizli sütunlar */
const DEFAULT_HIDDEN = ['passenger', 'flightNumber', 'luggage', 'distance', 'customer', 'operator', 'createdAt'];
const COLUMNS_STORAGE_KEY = 'transfer.transferListColumns';

/** Transfer listesi (§8.2). Backend kapsamı role göre otomatik daraltır. */
export default function TransferListPage() {
  const { t } = useTranslation('transfers');
  const { hasRole } = useAuth();
  const mobile = useIsMobile();
  const navigate = useNavigate();
  const state = useTableState(DEFAULT_ORDERING);
  const isCustomer = hasRole('CUSTOMER');
  const allColumns = useMemo(
    () => [...transferColumns(t), ...extraTransferColumns(!isCustomer)],
    [t, isCustomer],
  );
  const { columns, visible, setVisible, reset } = useColumnVisibility(
    COLUMNS_STORAGE_KEY,
    allColumns,
    DEFAULT_HIDDEN,
  );
  const { actions, dialogs } = useTransferActions();

  const { data, dataState, loading, error, refetch } = useQuery(TransfersDocument, {
    variables: {
      filters: transferFilterFrom(state),
      ordering: state.orderingInput as TransferOrder[] | undefined,
      pagination: state.pagination,
    },
  });

  const list = dataState === 'complete' ? data.transfers : undefined;

  if (error && !list) return <ErrorState error={error} onRetry={() => void refetch()} />;

  return (
    <>
      <PageHeader
        title={isCustomer ? t('list.customerTitle') : t('list.title')}
        subtitle={isCustomer ? undefined : t('list.subtitle')}
        actions={
          isCustomer &&
          !mobile && (
            <Button
              component={RouterLink}
              to="/transfers/new"
              variant="contained"
              startIcon={<AddRounded />}
            >
              {t('common:nav.createTransfer')}
            </Button>
          )
        }
      />
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
        onRowClick={(r) => void navigate(`/transfers/${r.id}`)}
        toolbar={
          <TransferFilters
            state={state}
            showRegion={hasRole('ADMIN', 'STAFF', 'OPERATOR')}
            columnPicker={
              !mobile && (
                <ColumnPicker
                  columns={allColumns}
                  visible={visible}
                  onChange={setVisible}
                  onReset={reset}
                />
              )
            }
          />
        }
        emptyState={
          <EmptyState
            icon={<ListAltRounded />}
            title={isCustomer ? t('list.emptyCustomer') : t('list.empty')}
            action={
              isCustomer && (
                <Button
                  component={RouterLink}
                  to="/transfers/new"
                  variant="contained"
                  startIcon={<AddRounded />}
                >
                  {t('list.createFirst')}
                </Button>
              )
            }
          />
        }
      />
      {dialogs}
    </>
  );
}
