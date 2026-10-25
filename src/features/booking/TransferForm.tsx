import { useMemo, useState, type ReactNode } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Grid,
  IconButton,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AccessibleRounded,
  ChildFriendlyRounded,
  LuggageRounded,
  PersonRounded,
  RefreshRounded,
  RouteRounded,
  SwapVertRounded,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AddressField, positionOf } from '@/components/address';
import { RouteMap } from '@/components/map/RouteMap';
import { PhoneField } from '@/components/PhoneField';
import { StickyActionBar } from '@/components/StickyActionBar';
import { errorKey } from '@/lib/errors';
import { formatRoute } from '@/lib/format';
import type { LatLng, SelectedAddress } from '@/lib/geo';
import { CounterField } from './CounterField';
import { FormSection } from './FormSection';
import { makeTransferSchema, minPickupTime } from './schema';
import { StopsEditor } from './StopsEditor';
import type { RouteInfo, TransferFormValues } from './types';
import { useRoute } from './useRoute';
import { sameAddress } from './values';

type Props = {
  mode: 'create' | 'edit';
  defaultValues: TransferFormValues;
  /** Düzenlemede kayıtlı mesafe/süre: adresler değişmedikçe bu kullanılır */
  initialRoute?: RouteInfo | null;
  /** Düzenlemede salt okunur leg bölümü */
  legsSlot?: ReactNode;
  submitLabel: string;
  submitting: boolean;
  /** Ek submit koşulu (düzenlemede: değişiklik var mı) */
  canSubmit?: (values: TransferFormValues) => boolean;
  /** Başarısızsa backend hata kodunu döner, form alanlara dağıtır */
  onSubmit: (values: TransferFormValues, route: RouteInfo) => Promise<string | null>;
};

