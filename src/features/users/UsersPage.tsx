import { useEffect, useState } from 'react';
import { Button, Chip, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material';
import {
  BadgeRounded,
  CampaignRounded,
  GroupRounded,
  ListAltRounded,
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
  type Role,
  type UserFilter,
  type UserItemFragment,
  type UserOrder,
} from '@/graphql/generated/graphql';
import { DataTable, TableFilters, useTableState, type Column, type RowAction } from '@/components/data-table';
import { PageHeader } from '@/components/PageHeader';
import { UserAvatar } from '@/components/UserAvatar';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAuth } from '@/app/providers/AuthProvider';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatDate } from '@/lib/format';
import { ActiveChip } from '@/features/vehicles/ActiveChip';
import { nameOrEmailFilter } from './filters';
import { SendNotificationDialog } from './SendNotificationDialog';
import { UpdateRoleDialog } from './UpdateRoleDialog';

const ROLES: Role[] = ['CUSTOMER', 'DRIVER', 'OPERATOR', 'STAFF', 'ADMIN'];
/** Sabit referans: DataTable `rows` değişince seçimi sıfırlar, her render'da yeni dizi döngü yaratır. */
const EMPTY: never[] = [];
const DEFAULT_ORDERING = { field: 'createdAt', direction: 'DESC' as const };

/** Kullanıcılar (§8.11), ADMIN/STAFF. Rol ve aktiflik değişikliği sadece ADMIN. */
export default function UsersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');
  const table = useTableState(DEFAULT_ORDERING);

  const [searchInput, setSearchInput] = useState(table.get('q') ?? '');
  const search = useDebouncedValue(searchInput.trim(), 400);
  const urlSearch = table.get('q') ?? '';
  useEffect(() => {
    if (search !== urlSearch) table.set('q', search || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);
  const role = table.get('role') as Role | null;
  const active = table.get('isActive');

  const filters: UserFilter = {
    ...(role && { role: { exact: role } }),
    ...(active && { isActive: active === 'true' }),
    ...(search && { AND: nameOrEmailFilter(search) }),
  };
  const { data, loading, error, refetch } = useQuery(UsersDocument, {
    variables: { filters, ordering: table.orderingInput as UserOrder[] | undefined, pagination: table.pagination },
  });
  const [update] = useMutation(UpdateAdminUserDocument);
  const [selected, setSelected] = useState<UserItemFragment[]>([]);
  const [roleUser, setRoleUser] = useState<UserItemFragment | null>(null);
  const [notifyUsers, setNotifyUsers] = useState<UserItemFragment[] | null>(null);

  const setActive = async (u: UserItemFragment, isActive: boolean) => {
    try {
      await update({ variables: { data: { id: u.id, isActive } } });
      enqueueSnackbar(t('users:updated'), { variant: 'success' });
    } catch {
      // hata snackbar'ı error link'ten
    }
  };

  const columns: Column<UserItemFragment>[] = [
    {
      key: 'name',
      header: 'users:columns.name',
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
      header: 'users:columns.email',
      sortField: 'email',
      render: (u) => (
        <Typography variant="body2" noWrap title={u.email ?? ''}>
          {u.email}
        </Typography>
      ),
    },
    { key: 'phone', header: 'users:columns.phone', hideBelow: 'lg', render: (u) => u.phone || '—' },
    {
      key: 'role',
      header: 'users:columns.role',
      render: (u) =>
        u.role && (
          <Chip
            size="small"
            label={t(`roles.${u.role}`)}
            color={u.role === 'ADMIN' || u.role === 'STAFF' ? 'secondary' : u.role === 'CUSTOMER' ? 'default' : 'primary'}
            variant={u.role === 'CUSTOMER' ? 'outlined' : 'filled'}
          />
        ),
    },
    { key: 'status', header: 'users:columns.status', render: (u) => <ActiveChip active={u.isActive} /> },
    { key: 'createdAt', header: 'users:columns.createdAt', sortField: 'createdAt', hideBelow: 'md', render: (u) => formatDate(u.createdAt) },
  ];

  const actions: RowAction<UserItemFragment>[] = [
    { label: 'users:actions.changeRole', icon: <BadgeRounded fontSize="small" />, visible: () => isAdmin, onClick: setRoleUser },
    {
      label: 'users:actions.deactivate',
      icon: <ToggleOffRounded fontSize="small" />,
      visible: (u) => isAdmin && !!u.isActive,
      onClick: (u) => void setActive(u, false),
    },
    {
      label: 'users:actions.activate',
      icon: <ToggleOnRounded fontSize="small" />,
      visible: (u) => isAdmin && !u.isActive,
      onClick: (u) => void setActive(u, true),
    },
    { label: 'users:actions.notify', icon: <CampaignRounded fontSize="small" />, onClick: (u) => setNotifyUsers([u]) },
    {
      label: 'users:actions.transfers',
      icon: <ListAltRounded fontSize="small" />,
      dividerBefore: true,
      onClick: (u) => void navigate(`/transfers?customerId=${u.id}`),
    },
  ];

  return (
    <>
      <PageHeader
        title={t('users:title')}
        actions={
          selected.length > 0 && (
            <Button variant="contained" color="secondary" startIcon={<CampaignRounded />} onClick={() => setNotifyUsers(selected)}>
              {t('users:bulkNotify')} ({selected.length})
            </Button>
          )
        }
      />
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
          selectable
          onSelectionChange={setSelected}
          toolbar={
            <TableFilters>
              <TextField
                size="small"
                fullWidth={false}
                label={t('users:search')}
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
              />
              <TextField
                select
                size="small"
                fullWidth={false}
                label={t('users:columns.role')}
                value={role ?? ''}
                onChange={(e) => table.set('role', e.target.value || null)}
              >
                <MenuItem value="">{t('users:allRoles')}</MenuItem>
                {ROLES.map((r) => (
                  <MenuItem key={r} value={r}>
                    {t(`roles.${r}`)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                fullWidth={false}
                label={t('users:status')}
                value={active ?? ''}
                onChange={(e) => table.set('isActive', e.target.value || null)}
              >
                <MenuItem value="">{t('all')}</MenuItem>
                <MenuItem value="true">{t('active')}</MenuItem>
                <MenuItem value="false">{t('inactive')}</MenuItem>
              </TextField>
            </TableFilters>
          }
          emptyState={<EmptyState icon={<GroupRounded />} title={t('users:empty')} />}
        />
      )}
      <UpdateRoleDialog user={roleUser} onClose={() => setRoleUser(null)} />
      <SendNotificationDialog users={notifyUsers} onClose={() => setNotifyUsers(null)} />
    </>
  );
}
