import { useState } from 'react';
import { Box, Button, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { DeleteRounded, DeleteSweepRounded, DoneAllRounded, DoneRounded, NotificationsNoneRounded } from '@mui/icons-material';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  DeleteNotificationsDocument,
  NotificationsDocument,
  SeeNotificationsDocument,
  UnseenNotificationCountDocument,
  type NotificationFilter,
  type NotificationItemFragment,
  type NotificationOrder,
} from '@/graphql/generated/graphql';
import { DataTable, useTableState, type Column, type RowAction } from '@/components/data-table';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { formatDateTime, fromNow } from '@/lib/format';
import { notificationTransferId } from '@/features/notifications/notificationLink';

const DEFAULT_ORDERING = { field: 'createdAt', direction: 'DESC' as const };
const EMPTY: never[] = [];
type SeenFilter = 'all' | 'unread' | 'read';

/** Bildirimler sekmesi (§8.12). Her işlemden sonra liste ve header badge'i tazelenir. */
export function NotificationsTab() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const table = useTableState(DEFAULT_ORDERING);
  const seen = (table.get('seen') as SeenFilter | null) ?? 'all';
  const [selected, setSelected] = useState<NotificationItemFragment[]>([]);
  const [confirmAll, setConfirmAll] = useState(false);

  const filters: NotificationFilter = seen === 'all' ? {} : { isSeen: seen === 'read' };
  const { data, loading, error, refetch } = useQuery(NotificationsDocument, {
    variables: { filters, ordering: table.orderingInput as NotificationOrder[] | undefined, pagination: table.pagination },
  });
  const refetchQueries = [NotificationsDocument, UnseenNotificationCountDocument];
  const [see, { loading: seeing }] = useMutation(SeeNotificationsDocument, { refetchQueries });
  const [remove, { loading: removing }] = useMutation(DeleteNotificationsDocument, { refetchQueries });

  const open = (n: NotificationItemFragment) => {
    if (!n.isSeen) void see({ variables: { ids: [n.id] } });
    const transferId = notificationTransferId(n.data);
    if (transferId) void navigate(`/transfers/${transferId}`);
  };

  const columns: Column<NotificationItemFragment>[] = [
    {
      key: 'dot',
      header: '',
      width: 24,
      hideBelow: 'sm',
      render: (n) =>
        !n.isSeen && <Box component="span" sx={{ display: 'block', width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main' }} />,
    },
    {
      key: 'title',
      header: 'settings:notifications.columns.title',
      mobilePrimary: true,
      render: (n) => (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
          {!n.isSeen && (
            <Box sx={{ display: { xs: 'block', sm: 'none' }, width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
          )}
          <Typography variant="body2" sx={{ fontWeight: n.isSeen ? 400 : 700 }}>
            {n.title}
          </Typography>
        </Stack>
      ),
    },
    {
      key: 'body',
      header: 'settings:notifications.columns.body',
      render: (n) => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textAlign: 'left' }}
        >
          {n.body}
        </Typography>
      ),
    },
    {
      key: 'time',
      header: 'settings:notifications.columns.time',
      sortField: 'createdAt',
      render: (n) => (
        <Tooltip title={formatDateTime(n.createdAt)}>
          <Typography variant="body2" component="span" sx={{ whiteSpace: 'nowrap' }}>
            {fromNow(n.createdAt)}
          </Typography>
        </Tooltip>
      ),
    },
  ];

  const actions: RowAction<NotificationItemFragment>[] = [
    {
      label: 'settings:notifications.actions.markRead',
      icon: <DoneRounded fontSize="small" />,
      visible: (n) => !n.isSeen,
      onClick: (n) => void see({ variables: { ids: [n.id] } }),
    },
    {
      label: 'settings:notifications.actions.delete',
      icon: <DeleteRounded fontSize="small" />,
      color: 'error',
      dividerBefore: true,
      onClick: (n) => void remove({ variables: { ids: [n.id] } }),
    },
  ];

  const rows = (data?.notifications?.notifications ?? EMPTY) as NotificationItemFragment[];

  return (
    <>
      {error && !data ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          count={data?.notifications?.count ?? 0}
          loading={loading}
          page={table.page}
          pageSize={table.pageSize}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
          ordering={table.ordering}
          onOrderingChange={table.setOrdering}
          actions={actions}
          onRowClick={open}
          selectable
          onSelectionChange={setSelected}
          toolbar={
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.5}
              sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
            >
              <ToggleButtonGroup
                exclusive
                size="small"
                value={seen}
                onChange={(_, v: SeenFilter | null) => v && table.set('seen', v === 'all' ? null : v)}
              >
                <ToggleButton value="all">{t('settings:notifications.filterAll')}</ToggleButton>
                <ToggleButton value="unread">{t('settings:notifications.filterUnread')}</ToggleButton>
                <ToggleButton value="read">{t('settings:notifications.filterRead')}</ToggleButton>
              </ToggleButtonGroup>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                <Button size="small" startIcon={<DoneAllRounded />} loading={seeing} onClick={() => void see({ variables: {} })}>
                  {t('settings:notifications.markAllRead')}
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteRounded />}
                  disabled={selected.length === 0}
                  loading={removing && selected.length > 0}
                  onClick={() => void remove({ variables: { ids: selected.map((n) => n.id) } })}
                >
                  {t('settings:notifications.deleteSelected')}
                  {selected.length > 0 && ` (${selected.length})`}
                </Button>
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  startIcon={<DeleteSweepRounded />}
                  disabled={rows.length === 0}
                  onClick={() => setConfirmAll(true)}
                >
                  {t('settings:notifications.deleteAll')}
                </Button>
              </Stack>
            </Stack>
          }
          emptyState={<EmptyState icon={<NotificationsNoneRounded />} title={t('settings:notifications.empty')} />}
        />
      )}
      {/* `ids` gönderilmeden çağrı kullanıcının TÜM bildirimlerini siler, onay zorunlu. */}
      <ConfirmDialog
        open={confirmAll}
        destructive
        title={t('settings:notifications.deleteAllTitle')}
        description={t('settings:notifications.deleteAllBody')}
        confirmLabel={t('settings:notifications.deleteAll')}
        loading={removing}
        onConfirm={() => void remove({ variables: {} }).finally(() => setConfirmAll(false))}
        onClose={() => setConfirmAll(false)}
      />
    </>
  );
}
