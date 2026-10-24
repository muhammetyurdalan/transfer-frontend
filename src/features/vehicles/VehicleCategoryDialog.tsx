import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import {
  CreateVehicleCategoryDocument,
  UpdateVehicleCategoryDocument,
  type Currency,
  type UpdateVehicleCategory,
  type VehicleCategoryItemFragment,
} from '@/graphql/generated/graphql';
import { FileInput } from '@/components/FileInput';
import { Money } from '@/components/Money';
import { useIsMobile } from '@/hooks/useIsMobile';
import { toDecimal } from '@/lib/format';
import { mediaUrl } from '@/lib/media';

const CURRENCIES: Currency[] = ['TRY', 'EUR', 'USD', 'GBP'];
const SAMPLE_KM = 30;
const SAMPLE_MIN = 40;

const intMin = (min: number) =>
  z.string().refine((v) => /^\d+$/.test(v) && Number(v) >= min, 'vehicles:categories.validation.min');
const money = z
  .string()
  .refine((v) => v === '' || (/^\d+([.,]\d{1,2})?$/.test(v) && Number(v.replace(',', '.')) >= 0), 'vehicles:categories.validation.number');

const schema = z.object({
  nameEn: z.string().trim().min(1, 'vehicles:validation.required').max(50, 'vehicles:validation.max'),
  nameTr: z.string().trim().max(50, 'vehicles:validation.max'),
  descriptionEn: z.string(),
  descriptionTr: z.string(),
  maxPassengers: intMin(1),
  maxLuggage: intMin(0),
  childSeatCapacity: intMin(0),
  isWheelchairAccessible: z.boolean(),
  baseFare: money,
  perKmPrice: money,
  perMinutePrice: money,
  minimumFare: money,
  currency: z.enum(['USD', 'EUR', 'GBP', 'TRY']),
  order: intMin(0),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;
const MONEY_FIELDS = ['baseFare', 'perKmPrice', 'perMinutePrice', 'minimumFare'] as const;
const INT_FIELDS = ['maxPassengers', 'maxLuggage', 'childSeatCapacity', 'order'] as const;
const TEXT_FIELDS = ['nameEn', 'nameTr', 'descriptionEn', 'descriptionTr'] as const;

const num = (v: string) => Number((v || '0').replace(',', '.'));
const dec = (v: string) => toDecimal(num(v));

/** Fiyat formülü backend ile aynı: max(minimumFare, baseFare + km*perKm + dk*perMinute) */
function previewPrice(v: Pick<FormValues, (typeof MONEY_FIELDS)[number]>) {
  return Math.max(num(v.minimumFare), num(v.baseFare) + SAMPLE_KM * num(v.perKmPrice) + SAMPLE_MIN * num(v.perMinutePrice));
}

type Props = {
  open: boolean;
  category: VehicleCategoryItemFragment | null;
  onClose: () => void;
  onSaved: () => void;
};

/** Araç kategorisi ekle/düzenle (§8.10): EN/TR sekmeleri ve örnek fiyat önizlemesi. */
export function VehicleCategoryDialog({ open, ...rest }: Props) {
  return open ? <Inner {...rest} /> : null;
}

function Inner({ category, onClose, onSaved }: Omit<Props, 'open'>) {
  const { t } = useTranslation();
  const mobile = useIsMobile();
  const { enqueueSnackbar } = useSnackbar();
  const [lang, setLang] = useState<'en' | 'tr'>('en');
  const [image, setImage] = useState<File | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, dirtyFields, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nameEn: category?.nameEn ?? '',
      nameTr: category?.nameTr ?? '',
      descriptionEn: category?.descriptionEn ?? '',
      descriptionTr: category?.descriptionTr ?? '',
      maxPassengers: String(category?.maxPassengers ?? 4),
      maxLuggage: String(category?.maxLuggage ?? 2),
      childSeatCapacity: String(category?.childSeatCapacity ?? 0),
      isWheelchairAccessible: category?.isWheelchairAccessible ?? false,
      baseFare: category?.baseFare ?? '0',
      perKmPrice: category?.perKmPrice ?? '0',
      perMinutePrice: category?.perMinutePrice ?? '0',
      minimumFare: category?.minimumFare ?? '0',
      currency: category?.currency ?? 'TRY',
      order: String(category?.order ?? 0),
      isActive: category?.isActive ?? true,
    },
  });
  const pricing = useWatch({ control, name: [...MONEY_FIELDS, 'currency'] });
  const [baseFare, perKmPrice, perMinutePrice, minimumFare, currency] = pricing;

  const [create, { loading: creating }] = useMutation(CreateVehicleCategoryDocument);
  const [update, { loading: updating }] = useMutation(UpdateVehicleCategoryDocument);

  const onSubmit = handleSubmit(async (v) => {
    try {
      if (category) {
        const data: UpdateVehicleCategory = { id: category.id };
        for (const f of TEXT_FIELDS) if (dirtyFields[f]) data[f] = v[f].trim();
        for (const f of INT_FIELDS) if (dirtyFields[f]) data[f] = Number(v[f]);
        for (const f of MONEY_FIELDS) if (dirtyFields[f]) data[f] = dec(v[f]);
        if (dirtyFields.currency) data.currency = v.currency;
        if (dirtyFields.isWheelchairAccessible) data.isWheelchairAccessible = v.isWheelchairAccessible;
        if (dirtyFields.isActive) data.isActive = v.isActive;
        if (image) data.image = image;
        await update({ variables: { data } });
      } else {
        await create({
          variables: {
            data: {
              nameEn: v.nameEn.trim(),
              nameTr: v.nameTr.trim() || undefined,
              descriptionEn: v.descriptionEn.trim() || undefined,
              descriptionTr: v.descriptionTr.trim() || undefined,
              image: image ?? undefined,
              maxPassengers: Number(v.maxPassengers),
              maxLuggage: Number(v.maxLuggage),
              childSeatCapacity: Number(v.childSeatCapacity),
              isWheelchairAccessible: v.isWheelchairAccessible,
              baseFare: dec(v.baseFare),
              perKmPrice: dec(v.perKmPrice),
              perMinutePrice: dec(v.perMinutePrice),
              minimumFare: dec(v.minimumFare),
              currency: v.currency,
              order: Number(v.order),
              isActive: v.isActive,
            },
          },
        });
      }
      enqueueSnackbar(t('vehicles:categories.saved'), { variant: 'success' });
      onSaved();
      onClose();
    } catch {
      // ERR030 vb. hatalar Apollo error link'i tarafından snackbar'da gösterilir.
    }
  });

  const msg = (name: keyof FormValues) => {
    const e = errors[name];
    if (!e?.message) return undefined;
    return t(e.message, { count: 50, min: name === 'maxPassengers' ? 1 : 0 });
  };
  const numberField = (name: (typeof INT_FIELDS)[number] | (typeof MONEY_FIELDS)[number], decimal = false) => (
    <TextField
      label={t(`vehicles:categories.fields.${name}`)}
      required={name === 'maxPassengers' || name === 'maxLuggage'}
      {...register(name)}
      error={!!errors[name]}
      helperText={msg(name)}
      slotProps={{ htmlInput: { inputMode: decimal ? 'decimal' : 'numeric' } }}
    />
  );
  const busy = creating || updating;

  return (
    <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="md" fullScreen={mobile}>
      <form onSubmit={onSubmit} noValidate style={{ display: 'contents' }}>
        <DialogTitle>{t(category ? 'vehicles:categories.editTitle' : 'vehicles:categories.createTitle')}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                {t('vehicles:categories.sections.content')}
              </Typography>
              <Tabs value={lang} onChange={(_, v) => setLang(v)} sx={{ mb: 2 }}>
                <Tab value="en" label="EN" />
                <Tab value="tr" label="TR" />
              </Tabs>
              <Stack spacing={2} sx={{ display: lang === 'en' ? 'flex' : 'none' }}>
                <TextField required label={t('vehicles:categories.fields.nameEn')} {...register('nameEn')} error={!!errors.nameEn} helperText={msg('nameEn')} />
                <TextField multiline minRows={2} label={t('vehicles:categories.fields.descriptionEn')} {...register('descriptionEn')} />
              </Stack>
              <Stack spacing={2} sx={{ display: lang === 'tr' ? 'flex' : 'none' }}>
                <TextField
                  label={t('vehicles:categories.fields.nameTr')}
                  {...register('nameTr')}
                  error={!!errors.nameTr}
                  helperText={msg('nameTr') ?? t('vehicles:categories.trFallback')}
                />
                <TextField multiline minRows={2} label={t('vehicles:categories.fields.descriptionTr')} {...register('descriptionTr')} />
              </Stack>
              {errors.nameEn && lang === 'tr' && (
                <Typography variant="caption" color="error">
                  {t('vehicles:categories.fields.nameEn')}: {msg('nameEn')}
                </Typography>
              )}
            </Box>
            <FileInput
              value={image}
              onChange={setImage}
              label={t('vehicles:categories.fields.image')}
              currentUrl={mediaUrl(category?.image)}
            />
            <Box>
              <Typography variant="overline" color="text.secondary">
                {t('vehicles:categories.sections.capacity')}
              </Typography>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid size={{ xs: 12, sm: 4 }}>{numberField('maxPassengers')}</Grid>
                <Grid size={{ xs: 12, sm: 4 }}>{numberField('maxLuggage')}</Grid>
                <Grid size={{ xs: 12, sm: 4 }}>{numberField('childSeatCapacity')}</Grid>
                <Grid size={12}>
                  <Controller
                    control={control}
                    name="isWheelchairAccessible"
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                        label={t('vehicles:categories.fields.isWheelchairAccessible')}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box>
              <Typography variant="overline" color="text.secondary">
                {t('vehicles:categories.sections.pricing')}
              </Typography>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>{numberField('baseFare', true)}</Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>{numberField('perKmPrice', true)}</Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>{numberField('perMinutePrice', true)}</Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>{numberField('minimumFare', true)}</Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    control={control}
                    name="currency"
                    render={({ field }) => (
                      <TextField select label={t('vehicles:categories.fields.currency')} {...field}>
                        {CURRENCIES.map((c) => (
                          <MenuItem key={c} value={c}>
                            {c}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>{numberField('order')}</Grid>
              </Grid>
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 3,
                  bgcolor: 'inverse.main',
                  color: 'inverse.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Box>
                  <Typography variant="subtitle2">{t('vehicles:categories.preview')}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {t('vehicles:categories.previewBody')}
                  </Typography>
                </Box>
                <Money
                  amount={previewPrice({ baseFare, perKmPrice, perMinutePrice, minimumFare })}
                  currency={currency}
                  variant="h5"
                  sx={{ color: 'inverse.accent', fontWeight: 700 }}
                />
              </Box>
            </Box>
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label={t('vehicles:categories.fields.isActive')}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={onClose} disabled={busy}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit" variant="contained" loading={busy} disabled={!!category && !isDirty && !image}>
            {t('actions.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
