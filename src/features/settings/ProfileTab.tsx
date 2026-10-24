import { useState } from 'react';
import { Box, Button, Grid, Stack, TextField, Typography } from '@mui/material';
import { DeleteForeverRounded, LockResetRounded } from '@mui/icons-material';
import { useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link as RouterLink } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { DeleteUserDocument, UpdateUserDocument, type UpdateUser } from '@/graphql/generated/graphql';
import { useAuth, useCurrentUser } from '@/app/providers/AuthProvider';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { AvatarPicker } from './AvatarPicker';
import { SectionCard } from './SectionCard';

const schema = z.object({
  firstName: z.string().trim().min(1, 'settings:profile.validation.required').max(50, 'settings:profile.validation.max'),
  lastName: z.string().trim().min(1, 'settings:profile.validation.required').max(50, 'settings:profile.validation.max'),
  phone: z.string().trim().max(20, 'settings:profile.validation.max'),
});
type FormValues = z.infer<typeof schema>;
const MAX: Record<keyof FormValues, number> = { firstName: 50, lastName: 50, phone: 20 };

/** Profil sekmesi (§8.12): profil, güvenlik ve tehlikeli bölge kartları. Dil header'daki menüden değişir. */
export function ProfileTab() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const { logout } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [avatar, setAvatar] = useState<File | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const defaults: FormValues = {
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    phone: user.phone ?? '',
  };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults });

  const [updateUser, { loading: saving }] = useMutation(UpdateUserDocument);
  const [deleteUser, { loading: deleting }] = useMutation(DeleteUserDocument);

  const onSubmit = handleSubmit(async (v) => {
    const data: UpdateUser = {};
    if (dirtyFields.firstName) data.firstName = v.firstName.trim();
    if (dirtyFields.lastName) data.lastName = v.lastName.trim();
    if (dirtyFields.phone) data.phone = v.phone.trim();
    if (avatar) data.profileImage = avatar;
    try {
      const res = await updateUser({ variables: { data } });
      const updated = res.data?.updateUser;
      if (updated) {
        reset({
          firstName: updated.firstName ?? '',
          lastName: updated.lastName ?? '',
          phone: updated.phone ?? '',
        });
      }
      setAvatar(null);
      enqueueSnackbar(t('settings:profile.saved'), { variant: 'success' });
    } catch {
      // hata snackbar'ı error link'ten
    }
  });

  const handleDelete = async () => {
    try {
      await deleteUser();
      setConfirmDelete(false);
      await logout();
    } catch {
      // hata snackbar'ı error link'ten
    }
  };

  const msg = (name: keyof FormValues) => {
    const m = errors[name]?.message;
    return m ? t(m, { count: MAX[name] }) : undefined;
  };

  return (
    <Stack spacing={2.5}>
      <SectionCard title={t('settings:profile.cardTitle')}>
        <form onSubmit={onSubmit} noValidate>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ alignItems: { sm: 'center' } }}>
              <AvatarPicker user={user} value={avatar} onChange={setAvatar} />
              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                  {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user.email}
                </Typography>
              </Box>
            </Stack>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField required label={t('settings:profile.firstName')} {...register('firstName')} error={!!errors.firstName} helperText={msg('firstName')} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField required label={t('settings:profile.lastName')} {...register('lastName')} error={!!errors.lastName} helperText={msg('lastName')} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label={t('settings:profile.phone')}
                  {...register('phone')}
                  error={!!errors.phone}
                  helperText={msg('phone')}
                  slotProps={{ htmlInput: { inputMode: 'tel', maxLength: 20 } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label={t('settings:profile.email')} value={user.email ?? ''} disabled />
              </Grid>
            </Grid>
            <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
              <Button type="submit" variant="contained" loading={saving} disabled={!isDirty && !avatar}>
                {t('actions.save')}
              </Button>
            </Stack>
          </Stack>
        </form>
      </SectionCard>

      <SectionCard title={t('settings:profile.security')} description={t('settings:profile.securityBody')}>
        <Box>
          <Button
            component={RouterLink}
            to={`/forgot-password?email=${encodeURIComponent(user.email ?? '')}`}
            variant="outlined"
            color="secondary"
            startIcon={<LockResetRounded />}
          >
            {t('settings:profile.changePassword')}
          </Button>
        </Box>
      </SectionCard>

      <SectionCard tone="danger" title={t('settings:profile.danger')} description={t('settings:profile.dangerBody')}>
        <Box>
          <Button variant="outlined" color="error" startIcon={<DeleteForeverRounded />} onClick={() => setConfirmDelete(true)}>
            {t('settings:profile.deleteAccount')}
          </Button>
        </Box>
      </SectionCard>

      <ConfirmDialog
        open={confirmDelete}
        destructive
        title={t('settings:profile.deleteTitle')}
        description={t('settings:profile.deleteDescription')}
        confirmWord={t('settings:profile.deleteWord')}
        confirmLabel={t('settings:profile.deleteAccount')}
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onClose={() => setConfirmDelete(false)}
      />
    </Stack>
  );
}
