import { Button, Link, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { SignInDocument } from '@/graphql/generated/graphql';
import { useAuth } from '@/app/providers/AuthProvider';
import { errorKey, getErrorCode } from '@/lib/errors';
import { AuthHeading } from './AuthHeading';
import { PasswordField } from './PasswordField';
import { emailSchema, validationText } from './schemas';

const schema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'validation.required').max(128, 'validation.max|128'),
});

/** Sadece uygulama içi yollara dönülür (açık yönlendirme engeli). */
function safeNext(next: string | null) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

export default function LoginPage() {
  const { t } = useTranslation('auth');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [signIn, { loading }] = useMutation(SignInDocument);
  const { register, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: params.get('email') ?? '', password: '' },
  });
  const { errors } = formState;

  const onSubmit = handleSubmit(async (values) => {
    try {
      const { data } = await signIn({ variables: { data: values }, context: { skipErrorToast: true } });
      if (!data) return;
      login(data.signIn.token, data.signIn.user);
      void navigate(safeNext(params.get('next')), { replace: true });
    } catch (error) {
      const code = getErrorCode(error);
      const message = t(errorKey(code));
      if (code === 'ERR012') setError('password', { message });
      else setError('email', { message });
    }
  });

  const msg = (m?: string) => (m?.startsWith('validation.') ? validationText(t, m) : m);

  return (
    <>
      <AuthHeading title={t('login.title')} subtitle={t('login.subtitle')} />
      <Stack component="form" spacing={2} noValidate onSubmit={onSubmit}>
        <TextField
          {...register('email')}
          label={t('fields.email')}
          type="email"
          autoComplete="email"
          autoFocus
          error={!!errors.email}
          helperText={msg(errors.email?.message)}
        />
        <PasswordField
          {...register('password')}
          label={t('fields.password')}
          autoComplete="current-password"
          error={!!errors.password}
          helperText={msg(errors.password?.message)}
        />
        <Link component={RouterLink} to="/forgot-password" variant="body2" sx={{ alignSelf: 'flex-end' }}>
          {t('login.forgot')}
        </Link>
        <Button type="submit" variant="contained" size="large" loading={loading}>
          {t('login.submit')}
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          {t('login.noAccount')}{' '}
          <Link component={RouterLink} to="/register">
            {t('login.register')}
          </Link>
        </Typography>
      </Stack>
    </>
  );
}
