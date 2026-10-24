import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Grid, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { AddRounded, DeleteOutlineRounded, ExpandMoreRounded } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Controller, useFieldArray, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AddressField, positionOf } from '@/components/address';
import { formatDateTime } from '@/lib/format';
import type { SelectedAddress } from '@/lib/geo';
import type { BookingTransferFieldsFragment } from '@/graphql/generated/graphql';
import type { TransferFormValues } from './types';

/** Oluşturmada düzenlenebilir ara duraklar (`legs`), katlanır bölüm. */
export function LegsEditor({ control, near }: { control: Control<TransferFormValues>; near: SelectedAddress | null }) {
  const { t } = useTranslation('booking');
  const { fields, append, remove } = useFieldArray({ control, name: 'legs' });

  return (
    <Accordion
      disableGutters
      variant="outlined"
      sx={{ borderRadius: 4, '&::before': { display: 'none' }, overflow: 'hidden' }}
      defaultExpanded={fields.length > 0}
    >
      <AccordionSummary expandIcon={<ExpandMoreRounded />} sx={{ px: { xs: 2, sm: 3 }, minHeight: 56 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {t('sections.legs')}
          {fields.length > 0 && ` · ${fields.length}`}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: { xs: 2, sm: 3 }, pb: 3 }}>
        <Stack spacing={2}>
          {fields.map((field, index) => (
            <Box key={field.id} sx={{ border: 1, borderColor: 'divider', borderLeft: 4, borderLeftColor: 'primary.main', borderRadius: 3, p: 2 }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {t('legs.item', { n: index + 1 })}
                </Typography>
                <Tooltip title={t('legs.remove')}>
                  <IconButton aria-label={t('legs.remove')} onClick={() => remove(index)} sx={{ color: 'error.main' }}>
                    <DeleteOutlineRounded />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    control={control}
                    name={`legs.${index}.start`}
                    render={({ field: f, fieldState }) => (
                      <AddressField label={t('legs.start')} value={f.value} onChange={f.onChange} near={positionOf(near)} error={fieldState.error?.message} />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    control={control}
                    name={`legs.${index}.end`}
                    render={({ field: f, fieldState }) => (
                      <AddressField label={t('legs.end')} value={f.value} onChange={f.onChange} near={positionOf(near)} error={fieldState.error?.message} />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    control={control}
                    name={`legs.${index}.startTime`}
                    render={({ field: f, fieldState }) => (
                      <DateTimePicker
                        label={t('legs.startTime')}
                        value={f.value}
                        onChange={f.onChange}
                        disablePast
                        slotProps={{ textField: { fullWidth: true, error: !!fieldState.error, helperText: fieldState.error?.message } }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    control={control}
                    name={`legs.${index}.endTime`}
                    render={({ field: f, fieldState }) => (
                      <DateTimePicker
                        label={t('legs.endTime')}
                        value={f.value}
                        onChange={f.onChange}
                        disablePast
                        slotProps={{ textField: { fullWidth: true, error: !!fieldState.error, helperText: fieldState.error?.message } }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddRounded />}
            onClick={() => append({ start: null, end: null, startTime: null, endTime: null })}
            sx={{ alignSelf: 'flex-start' }}
          >
            {t('legs.add')}
          </Button>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

type Leg = NonNullable<BookingTransferFieldsFragment['legs']>[number];

/** Düzenlemede salt okunur ara duraklar (`updateTransfer` leg değiştiremez). */
export function LegsReadOnly({ legs }: { legs: Leg[] }) {
  const { t } = useTranslation('booking');
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 4, p: { xs: 2, sm: 3 } }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
        {t('sections.legs')}
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 1.5 }}>
        {t('legs.readOnly')}
      </Typography>
      {legs.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('legs.none')}
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {[...legs]
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((leg, i) => (
              <Box key={leg.id} sx={{ borderLeft: 3, borderColor: 'primary.main', pl: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {t('legs.item', { n: i + 1 })}: {leg.startAddress} → {leg.endAddress}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(leg.startTime)} – {formatDateTime(leg.endTime)}
                </Typography>
              </Box>
            ))}
        </Stack>
      )}
    </Box>
  );
}
