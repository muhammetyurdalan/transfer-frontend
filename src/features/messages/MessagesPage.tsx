import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Grid,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { ArrowBackRounded, ChatRounded, EastRounded, ForumRounded, OpenInNewRounded } from '@mui/icons-material';
import { useQuery } from '@apollo/client/react';
import { Link as RouterLink, Navigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  MessageThreadsDocument,
  type CurrentUserFragment,
  type MessageThreadFragment,
  type TransferFilter,
} from '@/graphql/generated/graphql';
import { useCurrentUser } from '@/app/providers/AuthProvider';
import { useAppEvent } from '@/app/providers/SubscriptionProvider';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { PageHeader } from '@/components/PageHeader';
import { StatusChip } from '@/components/StatusChip';
import { UserAvatar } from '@/components/UserAvatar';
import { useIsMobile } from '@/hooks/useIsMobile';
import { formatDateTime } from '@/lib/format';
import { can } from '@/features/transfers/transferPermissions';
import { MessagePanel } from './MessagePanel';

/** Sohbeti açık olan (mesaj yazılabilen) durumlar */
const ACTIVE_STATUSES = ['ASSIGNED', 'STARTED'] as const;

/** Kullanıcının katılımcı olduğu aktif transferler. OPERATOR backend'de tüm transferleri görür, kendine atananlarla sınırlanır. */
function threadFilter(user: CurrentUserFragment): TransferFilter {
  const filters: TransferFilter = { status: { inList: [...ACTIVE_STATUSES] } };
  if (user.role === 'OPERATOR') filters.operatorId = { exact: user.id };
  return filters;
}

/** Listede gösterilen karşı taraf: müşteriye sürücü, sürücü ve operatöre müşteri */
function counterpart(user: CurrentUserFragment, thread: MessageThreadFragment) {
  return user.role === 'CUSTOMER' ? thread.driver : thread.customer;
}

/**
 * Mesajlar sayfası (§8.14). Solda aktif transferler, sağda seçili transferin sohbeti.
 * `/messages/:transferId` seçili sohbeti açar. Mobilde liste ve sohbet ayrı ekranlardır.
 */
export default function MessagesPage() {
  const { transferId } = useParams();
  const { t } = useTranslation('messages');
  const user = useCurrentUser();
  const mobile = useIsMobile();
  // Oturum boyunca, açık olmayan sohbetlere gelen mesaj sayısı
  const [unread, setUnread] = useState<Record<string, number>>({});

  const { data, dataState, loading, error, refetch } = useQuery(MessageThreadsDocument, {
    variables: { filters: threadFilter(user) },
  });
  const threads = (dataState === 'complete' ? data.transfers.transfers : null) ?? [];
  const selected = threads.find((th) => th.id === transferId);

  useAppEvent(['MESSAGE'], (e) => {
    if (!e.transferId || e.senderId === user.id || e.transferId === transferId) return;
    const id = e.transferId;
    setUnread((u) => ({ ...u, [id]: (u[id] ?? 0) + 1 }));
    // Listede olmayan bir transferden mesaj geldiyse (yeni atanmış) listeyi tazele
    if (!threads.some((th) => th.id === id)) void refetch();
  });

  // Seçili sohbetin okunmamış sayacı açılınca sıfırlanır
  if (transferId && unread[transferId]) {
    setUnread((u) => {
      const next = { ...u };
      delete next[transferId];
      return next;
    });
  }

  if (error && !threads.length) return <ErrorState error={error} onRetry={() => void refetch()} />;

  // Masaüstünde seçim yoksa ilk sohbet açılır
  if (!mobile && !transferId && threads[0]) return <Navigate to={`/messages/${threads[0].id}`} replace />;

  const list = (
    <ThreadList
      threads={threads}
      loading={loading && !threads.length}
      selectedId={transferId}
      unread={unread}
      user={user}
    />
  );

  const chat = transferId ? (
    selected ? (
      <MessagePanel
        key={selected.id}
        transferId={selected.id}
        canWrite={can.message(user, selected)}
        height={mobile ? 'calc(100dvh - 150px)' : 'calc(100dvh - 240px)'}
        title={<ChatTitle thread={selected} user={user} back={mobile} />}
      />
    ) : (
      !loading && (
        <Paper variant="outlined">
          <EmptyState
            icon={<ChatRounded />}
            title={t('page.notActive')}
            description={t('page.notActiveBody')}
            action={
              <Button component={RouterLink} to={`/transfers/${transferId}`} variant="contained" color="secondary">
                {t('page.openTransfer')}
              </Button>
            }
          />
        </Paper>
      )
    )
  ) : null;

  if (mobile) {
    return transferId ? (
      chat
    ) : (
      <>
        <PageHeader title={t('page.title')} subtitle={t('page.subtitle')} />
        {list}
      </>
    );
  }

  return (
    <>
      <PageHeader title={t('page.title')} subtitle={t('page.subtitle')} />
      {threads.length === 0 && !loading ? (
        list
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>{list}</Grid>
          <Grid size={{ xs: 12, md: 8 }}>{chat}</Grid>
        </Grid>
      )}
    </>
  );
}

