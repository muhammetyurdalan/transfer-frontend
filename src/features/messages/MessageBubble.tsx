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

function Attachment({ m }: { m: Content }) {
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
            sx={{
              display: 'block',
              borderRadius: 0.5,
              overflow: 'hidden',
              maxWidth: 220,
              border: 1,
              borderColor: 'divider',
            }}
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
            variant="outlined"
            sx={{ maxWidth: 220, borderRadius: 0.5 }}
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

/**
 * Mesaj kartı: köşeleri hafif yuvarlatılmış düz dikdörtgen, ince çerçeve ve yan tarafta altın/koyu vurgu çizgisi.
 * Kendi mesajı sağda (`highlight` zemin, sağda altın çizgi), diğerleri solda (kâğıt zemin, solda koyu çizgi).
 * Üst satırda gönderen ve saat, altında içerik.
 */
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
      sx={{ alignItems: 'flex-start', maxWidth: '100%' }}
    >
      <Box
        sx={{
          maxWidth: { xs: '86%', sm: '72%' },
          minWidth: 140,
          px: 1.5,
          pt: 0.75,
          pb: 1,
          borderRadius: 0.5,
          border: 1,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          ...(mine
            ? {
                bgcolor: 'highlight.main',
                color: 'highlight.contrastText',
                borderColor: 'highlight.border',
                borderRight: 3,
                borderRightColor: 'primary.main',
              }
            : {
                bgcolor: 'background.paper',
                borderColor: 'divider',
                borderLeft: 3,
                borderLeftColor: 'text.primary',
              }),
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'baseline',
            justifyContent: 'space-between',
            pb: 0.5,
            mb: 0.75,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="caption"
            noWrap
            sx={{ fontWeight: 700, letterSpacing: '0.04em', color: mine ? 'primary.dark' : 'text.primary' }}
          >
            {mine ? t('you') : m.sender?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
            {formatTime(m.time)}
          </Typography>
        </Stack>
        {m.parent && !m.isDeleted && (
          <Box
            sx={{
              borderLeft: 2,
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
              px: 1,
              py: 0.5,
              mb: 0.75,
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
            <Attachment m={m} />
          </Stack>
        )}
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
