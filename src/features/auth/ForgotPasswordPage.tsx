import { useState } from 'react';
import { Button, Link, Stack, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { ResetPasswordDocument } from '@/graphql/generated/graphql';
import { useAuth } from '@/app/providers/AuthProvider';
import { errorKey, getErrorCode } from '@/lib/errors';
import { AuthHeading } from './AuthHeading';
import { EmailVerification } from './EmailVerification';
import { PasswordField } from './PasswordField';
import { passwordFields, passwordsMatch, validationText } from './schemas';

const schema = z.object(passwordFields).refine(...passwordsMatch);

/** 3 adım: getCode(isUser: true) → validateCode → resetPassword. Profil "Şifre değiştir" de burayı kullanır. */
export default function ForgotPasswordPage() {
  const { t } = useTranslation('auth');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [params] = useSearchParams();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [secret, setSecret] = useState('');
  const [email, setEmail] = useState(params.get('email') ?? '');
  const [resetPassword, { loading }] = useMutation(ResetPasswordDocument);
  const { register, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { password: '', passwordRepeat: '' },
  });
  const { errors } = formState;
  const msg = (m?: string) => (m?.startsWith('validation.') ? validationText(t, m) : m);

  const onSubmit = handleSubmit(async (v) => {
    try {
      await resetPassword({ variables: { data: { secret, password: v.password } }, context: { skipErrorToast: true } });
      enqueueSnackbar(t('forgot.success'), { variant: 'success' });
      void navigate(isAuthenticated ? '/settings/profile' : `/login?email=${encodeURIComponent(email)}`, {
        replace: true,
      });
    } catch (error) {
      const code = getErrorCode(error);
      if (code === 'ERR009') {
        setStep(0);
        return;
      }
      setError('password', { message: t(errorKey(code)) });
    }
  });

  return (
    <>
      <AuthHeading title={t('forgot.title')} subtitle={t('forgot.subtitle')} />
      <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
        {(['email', 'code', 'password'] as const).map((s) => (
          <Step key={s}>
            <StepLabel>{t(`forgot.steps.${s}`)}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {step < 2 ? (
        <EmailVerification
          isUser
          step={step as 0 | 1}
          defaultEmail={email}
          onStepChange={setStep}
          onVerified={(validated, verifiedEmail) => {
            setSecret(validated);
            setEmail(verifiedEmail);
            setStep(2);
          }}
        />
      ) : (
        <Stack component="form" spacing={2} noValidate onSubmit={onSubmit}>
          <PasswordField
            {...register('password')}
            label={t('fields.newPassword')}
            autoComplete="new-password"
            autoFocus
            error={!!errors.password}
            helperText={msg(errors.password?.message)}
          />
          <PasswordField
            {...register('passwordRepeat')}
            label={t('fields.passwordRepeat')}
            autoComplete="new-password"
            error={!!errors.passwordRepeat}
            helperText={msg(errors.passwordRepeat?.message)}
          />
          <Button type="submit" variant="contained" size="large" loading={loading}>
            {t('forgot.submit')}
          </Button>
        </Stack>
      )}

      <Typography variant="body2" sx={{ textAlign: 'center', mt: 3 }}>
        <Link component={RouterLink} to={isAuthenticated ? '/settings/profile' : '/login'}>
          {isAuthenticated ? t('common:actions.back') : t('forgot.backToLogin')}
        </Link>
      </Typography>
    </>
  );
}
