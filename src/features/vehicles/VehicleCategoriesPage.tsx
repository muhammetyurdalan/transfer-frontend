import { useState } from 'react';
import { Avatar, Button, Stack, Typography } from '@mui/material';
import {
  AccessibleRounded,
  AddRounded,
  CategoryRounded,
  DeleteRounded,
  EditRounded,
  ToggleOffRounded,
  ToggleOnRounded,
} from '@mui/icons-material';
import { useMutation, useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import {
  DeleteVehicleCategoryDocument,
  UpdateVehicleCategoryDocument,
  VehicleCategoriesDocument,
  type VehicleCategoryItemFragment,
  type VehicleCategoryOrder,
} from '@/graphql/generated/graphql';
import { DataTable, useTableState, type Column, type RowAction } from '@/components/data-table';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { getErrorCode, errorKey } from '@/lib/errors';
import { formatMoney } from '@/lib/format';
import { mediaUrl } from '@/lib/media';
import { ActiveChip } from './ActiveChip';
import { VehicleCategoryDialog } from './VehicleCategoryDialog';

/** Sabit referans: DataTable `rows` değişince seçimi sıfırlar, her render'da yeni dizi döngü yaratır. */
const EMPTY: never[] = [];
const DEFAULT_ORDERING = { field: 'order', direction: 'ASC' as const };

/** Araç kategorileri (§8.10), ADMIN/STAFF. Pasif kategoriler de listelenir. */
export default function VehicleCategoriesPage() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const table = useTableState(DEFAULT_ORDERING);
  const { data, loading, error, refetch } = useQuery(VehicleCategoriesDocument, {
    variables: {
      ordering: table.orderingInput as VehicleCategoryOrder[] | undefined,
      pagination: table.pagination,
    },
  });
  const [dialog, setDialog] = useState<{ category: VehicleCategoryItemFragment | null } | null>(null);
  const [toDelete, setToDelete] = useState<VehicleCategoryItemFragment | null>(null);
  const [update] = useMutation(UpdateVehicleCategoryDocument);
  const [remove, { loading: deleting }] = useMutation(DeleteVehicleCategoryDocument, {
    context: { skipErrorToast: true },
  });

  const columns: Column<VehicleCategoryItemFragment>[] = [
    {
      key: 'name',
      header: 'vehicles:categories.columns.name',
      mobilePrimary: true,
      render: (c) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Avatar
            variant="rounded"
            src={mediaUrl(c.image)}
            sx={{ width: 44, height: 44, bgcolor: 'highlight.main', color: 'primary.dark' }}
          >
            <CategoryRounded />
          </Avatar>
          <Stack sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {c.name}
            </Typography>
            {c.description && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {c.description}
              </Typography>
            )}
          </Stack>
        </Stack>
      ),
    },
    {
      key: 'capacity',
      header: 'vehicles:categories.columns.capacity',
      render: (c) => (
        <Stack sx={{ alignItems: { xs: 'flex-end', sm: 'flex-start' } }}>
          <Typography variant="body2">
            {t('vehicles:categories.capacity', { passengers: c.maxPassengers, luggage: c.maxLuggage })}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {!!c.childSeatCapacity && (
              <Typography variant="caption" color="text.secondary">
                {t('vehicles:categories.childSeats', { count: c.childSeatCapacity })}
              </Typography>
            )}
            {c.isWheelchairAccessible && (
              <AccessibleRounded fontSize="small" color="primary" aria-label={t('vehicles:categories.wheelchair')} />
            )}
          </Stack>
        </Stack>
      ),
    },
    {
      key: 'pricing',
      header: 'vehicles:categories.columns.pricing',
      hideBelow: 'md',
      render: (c) => (
        <Typography variant="body2" color="text.secondary">
          {t('vehicles:categories.pricing', {
            base: formatMoney(c.baseFare, c.currency),
            perKm: formatMoney(c.perKmPrice, c.currency),
            perMin: formatMoney(c.perMinutePrice, c.currency),
            min: formatMoney(c.minimumFare, c.currency),
          })}
        </Typography>
      ),
    },
    { key: 'order', header: 'vehicles:categories.columns.order', sortField: 'order', align: 'center', render: (c) => c.order },
    { key: 'status', header: 'vehicles:categories.columns.status', render: (c) => <ActiveChip active={c.isActive} /> },
  ];

  const actions: RowAction<VehicleCategoryItemFragment>[] = [
    { label: 'vehicles:actions.edit', icon: <EditRounded fontSize="small" />, onClick: (c) => setDialog({ category: c }) },
    {
      label: 'vehicles:actions.deactivate',
      icon: <ToggleOffRounded fontSize="small" />,
      visible: (c) => !!c.isActive,
      onClick: (c) => void update({ variables: { data: { id: c.id, isActive: false } } }),
    },
    {
      label: 'vehicles:actions.activate',
      icon: <ToggleOnRounded fontSize="small" />,
      visible: (c) => !c.isActive,
      onClick: (c) => void update({ variables: { data: { id: c.id, isActive: true } } }),
    },
    {
      label: 'vehicles:actions.delete',
      icon: <DeleteRounded fontSize="small" />,
      color: 'error',
      dividerBefore: true,
      onClick: setToDelete,
    },
  ];

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await remove({ variables: { id: toDelete.id } });
      enqueueSnackbar(t('vehicles:categories.deleted'), { variant: 'success' });
      void refetch();
    } catch (e) {
      const code = getErrorCode(e);
      enqueueSnackbar(t(code === 'ERR026' ? 'vehicles:categories.inUse' : errorKey(code)), { variant: 'error' });
    } finally {
      setToDelete(null);
    }
  };

  const addButton = (
    <Button variant="contained" startIcon={<AddRounded />} onClick={() => setDialog({ category: null })}>
      {t('vehicles:categories.add')}
    </Button>
  );

  return (
    <>
      <PageHeader title={t('vehicles:categories.title')} actions={addButton} />
      {error && !data ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <DataTable
          columns={columns}
          rows={(data?.vehicleCategories?.vehicleCategories ?? EMPTY) as VehicleCategoryItemFragment[]}
          count={data?.vehicleCategories?.count ?? 0}
          loading={loading}
          page={table.page}
          pageSize={table.pageSize}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
          ordering={table.ordering}
          onOrderingChange={table.setOrdering}
          actions={actions}
          onRowClick={(c) => setDialog({ category: c })}
          emptyState={<EmptyState icon={<CategoryRounded />} title={t('vehicles:categories.empty')} action={addButton} />}
        />
      )}
      <VehicleCategoryDialog
        open={!!dialog}
        category={dialog?.category ?? null}
        onClose={() => setDialog(null)}
        onSaved={() => void refetch()}
      />
      <ConfirmDialog
        open={!!toDelete}
        destructive
        title={t('vehicles:categories.deleteTitle')}
        description={t('vehicles:categories.deleteBody', { name: toDelete?.name })}
        confirmLabel={t('actions.delete')}
        loading={deleting}
        onConfirm={() => void confirmDelete()}
        onClose={() => setToDelete(null)}
      />
    </>
  );
}
