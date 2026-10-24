import { useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Link,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import {
  DeleteRounded,
  EditRounded,
  InsertDriveFileRounded,
  LocationOnRounded,
  MoreVertRounded,
  ReplyRounded,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { MessageItemFragment } from '@/graphql/generated/graphql';
import { formatTime } from '@/lib/format';
import { mapsLink, parseLocation } from '@/lib/geo';
import { fileName, isImagePath, mediaUrl } from '@/lib/media';
import { canEditMessage } from './messageRules';

type Props = {
  message: MessageItemFragment;
  mine: boolean;
  /** Yanıtlanan mesajın gönderen adı */
  parentSender?: string;
  canWrite: boolean;
  onReply: (m: MessageItemFragment) => void;
  onEdit: (m: MessageItemFragment) => void;
  onDelete: (m: MessageItemFragment) => void;
};

type Content = Pick<MessageItemFragment, 'isDeleted' | 'message' | 'file' | 'location'>;

function Attachment({ m, mine }: { m: Content; mine: boolean }) {
  const { t } = useTranslation('messages');
  const loc = parseLocation(m.location);
  return (
    <Stack spacing={0.75} sx={{ alignItems: 'flex-start' }}>
      {m.file &&
        (isImagePath(m.file) ? (
          <Box
            component="a"
            href={mediaUrl(m.file)}
            target="_blank"
            rel="noopener"
            sx={{ display: 'block', borderRadius: 2, overflow: 'hidden', maxWidth: 220 }}
          >
            <Box
              component="img"
              src={mediaUrl(m.file)}
              alt={fileName(m.file)}
              sx={{ display: 'block', width: '100%' }}
            />
          </Box>
        ) : (
          <Chip
            component="a"
            href={mediaUrl(m.file)}
            target="_blank"
            rel="noopener"
            clickable
            icon={<InsertDriveFileRounded />}
            label={fileName(m.file)}
            sx={{
              maxWidth: 220,
              bgcolor: mine ? 'inverse.main' : undefined,
              color: mine ? 'inverse.contrastText' : undefined,
              '& .MuiChip-icon': { color: 'inherit' },
            }}
          />
        ))}
      {loc && (
        <Link
          href={mapsLink(loc)}
          target="_blank"
          rel="noopener"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            color: mine ? 'inherit' : undefined,
            fontWeight: 600,
          }}
        >
          <LocationOnRounded fontSize="small" />
          {t('location')}
        </Link>
      )}
    </Stack>
  );
}

/** Kendi mesajı sağda altın (primary), diğerleri solda kâğıt zeminli balon. */
export function MessageBubble({
  message: m,
  mine,
  parentSender,
  canWrite,
  onReply,
  onEdit,
  onDelete,
}: Props) {
  const { t } = useTranslation('messages');
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const editable = mine && canEditMessage(m);
  const hasMenu = !m.isDeleted && canWrite;

  return (
    <Stack
      direction={mine ? 'row-reverse' : 'row'}
      spacing={0.5}
      sx={{ alignItems: 'flex-end', maxWidth: '100%' }}
    >
      <Box
        sx={{
          maxWidth: { xs: '82%', sm: '70%' },
          px: 1.5,
          py: 1,
          borderRadius: 3,
          ...(mine
            ? { bgcolor: 'primary.main', color: 'primary.contrastText', borderBottomRightRadius: 4 }
            : {
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                borderBottomLeftRadius: 4,
              }),
        }}
      >
        {!mine && (
          <Typography
            variant="caption"
            sx={{ display: 'block', fontWeight: 700, color: 'primary.dark' }}
          >
            {m.sender?.name}
          </Typography>
        )}
        {m.parent && !m.isDeleted && (
          <Box
            sx={{
              borderLeft: 3,
              borderColor: mine ? 'inverse.main' : 'primary.main',
              pl: 1,
              mb: 0.75,
              opacity: 0.85,
            }}
          >
            {parentSender && (
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                {parentSender}
              </Typography>
            )}
            <Typography
              variant="caption"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {m.parent.isDeleted
                ? t('deleted')
                : m.parent.message ||
                  (m.parent.location ? t('location') : m.parent.file ? t('file') : '')}
            </Typography>
          </Box>
        )}
        {m.isDeleted ? (
          <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.7 }}>
            {t('deleted')}
          </Typography>
        ) : (
          <Stack spacing={0.75}>
            {m.message && (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                {m.message}
              </Typography>
            )}
            <Attachment m={m} mine={mine} />
          </Stack>
        )}
        <Typography
          variant="caption"
          sx={{ display: 'block', textAlign: 'right', opacity: 0.7, mt: 0.25 }}
        >
          {formatTime(m.time)}
        </Typography>
      </Box>
      {hasMenu && (
        <>
          <IconButton
            size="small"
            aria-label={t('common:actions.more')}
            onClick={(e) => setAnchor(e.currentTarget)}
            sx={{ width: 36, height: 36 }}
          >
            <MoreVertRounded fontSize="small" />
          </IconButton>
          <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
            <MenuItem
              onClick={() => {
                setAnchor(null);
                onReply(m);
              }}
            >
              <ListItemIcon>
                <ReplyRounded fontSize="small" />
              </ListItemIcon>
              {t('reply')}
            </MenuItem>
            {editable && (
              <MenuItem
                onClick={() => {
                  setAnchor(null);
                  onEdit(m);
                }}
              >
                <ListItemIcon>
                  <EditRounded fontSize="small" />
                </ListItemIcon>
                {t('edit')}
              </MenuItem>
            )}
            {mine && (
              <MenuItem
                sx={{ color: 'error.main' }}
                onClick={() => {
                  setAnchor(null);
                  onDelete(m);
                }}
              >
                <ListItemIcon sx={{ color: 'error.main' }}>
                  <DeleteRounded fontSize="small" />
                </ListItemIcon>
                {t('delete')}
              </MenuItem>
            )}
          </Menu>
        </>
      )}
    </Stack>
  );
}
