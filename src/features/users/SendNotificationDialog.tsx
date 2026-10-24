import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { SendNotificationDocument, type UserItemFragment } from '@/graphql/generated/graphql';
import { useIsMobile } from '@/hooks/useIsMobile';

const schema = z.object({
  title: z.string().trim().min(1, 'users:validation.required').max(100, 'users:validation.max'),
  body: z.string().trim().min(1, 'users:validation.required'),
});
type FormValues = z.infer<typeof schema>;

/** Tek kullanıcıya veya toplu seçime bildirim (§8.11). */
export function SendNotificationDialog({ users, onClose }: { users: UserItemFragment[] | null; onClose: () => void }) {
  return users && users.length > 0 ? <Inner users={users} onClose={onClose} /> : null;
}

function Inner({ users, onClose }: { users: UserItemFragment[]; onClose: () => void }) {
  const { t } = useTranslation();
  const mobile = useIsMobile();
  const { enqueueSnackbar } = useSnackbar();
  const [send, { loading }] = useMutation(SendNotificationDocument);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { title: '', body: '' } });

  const onSubmit = handleSubmit(async (v) => {
    try {
      await send({ variables: { data: { userIds: users.map((u) => u.id), title: v.title.trim(), body: v.body.trim() } } });
      enqueueSnackbar(t('users:notifyDialog.sent'), { variant: 'success' });
      onClose();
    } catch {
      // hata snackbar'ı error link'ten
    }
  });

  const msg = (e?: { message?: string }) => (e?.message ? t(e.message, { count: 100 }) : undefined);

  return (
    <Dialog open onClose={loading ? undefined : onClose} fullWidth maxWidth="sm" fullScreen={mobile}>
      <form onSubmit={onSubmit} noValidate style={{ display: 'contents' }}>
        <DialogTitle>{t('users:notifyDialog.title')}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Chip size="small" color="primary" label={t('users:notifyDialog.recipients', { count: users.length })} />
              {users.slice(0, 5).map((u) => (
                <Chip key={u.id} size="small" variant="outlined" label={u.name} />
              ))}
              {users.length > 5 && <Chip size="small" variant="outlined" label={`+${users.length - 5}`} />}
            </Stack>
            <TextField
              required
              label={t('users:notifyDialog.titleField')}
              {...register('title')}
              error={!!errors.title}
              helperText={msg(errors.title)}
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />
            <TextField
              required
              multiline
              minRows={3}
              label={t('users:notifyDialog.body')}
              {...register('body')}
              error={!!errors.body}
              helperText={msg(errors.body)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={onClose} disabled={loading}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit" variant="contained" loading={loading}>
            {t('users:actions.notify')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
