import { useEffect, useId, useMemo, useState } from 'react';
import { Avatar, Box, Button, FormHelperText, IconButton, Stack, Typography } from '@mui/material';
import { CloseRounded, UploadFileRounded } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

type Props = {
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  /** byte, istemci tarafı kontrol */
  maxSize?: number;
  label?: string;
  /** Yeni dosya seçilmemişken gösterilecek mevcut görsel URL'i */
  currentUrl?: string;
  error?: string;
};

export function FileInput({ value, onChange, accept = 'image/*', maxSize, label, currentUrl, error }: Props) {
  const { t } = useTranslation();
  const id = useId();
  const [sizeError, setSizeError] = useState<string | null>(null);
  const preview = useMemo(
    () => (value && value.type.startsWith('image/') ? URL.createObjectURL(value) : null),
    [value],
  );
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);
  const image = preview ?? currentUrl;

  return (
    <Box>
      <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
        {accept.startsWith('image') && (
          <Avatar src={image} variant="rounded" sx={{ width: 64, height: 64, bgcolor: 'highlight.main', color: 'primary.dark' }}>
            <UploadFileRounded />
          </Avatar>
        )}
        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={1}>
            <Button component="label" htmlFor={id} variant="outlined" size="small" startIcon={<UploadFileRounded />}>
              {label ?? t('file.choose')}
            </Button>
            {value && (
              <IconButton aria-label={t('file.remove')} onClick={() => onChange(null)}>
                <CloseRounded />
              </IconButton>
            )}
          </Stack>
          {value && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {value.name}
            </Typography>
          )}
        </Stack>
      </Stack>
      <input
        id={id}
        hidden
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          e.target.value = '';
          if (file && maxSize && file.size > maxSize) {
            setSizeError(t('file.tooLarge', { size: `${Math.round(maxSize / 1024 / 1024)}MB` }));
            return;
          }
          setSizeError(null);
          onChange(file);
        }}
      />
      {(sizeError || error) && <FormHelperText error>{sizeError ?? error}</FormHelperText>}
    </Box>
  );
}
