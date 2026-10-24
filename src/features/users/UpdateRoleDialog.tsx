import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, TextField } from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { UpdateAdminUserDocument, type Role, type UserItemFragment } from '@/graphql/generated/graphql';
import { useIsMobile } from '@/hooks/useIsMobile';

const ROLES: Role[] = ['CUSTOMER', 'DRIVER', 'OPERATOR', 'STAFF', 'ADMIN'];

/** Rol değiştir (sadece ADMIN). OPERATOR rolü sadece buradan verilir. */
export function UpdateRoleDialog({ user, onClose }: { user: UserItemFragment | null; onClose: () => void }) {
  return user ? <Inner user={user} onClose={onClose} /> : null;
}

function Inner({ user, onClose }: { user: UserItemFragment; onClose: () => void }) {
  const { t } = useTranslation();
  const mobile = useIsMobile();
  const { enqueueSnackbar } = useSnackbar();
  const [role, setRole] = useState<Role>(user.role ?? 'CUSTOMER');
  const [update, { loading }] = useMutation(UpdateAdminUserDocument);

  const submit = async () => {
    try {
      await update({ variables: { data: { id: user.id, role } } });
      enqueueSnackbar(t('users:updated'), { variant: 'success' });
      onClose();
    } catch {
      // hata snackbar'ı error link'ten
    }
  };

  return (
    <Dialog open onClose={loading ? undefined : onClose} fullWidth maxWidth="xs" fullScreen={mobile}>
      <DialogTitle>{t('users:roleDialog.title')}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>{t('users:roleDialog.body', { name: user.name })}</DialogContentText>
        <TextField select label={t('users:roleDialog.role')} value={role} onChange={(e) => setRole(e.target.value as Role)}>
          {ROLES.map((r) => (
            <MenuItem key={r} value={r}>
              {t(`roles.${r}`)}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={onClose} disabled={loading}>
          {t('actions.cancel')}
        </Button>
        <Button variant="contained" loading={loading} disabled={role === user.role} onClick={() => void submit()}>
          {t('actions.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
