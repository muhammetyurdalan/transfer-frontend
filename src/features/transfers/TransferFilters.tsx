import { useEffect, useState } from 'react';
import {
  Checkbox,
  FormControl,
  InputAdornment,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from '@mui/material';
import { SearchRounded } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { TableFilters, type TableState } from '@/components/data-table';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { ALL_STATUSES } from './transferFilter';

type Props = { state: TableState; showRegion?: boolean; showStatus?: boolean };

/** Durum, tarih aralığı, yolcu araması ve (operasyon rolleri için) bölge filtresi (§8.2). */
export function TransferFilters({ state, showRegion, showStatus = true }: Props) {
  const { t } = useTranslation('transfers');
  const [search, setSearch] = useState(state.get('q') ?? '');
  const debounced = useDebouncedValue(search.trim(), 400);
  const statuses = state.getAll('status');
  const from = state.get('from');
  const to = state.get('to');

  useEffect(() => {
    if (debounced !== (state.get('q') ?? '')) state.set('q', debounced || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <TableFilters>
      {showStatus && (
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="status-filter">{t('filters.status')}</InputLabel>
          <Select
            labelId="status-filter"
            multiple
            value={statuses}
            onChange={(e) => {
              const v = e.target.value;
              state.set('status', typeof v === 'string' ? v.split(',') : v);
            }}
            input={<OutlinedInput label={t('filters.status')} />}
            renderValue={(selected) => selected.map((s) => t(`common:status.${s}`)).join(', ')}
          >
            {ALL_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                <Checkbox checked={statuses.includes(s)} size="small" />
                <ListItemText primary={t(`common:status.${s}`)} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <DatePicker
        label={t('filters.from')}
        value={from ? dayjs(from) : null}
        onChange={(v) => state.set('from', v?.isValid() ? v.format('YYYY-MM-DD') : null)}
        slotProps={{ textField: { size: 'small' }, field: { clearable: true } }}
      />
      <DatePicker
        label={t('filters.to')}
        value={to ? dayjs(to) : null}
        minDate={from ? dayjs(from) : undefined}
        onChange={(v) => state.set('to', v?.isValid() ? v.format('YYYY-MM-DD') : null)}
        slotProps={{ textField: { size: 'small' }, field: { clearable: true } }}
      />
      <TextField
        size="small"
        label={t('filters.passenger')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth={false}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      {showRegion && (
        <TextField
          size="small"
          label={t('filters.region')}
          fullWidth={false}
          value={state.get('stateId') ?? ''}
          onChange={(e) => state.set('stateId', e.target.value.replace(/\D/g, '') || null)}
          slotProps={{ htmlInput: { inputMode: 'numeric' } }}
          sx={{ maxWidth: { md: 140 } }}
        />
      )}
    </TableFilters>
  );
}
