import { useState } from 'react';
import { Box, Chip, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import {
  AttachFileRounded,
  CloseRounded,
  EditRounded,
  MyLocationRounded,
  ReplyRounded,
  SendRounded,
} from '@mui/icons-material';
import { useMutation } from '@apollo/client/react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  SendMessageDocument,
  UpdateMessageDocument,
  type MessageItemFragment,
} from '@/graphql/generated/graphql';
import { errorKey, getErrorCode } from '@/lib/errors';
import { formatLocation, getCurrentPosition } from '@/lib/geo';
import { MAX_MESSAGE_FILE } from './messageRules';

type Props = {
  transferId: string;
  replyTo: MessageItemFragment | null;
  replyName?: string;
  editing: MessageItemFragment | null;
  onCancelReply: () => void;
  onCancelEdit: () => void;
  onSent: () => void;
  /** ERR019: mesajlaşma kapandı */
  onClosed: () => void;
};

/** Alt sabit gönderim kutusu: metin, ataç (2MB), konum paylaş, gönder (§8.6). */
export function MessageComposer({
  transferId,
  replyTo,
  replyName,
  editing,
  onCancelReply,
  onCancelEdit,
  onSent,
  onClosed,
}: Props) {
  const { t } = useTranslation('messages');
  const { enqueueSnackbar } = useSnackbar();
  const [text, setText] = useState('');
  const [editText, setEditText] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const opts = { context: { skipErrorToast: true } };
  const [send, { loading: sending }] = useMutation(SendMessageDocument, opts);
  const [update, { loading: updating }] = useMutation(UpdateMessageDocument, opts);

  // Düzenleme moduna girilince metni doldur.
  const value = editing ? (editText ?? editing.message ?? '') : text;
  const setValue = (v: string) => (editing ? setEditText(v) : setText(v));

  const handleError = (error: unknown) => {
    const code = getErrorCode(error);
    if (code === 'ERR019') onClosed();
    if (code === 'ERR023') onCancelReply();
    if (code === 'ERR024') setFileError(t('fileTooLarge'));
    else enqueueSnackbar(t(errorKey(code)), { variant: 'error' });
  };

  const submit = async (location?: string) => {
    if (editing) {
      const message = value.trim();
      if (!message) return;
      const res = await update({ variables: { data: { id: editing.id, message } } });
      if (res.error) return handleError(res.error);
      setEditText(null);
      onCancelEdit();
      return;
    }
    const message = text.trim();
    if (!message && !file && !location) return;
    const res = await send({
      variables: {
        data: {
          transferId,
          message: message || undefined,
          file: file ?? undefined,
          location,
          parentId: replyTo?.id,
        },
      },
    });
    if (res.error) return handleError(res.error);
    setText('');
    setFile(null);
    onCancelReply();
    onSent();
  };

  const shareLocation = async () => {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      await submit(formatLocation(pos));
    } catch {
      enqueueSnackbar(t('locationDenied'), { variant: 'warning' });
    } finally {
      setLocating(false);
    }
  };

  const busy = sending || updating || locating;
  const canSend = editing ? !!value.trim() : !!text.trim() || !!file;

  return (
    <Box
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        p: 1,
        pb: 'calc(8px + env(safe-area-inset-bottom))',
      }}
    >
      {(replyTo || editing) && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            mb: 1,
            px: 1,
            py: 0.5,
            borderLeft: 3,
            borderColor: 'primary.main',
            bgcolor: 'highlight.main',
            borderRadius: 1,
          }}
        >
          {editing ? <EditRounded fontSize="small" /> : <ReplyRounded fontSize="small" />}
          <Typography variant="caption" noWrap sx={{ flexGrow: 1, minWidth: 0 }}>
            {editing
              ? t('editing')
              : `${t('replyingTo', { name: replyName ?? '' })}: ${replyTo?.message ?? ''}`}
          </Typography>
          <IconButton
            size="small"
            aria-label={editing ? t('cancelEdit') : t('cancelReply')}
            onClick={() => {
              if (editing) {
                setEditText(null);
                onCancelEdit();
              } else onCancelReply();
            }}
          >
            <CloseRounded fontSize="small" />
          </IconButton>
        </Stack>
      )}
      {(file || fileError) && (
        <Box sx={{ mb: 1, px: 1 }}>
          {file && (
            <Chip
              size="small"
              label={file.name}
              onDelete={() => setFile(null)}
              sx={{ maxWidth: '100%' }}
            />
          )}
          {fileError && (
            <Typography variant="caption" color="error" sx={{ display: 'block' }}>
              {fileError}
            </Typography>
          )}
        </Box>
      )}
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'flex-end' }}>
        {!editing && (
          <>
            <Tooltip title={t('attach')}>
              <IconButton component="label" aria-label={t('attach')} disabled={busy}>
                <AttachFileRounded />
                <input
                  hidden
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    e.target.value = '';
                    if (f && f.size > MAX_MESSAGE_FILE) {
                      setFileError(t('fileTooLarge'));
                      return;
                    }
                    setFileError(null);
                    setFile(f);
                  }}
                />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('shareLocation')}>
              <IconButton
                aria-label={t('shareLocation')}
                disabled={busy}
                onClick={() => void shareLocation()}
              >
                <MyLocationRounded />
              </IconButton>
            </Tooltip>
          </>
        )}
        <TextField
          multiline
          maxRows={4}
          size="small"
          placeholder={t('placeholder')}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (canSend && !busy) void submit();
            }
          }}
        />
        <IconButton
          aria-label={t('send')}
          disabled={!canSend || busy}
          onClick={() => void submit()}
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            width: 44,
            height: 44,
            flexShrink: 0,
            '&:hover': { bgcolor: 'primary.dark' },
            '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
          }}
        >
          <SendRounded />
        </IconButton>
      </Stack>
    </Box>
  );
}
