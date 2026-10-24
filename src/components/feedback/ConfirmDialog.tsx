import { useState, type ReactNode } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/useIsMobile';

type Props = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  /** Verilirse kullanıcının bu kelimeyi yazması gerekir (ör. hesap silme) */
  confirmWord?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog(props: Props) {
  // Her açılışta yazılan onay metni sıfırlansın diye içerik ayrı component.
  return props.open ? <ConfirmDialogInner {...props} /> : null;
}

function ConfirmDialogInner({
  open,
  title,
  description,
  confirmLabel,
  destructive,
  loading,
  confirmWord,
  onConfirm,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const mobile = useIsMobile();
  const [typed, setTyped] = useState('');
  const blocked = !!confirmWord && typed.trim() !== confirmWord;

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs" fullScreen={mobile}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {description && <DialogContentText component="div">{description}</DialogContentText>}
        {confirmWord && (
          <TextField
            sx={{ mt: 2 }}
            autoFocus
            label={t('confirmTyping', { word: confirmWord })}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          {t('actions.cancel')}
        </Button>
        <Button
          variant="contained"
          color={destructive ? 'error' : 'primary'}
          loading={loading}
          disabled={blocked}
          onClick={onConfirm}
        >
          {confirmLabel ?? t('actions.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