function ThreadList({
  threads,
  loading,
  selectedId,
  unread,
  user,
}: {
  threads: MessageThreadFragment[];
  loading: boolean;
  selectedId?: string;
  unread: Record<string, number>;
  user: CurrentUserFragment;
}) {
  const { t } = useTranslation('messages');

  if (loading) {
    return (
      <Paper variant="outlined" sx={{ p: 1 }}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={64} sx={{ m: 1 }} />
        ))}
      </Paper>
    );
  }
  if (threads.length === 0) {
    return (
      <Paper variant="outlined">
        <EmptyState icon={<ForumRounded />} title={t('page.empty')} description={t('page.emptyBody')} />
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <List disablePadding sx={{ maxHeight: { md: 'calc(100dvh - 240px)' }, overflowY: 'auto' }}>
        {threads.map((th, i) => {
          const other = counterpart(user, th);
          const count = unread[th.id] ?? 0;
          return (
            <ListItemButton
              key={th.id}
              component={RouterLink}
              to={`/messages/${th.id}`}
              selected={th.id === selectedId}
              divider={i < threads.length - 1}
              sx={{
                alignItems: 'flex-start',
                py: 1.5,
                '&.Mui-selected': {
                  bgcolor: 'highlight.main',
                  boxShadow: (theme) => `inset 3px 0 0 ${(theme.vars ?? theme).palette.primary.main}`,
                },
                '&.Mui-selected:hover': { bgcolor: 'highlight.main' },
              }}
            >
              <ListItemAvatar sx={{ mt: 0.5 }}>
                <Badge color="primary" badgeContent={count} max={99} overlap="circular">
                  <UserAvatar user={other} size={40} />
                </Badge>
              </ListItemAvatar>
              <ListItemText
                disableTypography
                primary={
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: count ? 800 : 700, flexGrow: 1, minWidth: 0 }}>
                      {other?.name ?? t('page.noCounterpart')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      #{th.id}
                    </Typography>
                  </Stack>
                }
                secondary={
                  <Stack spacing={0.5} sx={{ mt: 0.5, minWidth: 0 }}>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', minWidth: 0 }}>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ minWidth: 0 }}>
                        {th.pickupAddress}
                      </Typography>
                      <EastRounded sx={{ fontSize: 14, color: 'primary.main', flexShrink: 0 }} />
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ minWidth: 0 }}>
                        {th.dropoffAddress}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <StatusChip status={th.status} />
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {formatDateTime(th.pickupTime)}
                      </Typography>
                    </Stack>
                  </Stack>
                }
              />
            </ListItemButton>
          );
        })}
      </List>
    </Paper>
  );
}

/** Sohbet başlık bandı: karşı taraf, transfer no, durum ve transfer detayına link */
function ChatTitle({ thread, user, back }: { thread: MessageThreadFragment; user: CurrentUserFragment; back: boolean }) {
  const { t } = useTranslation('messages');
  const other = counterpart(user, thread);
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0, flexGrow: 1 }}>
      {back && (
        <IconButton component={RouterLink} to="/messages" color="inherit" edge="start" aria-label={t('page.back')}>
          <ArrowBackRounded fontSize="small" />
        </IconButton>
      )}
      <UserAvatar user={other} size={32} />
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {other?.name ?? t('page.noCounterpart')}
        </Typography>
        <Typography variant="caption" noWrap sx={{ opacity: 0.75, display: 'block' }}>
          {t('page.transferNo', { id: thread.id })} · {formatDateTime(thread.pickupTime)}
        </Typography>
      </Box>
      <StatusChip status={thread.status} />
      <IconButton
        component={RouterLink}
        to={`/transfers/${thread.id}`}
        color="inherit"
        size="small"
        aria-label={t('page.openTransfer')}
        title={t('page.openTransfer')}
      >
        <OpenInNewRounded fontSize="small" />
      </IconButton>
    </Stack>
  );
}
