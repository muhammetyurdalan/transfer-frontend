import { useEffect, useState } from 'react';
import { Button, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material';
import {
  AddRounded,
  DeleteRounded,
  DirectionsCarRounded,
  EditRounded,
  SearchRounded,
  ToggleOffRounded,
  ToggleOnRounded,
} from '@mui/icons-material';
import { useMutation, useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import {
  DeleteVehicleDocument,
  UpdateVehicleDocument,
  VehicleCategoriesDocument,
  VehiclesDocument,
  type VehicleFilter,
  type VehicleItemFragment,
  type VehicleOrder,
} from '@/graphql/generated/graphql';
import { DataTable, TableFilters, useTableState, type Column, type RowAction } from '@/components/data-table';
import { PageHeader } from '@/components/PageHeader';
import { UserAvatar } from '@/components/UserAvatar';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useAuth } from '@/app/providers/AuthProvider';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { getErrorCode, errorKey } from '@/lib/errors';
import { ActiveChip } from './ActiveChip';
import { VehicleDialog } from './VehicleDialog';

/** Sabit referans: DataTable `rows` değişince seçimi sıfırlar, her render'da yeni dizi döngü yaratır. */
const EMPTY: never[] = [];
const DEFAULT_ORDERING = { field: 'createdAt', direction: 'DESC' as const };

/** Araçlar (§8.9). DRIVER sadece kendi araçlarını görür ve sadece okur. */
export default function VehiclesPage() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { hasRole } = useAuth();
  const canManage = hasRole('ADMIN', 'STAFF', 'OPERATOR');
  const table = useTableState(DEFAULT_ORDERING);

  const [plateInput, setPlateInput] = useState(table.get('plate') ?? '');
  const plate = useDebouncedValue(plateInput.trim(), 400);
  const urlPlate = table.get('plate') ?? '';
  useEffect(() => {
    if (plate !== urlPlate) table.set('plate', plate || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plate]);
  const categoryId = table.get('categoryId');
  const active = table.get('isActive');

  const filters: VehicleFilter = {
    ...(plate && { plate: { iContains: plate } }),
    ...(categoryId && { categoryId: { exact: categoryId } }),
    ...(active && { isActive: active === 'true' }),
  };
  const { data, loading, error, refetch } = useQuery(VehiclesDocument, {
    variables: { filters, ordering: table.orderingInput as VehicleOrder[] | undefined, pagination: table.pagination },
  });
  const { data: categoryData } = useQuery(VehicleCategoriesDocument, {
    variables: { ordering: [{ order: 'ASC' }], pagination: { offset: 0, limit: 100 } },
  });

  const [dialog, setDialog] = useState<{ vehicle: VehicleItemFragment | null } | null>(null);
  const [toDelete, setToDelete] = useState<VehicleItemFragment | null>(null);
  const [updateVehicle] = useMutation(UpdateVehicleDocument);
  const [deleteVehicle, { loading: deleting }] = useMutation(DeleteVehicleDocument, {
    context: { skipErrorToast: true },
  });

  const columns: Column<VehicleItemFragment>[] = [
    {
      key: 'plate',
      header: 'vehicles:columns.plate',
      sortField: 'plate',
      mobilePrimary: true,
      render: (v) => (
        <Typography
          component="span"
          sx={{
            fontWeight: 700,
            letterSpacing: '0.06em',
            px: 1,
            py: 0.25,
            borderRadius: 1,
            border: 1,
            borderColor: 'highlight.border',
            bgcolor: 'highlight.main',
            whiteSpace: 'nowrap',
          }}
        >
          {v.plate}
        </Typography>
      ),
    },
    {
      key: 'vehicle',
      header: 'vehicles:columns.vehicle',
      render: (v) => [v.brand, v.model, v.year, v.color].filter(Boolean).join(' · '),
    },
    { key: 'category', header: 'vehicles:columns.category', render: (v) => v.category?.name ?? '—' },
    {
      key: 'driver',
      header: 'vehicles:columns.driver',
      hideBelow: 'md',
      render: (v) =>
        v.driver ? (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
            <UserAvatar user={v.driver} size={28} />
            <Typography variant="body2" noWrap>
              {v.driver.name}
            </Typography>
          </Stack>
        ) : (
          '—'
        ),
    },
    { key: 'status', header: 'vehicles:columns.status', render: (v) => <ActiveChip active={v.isActive} /> },
  ];

  const actions: RowAction<VehicleItemFragment>[] = canManage
    ? [
        { label: 'vehicles:actions.edit', icon: <EditRounded fontSize="small" />, onClick: (v) => setDialog({ vehicle: v }) },
        {
          label: 'vehicles:actions.deactivate',
          icon: <ToggleOffRounded fontSize="small" />,
          visible: (v) => !!v.isActive,
          onClick: (v) => void updateVehicle({ variables: { data: { id: v.id, isActive: false } } }),
        },
        {
          label: 'vehicles:actions.activate',
          icon: <ToggleOnRounded fontSize="small" />,
          visible: (v) => !v.isActive,
          onClick: (v) => void updateVehicle({ variables: { data: { id: v.id, isActive: true } } }),
        },
        {
          label: 'vehicles:actions.delete',
          icon: <DeleteRounded fontSize="small" />,
          color: 'error',
          dividerBefore: true,
          onClick: setToDelete,
        },
      ]
    : [];

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteVehicle({ variables: { id: toDelete.id } });
      enqueueSnackbar(t('vehicles:deleted'), { variant: 'success' });
      void refetch();
    } catch (e) {
      const code = getErrorCode(e);
      enqueueSnackbar(t(code === 'ERR029' ? 'vehicles:inUse' : errorKey(code)), { variant: 'error' });
    } finally {
      setToDelete(null);
    }
  };

  const addButton = canManage && (
    <Button variant="contained" startIcon={<AddRounded />} onClick={() => setDialog({ vehicle: null })}>
      {t('vehicles:add')}
    </Button>
  );

  return (
    <>
      <PageHeader title={t(hasRole('DRIVER') ? 'vehicles:myTitle' : 'vehicles:title')} actions={addButton} />
      {error && !data ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <DataTable
          columns={columns}
          rows={(data?.vehicles?.vehicles ?? EMPTY) as VehicleItemFragment[]}
          count={data?.vehicles?.count ?? 0}
          loading={loading}
          page={table.page}
          pageSize={table.pageSize}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
          ordering={table.ordering}
          onOrderingChange={table.setOrdering}
          actions={actions}
          toolbar={
            <TableFilters>
              <TextField
                size="small"
                fullWidth={false}
                label={t('vehicles:searchPlate')}
                value={plateInput}
                onChange={(e) => setPlateInput(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRounded fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                select
                size="small"
                fullWidth={false}
                label={t('vehicles:columns.category')}
                value={categoryId ?? ''}
                onChange={(e) => table.set('categoryId', e.target.value || null)}
              >
                <MenuItem value="">{t('vehicles:allCategories')}</MenuItem>
                {(categoryData?.vehicleCategories?.vehicleCategories ?? []).map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                fullWidth={false}
                label={t('vehicles:status')}
                value={active ?? ''}
                onChange={(e) => table.set('isActive', e.target.value || null)}
              >
                <MenuItem value="">{t('all')}</MenuItem>
                <MenuItem value="true">{t('active')}</MenuItem>
                <MenuItem value="false">{t('inactive')}</MenuItem>
              </TextField>
            </TableFilters>
          }
          emptyState={
            <EmptyState
              icon={<DirectionsCarRounded />}
              title={t('vehicles:empty')}
              description={canManage ? t('vehicles:emptyBody') : undefined}
              action={addButton}
            />
          }
        />
      )}
      <VehicleDialog
        open={!!dialog}
        vehicle={dialog?.vehicle ?? null}
        onClose={() => setDialog(null)}
        onSaved={() => void refetch()}
      />
      <ConfirmDialog
        open={!!toDelete}
        destructive
        title={t('vehicles:deleteTitle')}
        description={t('vehicles:deleteBody', { plate: toDelete?.plate })}
        confirmLabel={t('actions.delete')}
        loading={deleting}
        onConfirm={() => void confirmDelete()}
        onClose={() => setToDelete(null)}
      />
    </>
  );
}
