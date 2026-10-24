import { useState } from 'react';
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Link,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link as RouterLink, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { CreateUserDocument } from '@/graphql/generated/graphql';
import { useAuth } from '@/app/providers/AuthProvider';
import { FileInput } from '@/components/FileInput';
import { errorKey, getErrorCode } from '@/lib/errors';
import { AuthHeading } from './AuthHeading';
import { EmailVerification } from './EmailVerification';
import { PasswordField } from './PasswordField';
import { nameSchema, passwordFields, passwordsMatch, validationText } from './schemas';

const schema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    phone: z.string().trim().max(20, 'validation.max|20'),
    asDriver: z.boolean(),
    profileImage: z.instanceof(File).nullable(),
    ...passwordFields,
  })
  .refine(...passwordsMatch);

export default function RegisterPage() {
  const { t } = useTranslation('auth');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [secret, setSecret] = useState('');
  const [createUser, { loading }] = useMutation(CreateUserDocument);
  const { register, control, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      password: '',
      passwordRepeat: '',
      asDriver: false,
      profileImage: null,
    },
  });
  const { errors } = formState;
  const msg = (m?: string) => (m?.startsWith('validation.') ? validationText(t, m) : m);

  const onSubmit = handleSubmit(async (v) => {
    try {
      const { data } = await createUser({
        variables: {
          data: {
            secret,
            password: v.password,
            firstName: v.firstName,
            lastName: v.lastName,
            phone: v.phone || undefined,
            profileImage: v.profileImage ?? undefined,
            role: v.asDriver ? 'DRIVER' : 'CUSTOMER',
          },
        },
        context: { skipErrorToast: true },
      });
      if (!data) return;
      login(data.createUser.token, data.createUser.user);
      void navigate('/', { replace: true });
    } catch (error) {
      const code = getErrorCode(error);
      if (code === 'ERR009') {
        setStep(0);
        return;
      }
      setError('root', { message: t(errorKey(code)) });
    }
  });

  return (
    <>
      <AuthHeading title={t('register.title')} subtitle={t('register.subtitle')} />
      <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
        {(['email', 'code', 'details'] as const).map((s) => (
          <Step key={s}>
            <StepLabel>{t(`register.steps.${s}`)}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {step < 2 ? (
        <EmailVerification
          isUser={false}
          step={step as 0 | 1}
          onStepChange={setStep}
          onVerified={(validated) => {
            setSecret(validated);
            setStep(2);
          }}
        />
      ) : (
        <Stack component="form" spacing={2} noValidate onSubmit={onSubmit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('firstName')}
                label={t('fields.firstName')}
                autoComplete="given-name"
                autoFocus
                error={!!errors.firstName}
                helperText={msg(errors.firstName?.message)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('lastName')}
                label={t('fields.lastName')}
                autoComplete="family-name"
                error={!!errors.lastName}
                helperText={msg(errors.lastName?.message)}
              />
            </Grid>
          </Grid>
          <TextField
            {...register('phone')}
            label={t('fields.phone')}
            type="tel"
            autoComplete="tel"
            error={!!errors.phone}
            helperText={msg(errors.phone?.message)}
          />
          <PasswordField
            {...register('password')}
            label={t('fields.password')}
            autoComplete="new-password"
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
          <Controller
            control={control}
            name="profileImage"
            render={({ field }) => (
              <FileInput
                value={field.value}
                onChange={field.onChange}
                label={t('fields.profileImage')}
                maxSize={2 * 1024 * 1024}
              />
            )}
          />
          <Controller
            control={control}
            name="asDriver"
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                label={
                  <>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {t('register.asDriver')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('register.asDriverHint')}
                    </Typography>
                  </>
                }
              />
            )}
          />
          {errors.root && (
            <Typography color="error" variant="body2">
              {errors.root.message}
            </Typography>
          )}
          <Button type="submit" variant="contained" size="large" loading={loading}>
            {t('register.submit')}
          </Button>
        </Stack>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
        {t('register.hasAccount')}{' '}
        <Link component={RouterLink} to="/login">
          {t('register.login')}
        </Link>
      </Typography>
    </>
  );
}
