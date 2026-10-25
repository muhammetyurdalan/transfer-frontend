import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  Popover,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { NotificationsNoneRounded, NotificationsRounded } from '@mui/icons-material';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  NotificationsDocument,
  SeeNotificationsDocument,
  UnseenNotificationCountDocument,
  type NotificationItemFragment,
} from '@/graphql/generated/graphql';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useIsMobile } from '@/hooks/useIsMobile';
import { fromNow } from '@/lib/format';
import { notificationTransferId } from './notificationLink';

const UNSEEN_VARS = {
  filters: { isSeen: false },
  ordering: [{ createdAt: 'DESC' as const }],
  pagination: { offset: 0, limit: 10 },
};

/** Header zili (§6.4). Badge sayısı WebSocket `NOTIFICATION` olayında SubscriptionProvider tarafından tazelenir. */
export function NotificationMenu() {
  const { t } = useTranslation();
  const mobile = useIsMobile();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const open = !!anchor;

  const { data: countData } = useQuery(UnseenNotificationCountDocument);
  const { data, loading } = useQuery(NotificationsDocument, { variables: UNSEEN_VARS, skip: !open });
  const [see, { loading: seeing }] = useMutation(SeeNotificationsDocument, {
    refetchQueries: [UnseenNotificationCountDocument, NotificationsDocument],
  });

  const count = countData?.unseenNotificationCount ?? 0;
  const items = data?.notifications.notifications ?? [];
  const close = () => setAnchor(null);

  const openItem = (n: NotificationItemFragment) => {
    void see({ variables: { ids: [n.id] } });
    const transferId = notificationTransferId(n.data);
    if (transferId) void navigate(`/transfers/${transferId}`);
    close();
  };

  const content = (
    <Box sx={{ width: { xs: '100%', sm: 380 }, display: 'flex', flexDirection: 'column', maxHeight: { sm: 520 } }}>
      <Box sx={{ px: 2, py: 1.5, bgcolor: 'inverse.main', color: 'inverse.contrastText' }}>
        <Typography sx={{ fontWeight: 700 }} variant="subtitle1">
          {t('notifications:title')}
        </Typography>
      </Box>
      <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
        {loading && items.length === 0 ? (
          <Stack spacing={1} sx={{ p: 2 }}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} variant="rounded" height={56} />
            ))}
          </Stack>
        ) : items.length === 0 ? (
          <EmptyState icon={<NotificationsNoneRounded />} title={t('notifications:empty')} />
        ) : (
          <List disablePadding>
            {items.map((n) => (
              <ListItemButton
                key={n.id}
                onClick={() => openItem(n)}
                divider
                sx={{ alignItems: 'flex-start', gap: 1.5, py: 1.5 }}
              >
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mt: 1, flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700 }} variant="subtitle2">
                    {n.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                  >
                    {n.body}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {fromNow(n.createdAt)}
                  </Typography>
                </Box>
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>
      <Divider />
      <Stack direction="row" sx={{ justifyContent: 'space-between', p: 1, pb: 'calc(8px + env(safe-area-inset-bottom))' }}>
        <Button size="small" disabled={items.length === 0} loading={seeing} onClick={() => void see({ variables: {} })}>
          {t('notifications:markAllRead')}
        </Button>
        <Button
          size="small"
          onClick={() => {
            close();
            void navigate('/settings/notifications');
          }}
        >
          {t('actions.viewAll')}
        </Button>
      </Stack>
    </Box>
  );

  return (
    <>
      <Tooltip title={t('nav.notifications')}>
        <IconButton
          color="inherit"
          aria-label={t('nav.notifications')}
          onClick={(e) => setAnchor(e.currentTarget)}
        >
          <Badge
            badgeContent={count}
            max={99}
            color="primary"
            sx={{ '& .MuiBadge-badge': { fontWeight: 700 } }}
          >
            <NotificationsRounded fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>
      {mobile ? (
        <Drawer anchor="bottom" open={open} onClose={close} slotProps={{ paper: { sx: { borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '85dvh' } } }}>
          {content}
        </Drawer>
      ) : (
        <Popover
          open={open}
          anchorEl={anchor}
          onClose={close}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { mt: 1, overflow: 'hidden' } } }}
        >
          {content}
        </Popover>
      )}
    </>
  );
}
