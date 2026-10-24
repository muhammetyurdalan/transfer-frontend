import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Alert, Box, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { ChatRounded, LockRounded } from '@mui/icons-material';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import {
  DeleteMessageDocument,
  MessagesDocument,
  SeeMessagesDocument,
  type MessageItemFragment,
} from '@/graphql/generated/graphql';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useAppEvent } from '@/app/providers/SubscriptionProvider';
import { useAuth } from '@/app/providers/AuthProvider';
import { formatDate } from '@/lib/format';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';

type Props = {
  transferId: string;
  /** ASSIGNED/STARTED ve kullanıcı katılımcı */
  canWrite: boolean;
  /** Salt okunur sebebi (ADMIN/STAFF sadece okur) */
  readOnlyStaff?: boolean;
  height?: number | string;
};

/** Transfer mesajları (§8.6). Panel açıkken (mount) mesajlar okundu işaretlenir. */
export function MessagePanel({ transferId, canWrite, readOnlyStaff, height = 560 }: Props) {
  const { t } = useTranslation('messages');
  const { user } = useAuth();
  const client = useApolloClient();
  const [closed, setClosed] = useState(false);
  const [replyTo, setReplyTo] = useState<MessageItemFragment | null>(null);
  const [editing, setEditing] = useState<MessageItemFragment | null>(null);
  const [toDelete, setToDelete] = useState<MessageItemFragment | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const writable = canWrite && !closed;

  const { data, dataState, loading, refetch } = useQuery(MessagesDocument, {
    variables: { transferId },
  });
  const [see] = useMutation(SeeMessagesDocument, { context: { skipErrorToast: true } });
  const [remove, { loading: deleting }] = useMutation(DeleteMessageDocument);
  const messages = dataState === 'complete' ? data.messages : [];

  useEffect(() => {
    void see({ variables: { transferId } });
  }, [see, transferId]);

  useAppEvent(['MESSAGE', 'UPDATE_MESSAGE', 'DELETE_MESSAGE'], (e) => {
    if (e.transferId && e.transferId !== transferId) return;
    if (e.action === 'MESSAGE') {
      void refetch();
      void see({ variables: { transferId } });
      return;
    }
    if (!e.messageId) return;
    const id = client.cache.identify({ __typename: 'Message', id: e.messageId });
    if (!id) return;
    if (e.action === 'UPDATE_MESSAGE') {
      client.cache.modify<MessageItemFragment>({
        id,
        fields: { message: () => e.message ?? null },
      });
    } else {
      client.cache.modify<MessageItemFragment>({ id, fields: { isDeleted: () => true } });
    }
  });

  // Yeni mesajda en alta kaydır.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const senderName = (senderId?: string) => {
    if (!senderId) return undefined;
    if (senderId === user?.id) return t('you');
    return messages.find((m) => m.senderId === senderId)?.sender?.name ?? undefined;
  };

  return (
    <Paper
      variant="outlined"
      sx={{ display: 'flex', flexDirection: 'column', height, overflow: 'hidden' }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: 'center',
          px: 2,
          py: 1.25,
          bgcolor: 'inverse.main',
          color: 'inverse.contrastText',
          borderBottom: 2,
          borderColor: 'inverse.accent',
        }}
      >
        <ChatRounded fontSize="small" sx={{ color: 'inverse.accent' }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {t('title')}
        </Typography>
      </Stack>
      <Box
        ref={scrollRef}
        sx={{ flexGrow: 1, overflowY: 'auto', px: 1.5, py: 2, bgcolor: 'background.default' }}
      >
        {loading && messages.length === 0 ? (
          <Stack spacing={1.5}>
            {[0, 1, 2].map((i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={48}
                width={i % 2 ? '60%' : '45%'}
                sx={{ alignSelf: i % 2 ? 'flex-end' : 'flex-start' }}
              />
            ))}
          </Stack>
        ) : messages.length === 0 ? (
          <EmptyState icon={<ChatRounded />} title={t('empty')} />
        ) : (
          <Stack spacing={1}>
            {messages.map((m, i) => {
              const day = formatDate(m.time);
              const showDay = i === 0 || day !== formatDate(messages[i - 1].time);
              return (
                <Box key={m.id}>
                  {showDay && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', textAlign: 'center', my: 1 }}
                    >
                      {day}
                    </Typography>
                  )}
                  <MessageBubble
                    message={m}
                    mine={m.senderId === user?.id}
                    parentSender={senderName(m.parent?.senderId)}
                    canWrite={writable}
                    onReply={(msg) => {
                      setEditing(null);
                      setReplyTo(msg);
                    }}
                    onEdit={(msg) => {
                      setReplyTo(null);
                      setEditing(msg);
                    }}
                    onDelete={setToDelete}
                  />
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
      {writable ? (
        <MessageComposer
          key={editing?.id ?? 'new'}
          transferId={transferId}
          replyTo={replyTo}
          replyName={senderName(replyTo?.senderId)}
          editing={editing}
          onCancelReply={() => setReplyTo(null)}
          onCancelEdit={() => setEditing(null)}
          onSent={() => void refetch()}
          onClosed={() => setClosed(true)}
        />
      ) : (
        <Alert severity="info" icon={<LockRounded fontSize="small" />} sx={{ borderRadius: 0 }}>
          {readOnlyStaff ? t('readOnlyStaff') : t('readOnly')}
        </Alert>
      )}
      <ConfirmDialog
        open={!!toDelete}
        destructive
        loading={deleting}
        title={t('deleteTitle')}
        description={t('deleteBody')}
        confirmLabel={t('delete')}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) await remove({ variables: { id: toDelete.id } });
          setToDelete(null);
        }}
      />
    </Paper>
  );
}
