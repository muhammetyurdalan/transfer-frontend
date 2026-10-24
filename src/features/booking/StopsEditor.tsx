import { Box, Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { AddLocationAltRounded, RemoveCircleOutlineRounded } from '@mui/icons-material';
import { Controller, useFieldArray, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AddressField } from '@/components/address';
import type { LatLng } from '@/lib/geo';
import { MAX_STOPS } from './schema';
import type { TransferFormValues } from './types';

type Props = {
  control: Control<TransferFormValues>;
  near: LatLng | null;
  /** Durak alanlarının altında, "Add stop" ile aynı satırda sağda (ör. yer değiştir butonu) */
  trailing?: React.ReactNode;
};

/**
 * Pickup ile dropoff arasındaki ara duraklar. "Add stop" araya yeni bir adres alanı açar,
 * en fazla `MAX_STOPS` durak eklenebilir.
 */
export function StopsEditor({ control, near, trailing }: Props) {
  const { t } = useTranslation('booking');
  const { fields, append, remove } = useFieldArray({ control, name: 'stops' });
  const full = fields.length >= MAX_STOPS;

  return (
    <>
      {fields.map((field, index) => (
        <Stack key={field.id} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
          <Box
            aria-hidden
            sx={{
              mt: 1.75,
              width: 24,
              height: 24,
              flexShrink: 0,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'inverse.main',
              color: 'inverse.accent',
              border: 1,
              borderColor: 'inverse.accent',
              typography: 'caption',
              fontWeight: 700,
            }}
          >
            {index + 1}
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Controller
              control={control}
              name={`stops.${index}.address`}
              render={({ field: f, fieldState }) => (
                <AddressField
                  label={t('stops.item', { n: index + 1 })}
                  value={f.value}
                  onChange={f.onChange}
                  near={near}
                  error={fieldState.error?.message}
                />
              )}
            />
          </Box>
          <Tooltip title={t('stops.remove')}>
            <IconButton
              aria-label={t('stops.remove')}
              onClick={() => remove(index)}
              sx={{ mt: 0.75, color: 'error.main' }}
            >
              <RemoveCircleOutlineRounded />
            </IconButton>
          </Tooltip>
        </Stack>
      ))}

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddLocationAltRounded />}
            disabled={full}
            onClick={() => append({ address: null }, { shouldFocus: false })}
          >
            {t('stops.add')}
          </Button>
          <Typography variant="caption" color="text.secondary" noWrap>
            {full ? t('stops.limit', { max: MAX_STOPS }) : `${fields.length}/${MAX_STOPS}`}
          </Typography>
        </Stack>
        {trailing}
      </Stack>
    </>
  );
}
