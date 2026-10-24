import { useEffect, useRef, useState } from 'react';
import {
  Autocomplete,
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { CloseRounded, MapRounded, MyLocationRounded, PlaceRounded } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import {
  getCurrentPosition,
  reverseGeocode,
  searchAddress,
  type GeocodeResult,
  type LatLng,
  type SelectedAddress,
} from '@/lib/geo';
import { MapPickerDialog } from './MapPickerDialog';
import { positionOf } from './position';

type Props = {
  label: string;
  value: SelectedAddress | null;
  onChange: (value: SelectedAddress | null) => void;
  /** Aramada sonuçları yakına önceliklendirmek için */
  near?: LatLng | null;
  error?: string;
  disabled?: boolean;
};

function asOption(a: SelectedAddress): GeocodeResult {
  return {
    id: `selected-${a.latitude},${a.longitude}`,
    title: a.address,
    subtitle: '',
    position: positionOf(a) ?? { lat: 0, lng: 0 },
    selected: a,
  };
}

/** Photon autocomplete + konumum + haritadan seç + sil (§6.6). Serbest metin geçerli adres sayılmaz. */
export function AddressField({ label, value, onChange, near, error, disabled }: Props) {
  const { t } = useTranslation('booking');
  const { enqueueSnackbar } = useSnackbar();
  const [input, setInput] = useState(value?.address ?? '');
  const [syncedAddress, setSyncedAddress] = useState(value?.address);
  const [results, setResults] = useState<{ query: string; options: GeocodeResult[] } | null>(null);
  const [locating, setLocating] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const query = useDebouncedValue(input, 350).trim();
  const abortRef = useRef<AbortController | null>(null);

  // Dışarıdan değişen değer (yer değiştir, düzenleme verisi) input'a yansır.
  if (syncedAddress !== value?.address) {
    setSyncedAddress(value?.address);
    setInput(value?.address ?? '');
  }

  const searchable = query.length >= 3 && query !== value?.address;
  const options = searchable && results?.query === query ? results.options : [];
  const loading = searchable && results?.query !== query;

  useEffect(() => {
    if (!searchable) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    searchAddress(query, near ?? null, controller.signal)
      .then((found) => setResults({ query, options: found }))
      .catch((e: unknown) => {
        if ((e as Error).name !== 'AbortError') setResults({ query, options: [] });
      });
    return () => controller.abort();
    // `near` her render'da yeni nesne olabilir, sadece sorgu değişince ara.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, searchable]);

  const locateMe = async () => {
    setLocating(true);
    try {
      const position = await getCurrentPosition();
      const result = await reverseGeocode(position);
      if (result) onChange(result.selected);
      else enqueueSnackbar(t('address.locationFailed'), { variant: 'warning' });
    } catch (e) {
      const denied = (e as GeolocationPositionError).code === 1;
      enqueueSnackbar(t(denied ? 'address.locationDenied' : 'address.locationFailed'), { variant: 'warning' });
    } finally {
      setLocating(false);
    }
  };

  const typedWithoutSelection = !value && input.trim().length > 0;

  return (
    <>
      <Autocomplete
        value={value ? asOption(value) : null}
        inputValue={input}
        onInputChange={(_, v, reason) => {
          if (reason !== 'reset') setInput(v);
        }}
        onChange={(_, option) => onChange(option?.selected ?? null)}
        options={options}
        filterOptions={(o) => o}
        getOptionLabel={(o) => o.selected.address}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        loading={loading}
        disabled={disabled}
        forcePopupIcon={false}
        noOptionsText={input.trim().length < 3 ? t('address.typeMore') : t('address.noResults')}
        loadingText={t('common:loading')}
        renderOption={({ key, ...props }, o) => (
          <Box component="li" key={key} {...props} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <PlaceRounded sx={{ color: 'primary.main', mt: 0.25 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                {o.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap component="p">
                {o.subtitle}
              </Typography>
            </Box>
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={t('address.search')}
            error={!!error}
            helperText={error ?? (typedWithoutSelection ? t('address.notSelected') : undefined)}
            slotProps={{
              ...params.slotProps,
              input: {
                ...params.slotProps.input,
                startAdornment: (
                  <InputAdornment position="start">
                    <PlaceRounded sx={{ color: value ? 'primary.main' : 'text.disabled' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end" sx={{ gap: 0.25 }}>
                    {loading && <CircularProgress size={18} sx={{ mr: 0.5 }} />}
                    <Tooltip title={t('address.myLocation')}>
                      <span>
                        <IconButton
                          aria-label={t('address.myLocation')}
                          onClick={() => void locateMe()}
                          disabled={disabled || locating}
                          size="small"
                        >
                          {locating ? <CircularProgress size={18} /> : <MyLocationRounded fontSize="small" />}
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={t('address.pickOnMap')}>
                      <span>
                        <IconButton
                          aria-label={t('address.pickOnMap')}
                          onClick={() => setMapOpen(true)}
                          disabled={disabled}
                          size="small"
                        >
                          <MapRounded fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    {value && (
                      <Tooltip title={t('address.clear')}>
                        <IconButton
                          aria-label={t('address.clear')}
                          onClick={() => {
                            onChange(null);
                            setInput('');
                          }}
                          disabled={disabled}
                          size="small"
                        >
                          <CloseRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
      />
      {mapOpen && (
        <MapPickerDialog
          open
          title={label}
          initial={positionOf(value) ?? near ?? null}
          onClose={() => setMapOpen(false)}
          onSelect={(selected) => {
            onChange(selected);
            setMapOpen(false);
          }}
        />
      )}
    </>
  );
}
