import { useEffect, useState } from 'react';
import { InputAdornment, Stack, TextField, Typography } from '@mui/material';
import {
  CampaignRounded,
  DirectionsCarRounded,
  FilterListRounded,
  ListAltRounded,
  PersonSearchRounded,
  SearchRounded,
  ToggleOffRounded,
  ToggleOnRounded,
} from '@mui/icons-material';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import {
  UpdateAdminUserDocument,
  UsersDocument,
  type UserFilter,
  type UserItemFragment,
  type UserOrder,
} from '@/graphql/generated/graphql';
import { DataTable, FilterMenuButton, useTableState, type Column, type RowAction } from '@/components/data-table';
import { PageHeader } from '@/components/PageHeader';
import { UserAvatar } from '@/components/UserAvatar';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAuth } from '@/app/providers/AuthProvider';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatDate } from '@/lib/format';
import { formatPhone } from '@/lib/phone';
import { ActiveChip } from '@/features/vehicles/ActiveChip';
import { nameOrEmailFilter } from '@/features/users/filters';
import { SendNotificationDialog } from '@/features/users/SendNotificationDialog';

/** Sabit referans: DataTable `rows` değişince seçimi sıfırlar, her render'da yeni dizi döngü yaratır. */
const EMPTY: never[] = [];
const DEFAULT_ORDERING = { field: 'firstName', direction: 'ASC' as const };

/**
 * Sürücüler: OPERATOR/ADMIN/STAFF. `users` sorgusu `role: DRIVER` ile daraltılır.
 * Aktiflik değişikliği sadece ADMIN, bildirim gönderme ADMIN/STAFF (kullanıcılar sayfasıyla aynı yetkiler).
 */
export default function DriversPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');
  const canNotify = hasRole('ADMIN', 'STAFF');
  const table = useTableState(DEFAULT_ORDERING);

  const [searchInput, setSearchInput] = useState(table.get('q') ?? '');
  const search = useDebouncedValue(searchInput.trim(), 400);
  const urlSearch = table.get('q') ?? '';
  useEffect(() => {
    if (search !== urlSearch) table.set('q', search || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);
  const active = table.get('isActive');

  const filters: UserFilter = {
    role: { exact: 'DRIVER' },
    ...(active && { isActive: active === 'true' }),
    ...(search && { AND: nameOrEmailFilter(search) }),
  };
  const { data, loading, error, refetch } = useQuery(UsersDocument, {
    variables: { filters, ordering: table.orderingInput as UserOrder[] | undefined, pagination: table.pagination },
  });
  const [update] = useMutation(UpdateAdminUserDocument);
  const [notifyUsers, setNotifyUsers] = useState<UserItemFragment[] | null>(null);

  const setActive = async (u: UserItemFragment, isActive: boolean) => {
    try {
      await update({ variables: { data: { id: u.id, isActive } } });
      enqueueSnackbar(t('drivers:updated'), { variant: 'success' });
    } catch {
      // hata snackbar'ı error link'ten
    }
  };

  const columns: Column<UserItemFragment>[] = [
    {
      key: 'name',
      header: 'drivers:columns.name',
      sortField: 'firstName',
      mobilePrimary: true,
      render: (u) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
          <UserAvatar user={u} size={36} />
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {u.name}
          </Typography>
        </Stack>
      ),
    },
    {
      key: 'email',
      header: 'drivers:columns.email',
      sortField: 'email',
      render: (u) => (
        <Typography variant="body2" noWrap title={u.email ?? ''}>
          {u.email}
        </Typography>
      ),
    },
    { key: 'phone', header: 'drivers:columns.phone', render: (u) => formatPhone(u.phone) || '—' },
    { key: 'status', header: 'drivers:columns.status', render: (u) => <ActiveChip active={u.isActive} /> },
    {
      key: 'createdAt',
      header: 'drivers:columns.createdAt',
      sortField: 'createdAt',
      hideBelow: 'md',
      render: (u) => formatDate(u.createdAt),
    },
  ];

  const actions: RowAction<UserItemFragment>[] = [
    {
      label: 'drivers:actions.vehicles',
      icon: <DirectionsCarRounded fontSize="small" />,
      onClick: (u) => void navigate(`/vehicles?driverId=${u.id}`),
    },
    {
      label: 'drivers:actions.transfers',
      icon: <ListAltRounded fontSize="small" />,
      onClick: (u) => void navigate(`/transfers?driverId=${u.id}`),
    },
    {
      label: 'drivers:actions.notify',
      icon: <CampaignRounded fontSize="small" />,
      visible: () => canNotify,
      onClick: (u) => setNotifyUsers([u]),
    },
    {
      label: 'drivers:actions.deactivate',
      icon: <ToggleOffRounded fontSize="small" />,
      dividerBefore: true,
      visible: (u) => isAdmin && !!u.isActive,
      onClick: (u) => void setActive(u, false),
    },
    {
      label: 'drivers:actions.activate',
      icon: <ToggleOnRounded fontSize="small" />,
      dividerBefore: true,
      visible: (u) => isAdmin && !u.isActive,
      onClick: (u) => void setActive(u, true),
    },
  ];

  return (
    <>
      <PageHeader title={t('drivers:title')} />
      {error && !data ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <DataTable
          columns={columns}
          rows={(data?.users?.users ?? EMPTY) as UserItemFragment[]}
          count={data?.users?.count ?? 0}
          loading={loading}
          page={table.page}
          pageSize={table.pageSize}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
          ordering={table.ordering}
          onOrderingChange={table.setOrdering}
          actions={actions}
          toolbar={
            <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                size="small"
                fullWidth={false}
                label={t('drivers:search')}
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
              <Stack direction="row" spacing={0.5} sx={{ ml: 'auto' }}>
                <FilterMenuButton
                  label={t('drivers:status')}
                  icon={<FilterListRounded />}
                  value={active}
                  allLabel={t('all')}
                  options={[
                    { value: 'true', label: t('active') },
                    { value: 'false', label: t('inactive') },
                  ]}
                  onChange={(v) => table.set('isActive', v)}
                />
              </Stack>
            </Stack>
          }
          emptyState={<EmptyState icon={<PersonSearchRounded />} title={t('drivers:empty')} />}
        />
      )}
      <SendNotificationDialog users={notifyUsers} onClose={() => setNotifyUsers(null)} />
    </>
  );
}
