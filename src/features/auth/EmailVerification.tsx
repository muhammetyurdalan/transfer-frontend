import { useState } from 'react';
import { Button, Link, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { GetCodeDocument, ValidateCodeDocument } from '@/graphql/generated/graphql';
import { toBackendLanguage } from '@/i18n';
import { errorKey, getErrorCode } from '@/lib/errors';
import { codeSchema, emailSchema, validationText } from './schemas';
import { useCountdown } from './useCountdown';

const ctx = { context: { skipErrorToast: true } };

type Props = {
  /** Kayıtta `false`, şifre sıfırlamada `true` (her zaman açıkça gönderilir) */
  isUser: boolean;
  step: 0 | 1;
  defaultEmail?: string;
  onStepChange: (step: 0 | 1) => void;
  /** Doğrulanmış secret ile 3. adıma geçilir */
  onVerified: (secret: string, email: string) => void;
};

/** Kayıt ve şifre sıfırlamanın ortak 1. (e-posta → getCode) ve 2. (kod → validateCode) adımları. */
export function EmailVerification({ isUser, step, defaultEmail = '', onStepChange, onVerified }: Props) {
  const { t, i18n } = useTranslation('auth');
  const [secret, setSecret] = useState('');
  const [email, setEmail] = useState(defaultEmail);
  const countdown = useCountdown();
  const [getCode, getCodeState] = useMutation(GetCodeDocument);
  const [validateCode, validateState] = useMutation(ValidateCodeDocument);

  const emailForm = useForm({
    resolver: zodResolver(z.object({ email: emailSchema })),
    defaultValues: { email: defaultEmail },
  });
  const codeForm = useForm({
    resolver: zodResolver(z.object({ code: codeSchema })),
    defaultValues: { code: '' },
  });

  const requestCode = async (target: string) => {
    try {
      const { data } = await getCode({
        variables: { data: { email: target, language: toBackendLanguage(i18n.language), isUser } },
        ...ctx,
      });
      if (!data) return;
      setSecret(data.getCode.secret);
      setEmail(target);
      countdown.start(data.getCode.expireSeconds);
      codeForm.reset({ code: '' });
      onStepChange(1);
    } catch (error) {
      emailForm.setError('email', { message: t(errorKey(getErrorCode(error))) });
    }
  };

  const verify = async ({ code }: { code: string }) => {
    try {
      const { data } = await validateCode({ variables: { data: { code, secret } }, ...ctx });
      if (data) onVerified(data.validateCode.secret, email);
    } catch (error) {
      const errCode = getErrorCode(error);
      if (errCode === 'ERR009') {
        emailForm.setError('email', { message: t('code.expired') });
        onStepChange(0);
        return;
      }
      codeForm.setError('code', { message: t(errorKey(errCode)) });
    }
  };

  if (step === 0) {
    const err = emailForm.formState.errors.email?.message;
    return (
      <Stack component="form" spacing={2} noValidate onSubmit={emailForm.handleSubmit((v) => requestCode(v.email))}>
        <TextField
          {...emailForm.register('email')}
          label={t('fields.email')}
          type="email"
          autoComplete="email"
          autoFocus
          error={!!err}
          helperText={err?.startsWith('validation.') ? validationText(t, err) : err}
        />
        <Button type="submit" variant="contained" size="large" loading={getCodeState.loading}>
          {t('code.send')}
        </Button>
      </Stack>
    );
  }

  const codeErr = codeForm.formState.errors.code?.message;
  return (
    <Stack component="form" spacing={2} noValidate onSubmit={codeForm.handleSubmit(verify)}>
      <Typography variant="body2" color="text.secondary">
        {t('code.sentTo', { email })}{' '}
        <Link component="button" type="button" onClick={() => onStepChange(0)}>
          {t('code.changeEmail')}
        </Link>
      </Typography>
      <TextField
        {...codeForm.register('code')}
        label={t('fields.code')}
        autoFocus
        autoComplete="one-time-code"
        error={!!codeErr}
        helperText={codeErr?.startsWith('validation.') ? validationText(t, codeErr) : codeErr}
        slotProps={{
          htmlInput: {
            inputMode: 'numeric',
            maxLength: 6,
            pattern: '[0-9]*',
            style: { letterSpacing: '0.5em', fontSize: '1.4rem', textAlign: 'center' },
          },
        }}
      />
      <Button type="submit" variant="contained" size="large" loading={validateState.loading}>
        {t('code.verify')}
      </Button>
      <Button
        variant="text"
        disabled={countdown.remaining > 0}
        loading={getCodeState.loading}
        onClick={() => void requestCode(email)}
      >
        {countdown.remaining > 0 ? t('code.resendIn', { seconds: countdown.remaining }) : t('code.resend')}
      </Button>
    </Stack>
  );
}
