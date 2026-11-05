import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { AddRounded, DeleteOutlineRounded } from '@mui/icons-material';
import { useMutation } from '@apollo/client/react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import {
  CreateStateDocument,
  UpdateStateDocument,
  type StateItemFragment,
  type UpdateState,
} from '@/graphql/generated/graphql';
import { useIsMobile } from '@/hooks/useIsMobile';
import { tiersOf, toPenaltyLists } from './stateValues';

const REQUIRED = 'settings:states.validation.required';
const text = (max: number) => z.string().trim().min(1, REQUIRED).max(max, 'settings:states.validation.max');
const int = z.string().refine((v) => /^\d+$/.test(v), 'settings:states.validation.integer');
const percent = z
  .string()
  .refine(
    (v) => /^\d+([.,]\d{1,2})?$/.test(v) && Number(v.replace(',', '.')) <= 100,
    'settings:states.validation.percent',
  );

const schema = z
  .object({
    name: text(50),
    code: text(4),
    psp: text(20),
    driverBufferMinutes: int,
    tiers: z.array(z.object({ hours: int, percent })),
  })
  .superRefine((v, ctx) => {
    // Aynı saat iki kez girilemez (backend saatleri artan ve tekil bekler)
    const seen = new Set<string>();
    v.tiers.forEach((tier, i) => {
      const key = String(Number(tier.hours));
      if (tier.hours && seen.has(key)) {
        ctx.addIssue({ code: 'custom', path: ['tiers', i, 'hours'], message: 'settings:states.validation.duplicate' });
      }
      seen.add(key);
    });
  });

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  state: StateItemFragment | null;
  onClose: () => void;
  onSaved: () => void;
};

/** Bölge ekle/düzenle: ad, kod, ödeme sağlayıcısı, sürücü tamponu ve iptal cezası basamakları. */
export function StateDialog({ open, ...rest }: Props) {
  return open ? <Inner {...rest} /> : null;
}

function Inner({ state, onClose, onSaved }: Omit<Props, 'open'>) {
  const { t } = useTranslation();
  const mobile = useIsMobile();
  const { enqueueSnackbar } = useSnackbar();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, dirtyFields, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: state?.name ?? '',
      code: state?.code ?? '',
      psp: state?.psp ?? '',
      driverBufferMinutes: String(state?.driverBufferMinutes ?? 30),
      tiers: tiersOf(state),
    },
  });
  const tiers = useFieldArray({ control, name: 'tiers' });
  const [create, { loading: creating }] = useMutation(CreateStateDocument);
  const [update, { loading: updating }] = useMutation(UpdateStateDocument);
  const busy = creating || updating;

  const onSubmit = handleSubmit(async (v) => {
    const penalties = toPenaltyLists(v.tiers);
    try {
      if (state) {
        const data: UpdateState = { id: state.id };
        if (dirtyFields.name) data.name = v.name.trim();
        if (dirtyFields.code) data.code = v.code.trim().toUpperCase();
        if (dirtyFields.psp) data.psp = v.psp.trim();
        if (dirtyFields.driverBufferMinutes) data.driverBufferMinutes = Number(v.driverBufferMinutes);
        // Listeler birlikte gönderilmeli; ikisi de tamamen değiştirilir
        if (dirtyFields.tiers) Object.assign(data, penalties);
        await update({ variables: { data } });
      } else {
        await create({
          variables: {
            data: {
              name: v.name.trim(),
              code: v.code.trim().toUpperCase(),
              psp: v.psp.trim(),
              driverBufferMinutes: Number(v.driverBufferMinutes),
              ...penalties,
            },
          },
        });
      }
      enqueueSnackbar(t('settings:states.saved'), { variant: 'success' });
      onSaved();
      onClose();
    } catch {
      // Hatalar (ör. kod zaten kullanılıyor) Apollo error link'i tarafından snackbar'da gösterilir.
    }
  });

  const msg = (message?: string, max?: number) => (message ? t(message, { count: max }) : undefined);

  return (
    <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="sm" fullScreen={mobile}>
      <form onSubmit={onSubmit} noValidate style={{ display: 'contents' }}>
        <DialogTitle>{t(state ? 'settings:states.editTitle' : 'settings:states.createTitle')}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  required
                  label={t('settings:states.fields.name')}
                  {...register('name')}
                  error={!!errors.name}
                  helperText={msg(errors.name?.message, 50)}
                  slotProps={{ htmlInput: { maxLength: 50 } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  required
                  label={t('settings:states.fields.code')}
                  {...register('code')}
                  error={!!errors.code}
                  helperText={msg(errors.code?.message, 4)}
                  slotProps={{ htmlInput: { maxLength: 4, style: { textTransform: 'uppercase' } } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  required
                  label={t('settings:states.fields.psp')}
                  {...register('psp')}
                  error={!!errors.psp}
                  helperText={msg(errors.psp?.message, 20) ?? t('settings:states.pspHelper')}
                  slotProps={{ htmlInput: { maxLength: 20 } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  required
                  label={t('settings:states.fields.driverBufferMinutes')}
                  {...register('driverBufferMinutes')}
                  error={!!errors.driverBufferMinutes}
                  helperText={msg(errors.driverBufferMinutes?.message)}
                  slotProps={{
                    htmlInput: { inputMode: 'numeric' },
                    input: { endAdornment: <InputAdornment position="end">{t('settings:states.minutes')}</InputAdornment> },
                  }}
                />
              </Grid>
            </Grid>

            <Box>
              <Typography variant="overline" color="text.secondary">
                {t('settings:states.penalties.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('settings:states.penalties.description')}
              </Typography>
              <Stack spacing={1.5}>
                {tiers.fields.map((f, i) => (
                  <Stack key={f.id} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <TextField
                      size="small"
                      label={t('settings:states.penalties.hours')}
                      {...register(`tiers.${i}.hours`)}
                      error={!!errors.tiers?.[i]?.hours}
                      helperText={msg(errors.tiers?.[i]?.hours?.message)}
                      slotProps={{
                        htmlInput: { inputMode: 'numeric' },
                        input: { endAdornment: <InputAdornment position="end">{t('settings:states.hoursUnit')}</InputAdornment> },
                      }}
                    />
                    <TextField
                      size="small"
                      label={t('settings:states.penalties.rate')}
                      {...register(`tiers.${i}.percent`)}
                      error={!!errors.tiers?.[i]?.percent}
                      helperText={msg(errors.tiers?.[i]?.percent?.message)}
                      slotProps={{
                        htmlInput: { inputMode: 'decimal' },
                        input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
                      }}
                    />
                    <Tooltip title={t('settings:states.penalties.remove')}>
                      <IconButton aria-label={t('settings:states.penalties.remove')} onClick={() => tiers.remove(i)}>
                        <DeleteOutlineRounded />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ))}
                <Box>
                  <Button size="small" startIcon={<AddRounded />} onClick={() => tiers.append({ hours: '', percent: '' })}>
                    {t('settings:states.penalties.add')}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={onClose} disabled={busy}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit" variant="contained" loading={busy} disabled={!!state && !isDirty}>
            {t('actions.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
