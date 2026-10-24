import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
  TextField,
} from '@mui/material';
import { useMutation, useQuery } from '@apollo/client/react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import {
  CreateVehicleDocument,
  UpdateVehicleDocument,
  VehicleCategoriesDocument,
  type UpdateVehicle,
  type VehicleItemFragment,
} from '@/graphql/generated/graphql';
import { FileInput } from '@/components/FileInput';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAuth } from '@/app/providers/AuthProvider';
import { getErrorCode, errorKey } from '@/lib/errors';
import { mediaUrl } from '@/lib/media';
import { DriverAutocomplete } from './DriverAutocomplete';

const currentYear = new Date().getFullYear();

const schema = z.object({
  driver: z.object({ id: z.string() }).passthrough().nullable(),
  categoryId: z.string().min(1, 'vehicles:validation.required'),
  plate: z.string().trim().min(1, 'vehicles:validation.required').max(20, 'vehicles:validation.max'),
  brand: z.string().trim().min(1, 'vehicles:validation.required').max(50, 'vehicles:validation.max'),
  model: z.string().trim().min(1, 'vehicles:validation.required').max(50, 'vehicles:validation.max'),
  year: z
    .string()
    .refine((v) => v === '' || (/^\d{4}$/.test(v) && Number(v) >= 1950 && Number(v) <= currentYear + 1), 'vehicles:validation.year'),
  color: z.string().trim().max(30, 'vehicles:validation.max'),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;
type DriverValue = Parameters<typeof DriverAutocomplete>[0]['value'];

const MAX_LENGTH: Record<string, number> = { plate: 20, brand: 50, model: 50, color: 30 };

type Props = { open: boolean; vehicle: VehicleItemFragment | null; onClose: () => void; onSaved: () => void };

/** Araç ekle/düzenle (§8.9). Düzenlemede sadece değişen alanlar gönderilir. */
export function VehicleDialog({ open, vehicle, onClose, onSaved }: Props) {
  return open ? <VehicleDialogInner vehicle={vehicle} onClose={onClose} onSaved={onSaved} /> : null;
}

function VehicleDialogInner({ vehicle, onClose, onSaved }: Omit<Props, 'open'>) {
  const { t } = useTranslation();
  const mobile = useIsMobile();
  const { enqueueSnackbar } = useSnackbar();
  const { hasRole } = useAuth();
  const canPickDriver = hasRole('ADMIN', 'STAFF');
  const [image, setImage] = useState<File | null>(null);

  const { data: categoryData } = useQuery(VehicleCategoriesDocument, {
    variables: { ordering: [{ order: 'ASC' }], pagination: { offset: 0, limit: 100 } },
  });
  const categories = categoryData?.vehicleCategories?.vehicleCategories ?? [];

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, dirtyFields, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      driver: (vehicle?.driver as DriverValue) ?? null,
      categoryId: vehicle?.categoryId ?? '',
      plate: vehicle?.plate ?? '',
      brand: vehicle?.brand ?? '',
      model: vehicle?.model ?? '',
      year: vehicle?.year ? String(vehicle.year) : '',
      color: vehicle?.color ?? '',
      isActive: vehicle?.isActive ?? true,
    },
  });

  const context = { skipErrorToast: true };
  const [create, { loading: creating }] = useMutation(CreateVehicleDocument, { context });
  const [update, { loading: updating }] = useMutation(UpdateVehicleDocument, { context });

  const handleError = (error: unknown) => {
    const code = getErrorCode(error);
    if (code === 'ERR028') setError('plate', { message: errorKey(code) });
    else if (code === 'ERR015') setError('driver', { message: errorKey(code) });
    else if (code === 'ERR025') setError('categoryId', { message: errorKey(code) });
    else enqueueSnackbar(t(errorKey(code)), { variant: 'error' });
  };

  const onSubmit = handleSubmit(async (v) => {
    const year = v.year ? Number(v.year) : null;
    try {
      if (vehicle) {
        const data: UpdateVehicle = { id: vehicle.id };
        if (dirtyFields.driver && v.driver) data.driverId = v.driver.id;
        if (dirtyFields.categoryId) data.categoryId = v.categoryId;
        if (dirtyFields.plate) data.plate = v.plate.trim();
        if (dirtyFields.brand) data.brand = v.brand.trim();
        if (dirtyFields.model) data.model = v.model.trim();
        if (dirtyFields.year) data.year = year;
        if (dirtyFields.color) data.color = v.color.trim();
        if (dirtyFields.isActive) data.isActive = v.isActive;
        if (image) data.image = image;
        await update({ variables: { data } });
      } else {
        if (!v.driver) {
          setError('driver', { message: 'vehicles:validation.required' });
          return;
        }
        await create({
          variables: {
            data: {
              driverId: v.driver.id,
              categoryId: v.categoryId,
              plate: v.plate.trim(),
              brand: v.brand.trim(),
              model: v.model.trim(),
              year,
              color: v.color.trim() || undefined,
              image: image ?? undefined,
              isActive: v.isActive,
            },
          },
        });
      }
      enqueueSnackbar(t('vehicles:saved'), { variant: 'success' });
      onSaved();
      onClose();
    } catch (error) {
      handleError(error);
    }
  });

  const msg = (name: keyof FormValues) => {
    const m = errors[name]?.message;
    return typeof m === 'string' ? t(m, { count: MAX_LENGTH[name] }) : undefined;
  };
  const busy = creating || updating;

  return (
    <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="sm" fullScreen={mobile}>
      <form onSubmit={onSubmit} noValidate style={{ display: 'contents' }}>
        <DialogTitle>{t(vehicle ? 'vehicles:editTitle' : 'vehicles:createTitle')}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Controller
                control={control}
                name="driver"
                render={({ field }) => (
                  <DriverAutocomplete
                    value={field.value as DriverValue}
                    onChange={field.onChange}
                    disabled={!canPickDriver}
                    error={msg('driver')}
                    helperText={canPickDriver ? undefined : t('vehicles:driverUnavailable')}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <TextField select required label={t('vehicles:fields.category')} {...field} error={!!errors.categoryId} helperText={msg('categoryId')}>
                    {categories.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                required
                label={t('vehicles:fields.plate')}
                {...register('plate')}
                error={!!errors.plate}
                helperText={msg('plate')}
                slotProps={{ htmlInput: { style: { textTransform: 'uppercase' }, maxLength: 20 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField required label={t('vehicles:fields.brand')} {...register('brand')} error={!!errors.brand} helperText={msg('brand')} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField required label={t('vehicles:fields.model')} {...register('model')} error={!!errors.model} helperText={msg('model')} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t('vehicles:fields.year')}
                {...register('year')}
                error={!!errors.year}
                helperText={msg('year')}
                slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 4 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label={t('vehicles:fields.color')} {...register('color')} error={!!errors.color} helperText={msg('color')} />
            </Grid>
            <Grid size={12}>
              <FileInput value={image} onChange={setImage} label={t('vehicles:fields.image')} currentUrl={mediaUrl(vehicle?.image)} />
            </Grid>
            <Grid size={12}>
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                    label={t('vehicles:fields.isActive')}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={onClose} disabled={busy}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit" variant="contained" loading={busy} disabled={!!vehicle && !isDirty && !image}>
            {t('actions.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
