import { forwardRef, useState } from 'react';
import { IconButton, InputAdornment, TextField, type TextFieldProps } from '@mui/material';
import { VisibilityOffRounded, VisibilityRounded } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export const PasswordField = forwardRef<HTMLInputElement, TextFieldProps>(function PasswordField(props, ref) {
  const { t } = useTranslation('auth');
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      {...props}
      inputRef={ref}
      type={visible ? 'text' : 'password'}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={visible ? t('hidePassword') : t('showPassword')}
                onClick={() => setVisible((v) => !v)}
                edge="end"
              >
                {visible ? <VisibilityOffRounded /> : <VisibilityRounded />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
});
