import { useEffect, useId, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { PhotoCameraRounded } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { UserAvatar } from '@/components/UserAvatar';
import type { CurrentUserFragment } from '@/graphql/generated/graphql';

type Props = {
  user: CurrentUserFragment;
  value: File | null;
  onChange: (file: File | null) => void;
  size?: number;
};

/**
 * Tıklanabilir profil görseli. Üzerine gelince "Fotoğrafı değiştir" katmanı çıkar,
 * hover olmayan (dokunmatik) cihazlarda köşede kamera rozeti hep görünür.
 * Seçilen dosya kaydedilene kadar avatarda önizlenir.
 */
export function AvatarPicker({ user, value, onChange, size = 96 }: Props) {
  const { t } = useTranslation('settings');
  const id = useId();
  const preview = useMemo(() => (value ? URL.createObjectURL(value) : null), [value]);
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  return (
    <Box
      component="label"
      htmlFor={id}
      aria-label={t('profile.changePhoto')}
      sx={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'block',
        '&:hover .avatar-overlay, &:focus-within .avatar-overlay': { opacity: 1 },
        '&:focus-within': { outline: 2, outlineColor: 'primary.main', outlineOffset: 3 },
      }}
    >
      <UserAvatar user={preview ? { ...user, profileImage: preview } : user} size={size} />
      <Box
        className="avatar-overlay"
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.25,
          bgcolor: 'inverse.main',
          color: 'inverse.contrastText',
          opacity: 0,
          transition: (theme) => theme.transitions.create('opacity'),
          // Avatar görünür kalsın diye yarı saydam
          '@supports (background-color: color-mix(in srgb, red, blue))': {
            bgcolor: 'color-mix(in srgb, var(--mui-palette-inverse-main) 80%, transparent)',
          },
        }}
      >
        <PhotoCameraRounded sx={{ color: 'inverse.accent' }} />
        <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1.2, textAlign: 'center', px: 1 }}>
          {t('profile.changePhoto')}
        </Typography>
      </Box>
      {/* Dokunmatik cihazlarda hover yok: köşede rozet */}
      <Box
        aria-hidden
        sx={{
          display: 'none',
          '@media (hover: none)': { display: 'grid' },
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 32,
          height: 32,
          borderRadius: '50%',
          placeItems: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          border: 2,
          borderColor: 'background.paper',
        }}
      >
        <PhotoCameraRounded sx={{ fontSize: 18 }} />
      </Box>
      <input
        id={id}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          e.target.value = '';
          if (file) onChange(file);
        }}
      />
    </Box>
  );
}
