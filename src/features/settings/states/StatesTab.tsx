import { useEffect, useState } from 'react';
import { Button, Chip, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { AddRounded, DeleteRounded, EditRounded, MapRounded, SearchRounded } from '@mui/icons-material';
import { useMutation, useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import {
  DeleteStateDocument,
  StatesDocument,
  type StateFilter,
  type StateItemFragment,
  type StateOrder,
} from '@/graphql/generated/graphql';
import { DataTable, useTableState, type Column, type RowAction } from '@/components/data-table';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useAuth } from '@/app/providers/AuthProvider';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { errorKey, getErrorCode } from '@/lib/errors';
import { SectionCard } from '../SectionCard';
import { StateDialog } from './StateDialog';
import { tiersOf } from './stateValues';

/** Sabit referans: DataTable `rows` değişince seçimi sıfırlar, her render'da yeni dizi döngü yaratır. */
const EMPTY: never[] = [];
const DEFAULT_ORDERING = { field: 'name', direction: 'ASC' as const };

/**
 * Bölgeler (State) sekmesi: OPERATOR/ADMIN/STAFF görür.
 * Ekleme/düzenleme/silme backend'de sadece ADMIN/STAFF'a açık, OPERATOR salt okur.
 */
export function StatesTab() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { hasRole } = useAuth();
  const canManage = hasRole('ADMIN', 'STAFF');
  const table = useTableState(DEFAULT_ORDERING);

  const [searchInput, setSearchInput] = useState(table.get('q') ?? '');
  const search = useDebouncedValue(searchInput.trim(), 400);
  const urlSearch = table.get('q') ?? '';
  useEffect(() => {
    if (search !== urlSearch) table.set('q', search || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const filters: StateFilter | undefined = search
    ? { name: { iContains: search }, OR: { code: { iContains: search }, OR: { psp: { iContains: search } } } }
    : undefined;
  const { data, loading, error, refetch } = useQuery(StatesDocument, {
    variables: { filters, ordering: table.orderingInput as StateOrder[] | undefined, pagination: table.pagination },
  });
  const [dialog, setDialog] = useState<{ state: StateItemFragment | null } | null>(null);
  const [toDelete, setToDelete] = useState<StateItemFragment | null>(null);
  const [remove, { loading: deleting }] = useMutation(DeleteStateDocument, { context: { skipErrorToast: true } });

  const columns: Column<StateItemFragment>[] = [
    {
      key: 'name',
      header: 'settings:states.columns.name',
      sortField: 'name',
      mobilePrimary: true,
      render: (s) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {s.name}
        </Typography>
      ),
    },
    {
      key: 'code',
      header: 'settings:states.columns.code',
      sortField: 'code',
      render: (s) => <Chip size="small" variant="outlined" label={s.code} sx={{ fontWeight: 600, letterSpacing: '0.06em' }} />,
    },
    { key: 'psp', header: 'settings:states.columns.psp', render: (s) => s.psp || '—' },
    {
      key: 'buffer',
      header: 'settings:states.columns.driverBufferMinutes',
      hideBelow: 'md',
      render: (s) => t('settings:states.minutesValue', { count: s.driverBufferMinutes ?? 0 }),
    },
    {
      key: 'penalties',
      header: 'settings:states.columns.penalties',
      hideBelow: 'md',
      render: (s) => {
        const tiers = tiersOf(s);
        return tiers.length ? (
          <Typography variant="body2" color="text.secondary">
            {tiers.map((x) => t('settings:states.penalties.summary', { hours: x.hours, percent: x.percent })).join(' · ')}
          </Typography>
        ) : (
          '—'
        );
      },
    },
  ];

  const actions: RowAction<StateItemFragment>[] = canManage
    ? [
        { label: 'settings:states.actions.edit', icon: <EditRounded fontSize="small" />, onClick: (s) => setDialog({ state: s }) },
        {
          label: 'settings:states.actions.delete',
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
      await remove({ variables: { id: toDelete.id } });
      enqueueSnackbar(t('settings:states.deleted'), { variant: 'success' });
      void refetch();
    } catch (e) {
      enqueueSnackbar(t(errorKey(getErrorCode(e))), { variant: 'error' });
    } finally {
      setToDelete(null);
    }
  };

  const addButton = canManage && (
    <Button variant="contained" startIcon={<AddRounded />} onClick={() => setDialog({ state: null })}>
      {t('settings:states.add')}
    </Button>
  );

  return (
    <SectionCard
      title={t('settings:states.title')}
      description={t(canManage ? 'settings:states.description' : 'settings:states.readOnly')}
    >
      {error && !data ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <DataTable
          columns={columns}
          rows={(data?.states?.states ?? EMPTY) as StateItemFragment[]}
          count={data?.states?.count ?? 0}
          loading={loading}
          page={table.page}
          pageSize={table.pageSize}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
          ordering={table.ordering}
          onOrderingChange={table.setOrdering}
          actions={actions}
          onRowClick={canManage ? (s) => setDialog({ state: s }) : undefined}
          toolbar={
            <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                size="small"
                fullWidth={false}
                label={t('settings:states.search')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRounded fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ width: { xs: 'auto', md: 280 }, flex: { xs: 1, md: 'none' }, minWidth: 160 }}
              />
              <Stack sx={{ ml: 'auto' }}>{addButton}</Stack>
            </Stack>
          }
          emptyState={<EmptyState icon={<MapRounded />} title={t('settings:states.empty')} action={addButton} />}
        />
      )}
      <StateDialog
        open={!!dialog}
        state={dialog?.state ?? null}
        onClose={() => setDialog(null)}
        onSaved={() => void refetch()}
      />
      <ConfirmDialog
        open={!!toDelete}
        destructive
        title={t('settings:states.deleteTitle')}
        description={t('settings:states.deleteBody', { name: toDelete?.name })}
        confirmLabel={t('actions.delete')}
        loading={deleting}
        onConfirm={() => void confirmDelete()}
        onClose={() => setToDelete(null)}
      />
    </SectionCard>
  );
}