/** Transfer oluştur / düzenle formu (§8.3, §8.5). */
export function TransferForm({
  mode,
  defaultValues,
  initialRoute,
  legsSlot,
  submitLabel,
  submitting,
  canSubmit,
  onSubmit,
}: Props) {
  const { t } = useTranslation(['booking', 'common']);
  const schema = useMemo(
    () => makeTransferSchema(t, mode === 'edit' ? defaultValues.pickupTime : null),
    [t, mode, defaultValues.pickupTime],
  );
  const { control, handleSubmit, setValue, setError, getValues, formState } = useForm<TransferFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const values = useWatch({ control }) as TransferFormValues;
  const { pickup, dropoff } = values;
  const stops = useMemo(() => values.stops ?? [], [values.stops]);
  const stopPositions = stops.map((s) => positionOf(s.address)).filter((p): p is LatLng => !!p);

  // Rota pickup → seçilmiş ara duraklar → dropoff sırasıyla hesaplanır.
  const route = useRoute([positionOf(pickup), ...stopPositions, positionOf(dropoff)]);
  const addressesUnchanged =
    mode === 'edit' && sameAddress(pickup, defaultValues.pickup) && sameAddress(dropoff, defaultValues.dropoff);
  // Düzenlemede adresler aynıysa kayıtlı mesafe/süre geçerlidir; OSRM sadece çizgiyi verir.
  const effectiveRoute: RouteInfo | null = addressesUnchanged && initialRoute
    ? { ...initialRoute, path: route.route?.path }
    : route.route;
  const routeLoading = route.status === 'loading' && !effectiveRoute;
  const routeFailed = route.status === 'error' && !effectiveRoute;

  // İki adres de koordinat + ilçe adıyla seçilmeden asla aktif olmaz (düzenlemede değişmeyen adres hariç).
  const addressReady = (a: SelectedAddress | null, initial: SelectedAddress | null) =>
    !!a && !!a.latitude && !!a.longitude && (!!a.districtName || (mode === 'edit' && sameAddress(a, initial)));
  const ready =
    addressReady(pickup, defaultValues.pickup) &&
    addressReady(dropoff, defaultValues.dropoff) &&
    !!effectiveRoute &&
    Number(effectiveRoute.distance) > 0 &&
    effectiveRoute.duration > 0 &&
    formState.isValid &&
    (canSubmit?.(values) ?? true);

  const submit = handleSubmit(async (v) => {
    if (!effectiveRoute) return;
    setFormError(null);
    const code = await onSubmit(v, effectiveRoute);
    if (!code) return;
    if (code === 'ERR035') {
      const message = t('booking:address.outOfArea');
      setError('pickup', { message });
      setError('dropoff', { message });
    } else if (code === 'ERR016') {
      setError('pickupTime', { message: t(errorKey(code)) });
    } else {
      setFormError(t(errorKey(code)));
    }
  });

  // Yer değiştirmede ara duraklar da ters sıraya girer.
  const swap = () => {
    const { pickup: p, dropoff: d, stops: s } = getValues();
    setValue('pickup', d, { shouldDirty: true, shouldValidate: true });
    setValue('dropoff', p, { shouldDirty: true, shouldValidate: true });
    if (s.length > 1) setValue('stops', [...s].reverse(), { shouldDirty: true, shouldValidate: true });
  };

  const swapButton = (
    <Tooltip title={t('booking:fields.swap')}>
      <IconButton
        aria-label={t('booking:fields.swap')}
        onClick={swap}
        sx={{ bgcolor: 'inverse.main', color: 'inverse.accent', '&:hover': { bgcolor: 'inverse.light' } }}
      >
        <SwapVertRounded />
      </IconButton>
    </Tooltip>
  );

  const map = (height: number) => (
    <RouteMap
      from={positionOf(pickup)}
      to={positionOf(dropoff)}
      stops={stopPositions}
      path={effectiveRoute?.path}
      height={height}
    />
  );

  const routeSummary = routeLoading ? (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Skeleton variant="text" width={120} sx={{ bgcolor: 'inverse.light' }} />
      <Typography variant="caption">{t('booking:route.calculating')}</Typography>
    </Stack>
  ) : routeFailed ? (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Typography variant="body2">{t('booking:route.failed')}</Typography>
      <Button size="small" startIcon={<RefreshRounded />} onClick={route.retry} sx={{ color: 'inverse.accent' }}>
        {t('common:actions.retry')}
      </Button>
    </Stack>
  ) : effectiveRoute ? (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <RouteRounded sx={{ color: 'inverse.accent' }} />
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {formatRoute(effectiveRoute.distance, effectiveRoute.duration)}
      </Typography>
    </Stack>
  ) : (
    <Typography variant="body2" sx={{ opacity: 0.75 }}>
      {t('booking:route.selectBoth')}
    </Typography>
  );

  return (
    <Box component="form" noValidate onSubmit={(e) => void submit(e)}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2.5}>
            {/* Mobilde harita formun üstünde küçük önizleme */}
            {pickup && dropoff && <Box sx={{ display: { xs: 'block', md: 'none' } }}>{map(180)}</Box>}

            {formError && (
              <Alert severity="error" onClose={() => setFormError(null)}>
                {formError}
              </Alert>
            )}

            <FormSection index={1} title={t('booking:sections.route')}>
              <Stack spacing={1}>
                <Controller
                  control={control}
                  name="pickup"
                  render={({ field, fieldState }) => (
                    <AddressField
                      label={t('booking:fields.pickup')}
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />
                {mode === 'create' ? (
                  <StopsEditor control={control} near={positionOf(pickup)} trailing={swapButton} />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>{swapButton}</Box>
                )}
                <Controller
                  control={control}
                  name="dropoff"
                  render={({ field, fieldState }) => (
                    <AddressField
                      label={t('booking:fields.dropoff')}
                      value={field.value}
                      onChange={field.onChange}
                      near={positionOf(pickup)}
                      error={fieldState.error?.message}
                    />
                  )}
                />
                {routeFailed && (
                  <Alert
                    severity="warning"
                    action={
                      <Button color="inherit" size="small" onClick={route.retry}>
                        {t('common:actions.retry')}
                      </Button>
                    }
                  >
                    {t('booking:route.failed')}
                  </Alert>
                )}
              </Stack>
            </FormSection>

            <FormSection index={2} title={t('booking:sections.time')}>
              <Controller
                control={control}
                name="pickupTime"
                render={({ field, fieldState }) => (
                  <DateTimePicker
                    label={t('booking:fields.pickupTime')}
                    value={field.value}
                    onChange={field.onChange}
                    disablePast
                    minDateTime={minPickupTime()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!fieldState.error,
                        helperText: fieldState.error?.message,
                        onBlur: field.onBlur,
                      },
                    }}
                  />
                )}
              />
            </FormSection>

            <FormSection index={3} title={t('booking:sections.passengers')}>
              <Grid container spacing={1.5}>
                {(
                  [
                    ['passengerCount', <PersonRounded key="p" />, 1],
                    ['luggageCount', <LuggageRounded key="l" />, 0],
                    ['childSeatCount', <ChildFriendlyRounded key="c" />, 0],
                  ] as const
                ).map(([name, icon, min]) => (
                  <Grid key={name} size={12}>
                    <Controller
                      control={control}
                      name={name}
                      render={({ field, fieldState }) => (
                        <CounterField
                          label={t(`booking:fields.${name}`)}
                          icon={icon}
                          value={field.value}
                          onChange={field.onChange}
                          min={min}
                          error={fieldState.error?.message}
                        />
                      )}
                    />
                  </Grid>
                ))}
                <Grid size={12}>
                  <Controller
                    control={control}
                    name="needsWheelchair"
                    render={({ field }) => (
                      <FormControlLabel
                        sx={{ minHeight: 44, ml: 0, gap: 1 }}
                        control={<Switch checked={field.value} onChange={(_, v) => field.onChange(v)} />}
                        label={
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <AccessibleRounded sx={{ color: 'text.secondary' }} />
                            <span>{t('booking:fields.needsWheelchair')}</span>
                          </Stack>
                        }
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </FormSection>

            <FormSection index={4} title={t('booking:sections.passenger')}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    control={control}
                    name="passengerName"
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        required
                        label={t('booking:fields.passengerName')}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        slotProps={{ htmlInput: { maxLength: 100 } }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    control={control}
                    name="passengerPhone"
                    render={({ field, fieldState }) => (
                      <PhoneField
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        label={t('booking:fields.passengerPhone')}
                        error={!!fieldState.error}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    control={control}
                    name="flightNumber"
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label={t('booking:fields.flightNumber')}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        slotProps={{ htmlInput: { maxLength: 10, style: { textTransform: 'uppercase' } } }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={12}>
                  <Controller
                    control={control}
                    name="note"
                    render={({ field }) => (
                      <TextField {...field} multiline minRows={3} label={t('booking:fields.note')} />
                    )}
                  />
                </Grid>
              </Grid>
            </FormSection>

            {legsSlot}
          </Stack>
        </Grid>

        <Grid size={{ md: 5 }} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ position: 'sticky', top: 92 }}>{map(440)}</Box>
        </Grid>
      </Grid>

      <StickyActionBar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>{routeSummary}</Box>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={!ready}
          loading={submitting}
          sx={{ minWidth: { xs: '100%', sm: 200 }, '&.Mui-disabled': { bgcolor: 'inverse.light', color: 'inverse.contrastText', opacity: 0.6 } }}
        >
          {submitLabel}
        </Button>
      </StickyActionBar>
    </Box>
  );
}
