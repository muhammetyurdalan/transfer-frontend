import { useEffect, useState, type ReactNode } from 'react';
import {
  Badge,
  Box,
  Button,
  Checkbox,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { DateRangeRounded, FilterListRounded, SearchRounded } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import type { TableState } from '@/components/data-table';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { ALL_STATUSES } from './transferFilter';

type Props = {
  state: TableState;
  showRegion?: boolean;
  showStatus?: boolean;
  /** Filtre ikonlarının altında gösterilir (ör. `ColumnPicker`) */
  columnPicker?: ReactNode;
};

/**
 * Transfer listesi filtreleri (§8.2). Solda transfer no / adres araması ve (operasyon rolleri için) bölge,
 * sağ üstte durum ve tarih aralığı ikon butonları, altında (verildiyse) sütun seçici.
 * Aktif filtre ikonun üzerinde badge ile gösterilir.
 */
export function TransferFilters({ state, showRegion, showStatus = true, columnPicker }: Props) {
  const { t } = useTranslation('transfers');
  const [search, setSearch] = useState(state.get('q') ?? '');
  const debounced = useDebouncedValue(search.trim(), 400);
  const [statusAnchor, setStatusAnchor] = useState<HTMLElement | null>(null);
  const [dateAnchor, setDateAnchor] = useState<HTMLElement | null>(null);
  const statuses = state.getAll('status');
  const from = state.get('from');
  const to = state.get('to');

  useEffect(() => {
    if (debounced !== (state.get('q') ?? '')) state.set('q', debounced || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const toggleStatus = (s: string) =>
    state.set('status', statuses.includes(s) ? statuses.filter((x) => x !== s) : [...statuses, s]);

  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
      <TextField
        size="small"
        label={t('filters.search')}
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
        sx={{ width: { xs: 'auto', md: 280 }, flex: { xs: 1, md: 'none' }, minWidth: 160 }}
      />
      {showRegion && (
        <TextField
          size="small"
          label={t('filters.region')}
          fullWidth={false}
          value={state.get('stateId') ?? ''}
          onChange={(e) => state.set('stateId', e.target.value.replace(/\D/g, '') || null)}
          slotProps={{ htmlInput: { inputMode: 'numeric' } }}
          sx={{ width: 140 }}
        />
      )}
      <Stack spacing={0.25} sx={{ ml: 'auto', alignItems: 'flex-end' }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {showStatus && (
            <Tooltip title={t('filters.status')}>
              <IconButton
                aria-label={t('filters.status')}
                aria-haspopup="menu"
                onClick={(e) => setStatusAnchor(e.currentTarget)}
                color={statuses.length ? 'primary' : 'default'}
              >
                <Badge badgeContent={statuses.length} color="primary">
                  <FilterListRounded />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={t('filters.dateRange')}>
            <IconButton
              aria-label={t('filters.dateRange')}
              aria-haspopup="dialog"
              onClick={(e) => setDateAnchor(e.currentTarget)}
              color={from || to ? 'primary' : 'default'}
            >
              <Badge variant="dot" invisible={!from && !to} color="primary">
                <DateRangeRounded />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>
        {columnPicker}
      </Stack>

      <Menu
        anchorEl={statusAnchor}
        open={!!statusAnchor}
        onClose={() => setStatusAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {ALL_STATUSES.map((s) => (
          <MenuItem key={s} onClick={() => toggleStatus(s)} dense>
            <ListItemIcon>
              <Checkbox checked={statuses.includes(s)} size="small" edge="start" disableRipple />
            </ListItemIcon>
            <ListItemText primary={t(`common:status.${s}`)} />
          </MenuItem>
        ))}
        {statuses.length > 0 && (
          <Box sx={{ px: 1.5, pt: 0.5 }}>
            <Button size="small" fullWidth onClick={() => state.set('status', null)}>
              {t('filters.clear')}
            </Button>
          </Box>
        )}
      </Menu>

      <Popover
        anchorEl={dateAnchor}
        open={!!dateAnchor}
        onClose={() => setDateAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Stack spacing={1.5} sx={{ p: 2, width: 280 }}>
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
          {(from || to) && (
            <Button
              size="small"
              onClick={() => state.setMany({ from: null, to: null })}
            >
              {t('filters.clear')}
            </Button>
          )}
        </Stack>
      </Popover>
    </Stack>
  );
}
