import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  Fab,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { CloseRounded, MyLocationRounded, PlaceRounded } from '@mui/icons-material';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/useIsMobile';
import { env } from '@/lib/env';
import { getCurrentPosition, reverseGeocode, type GeocodeResult, type LatLng, type SelectedAddress } from '@/lib/geo';

type Props = {
  open: boolean;
  title?: string;
  /** Başlangıç merkezi: mevcut seçim → kullanıcı konumu → env varsayılanı */
  initial: LatLng | null;
  onClose: () => void;
  onSelect: (address: SelectedAddress) => void;
};

function CenterTracker({ onMove }: { onMove: (center: LatLng) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const c = map.getCenter();
      onMove({ lat: c.lat, lng: c.lng });
    },
  });
  return null;
}

function MapRef({ onReady }: { onReady: (map: LeafletMap) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
    // Dialog animasyonu bitince boyut yeniden hesaplanır.
    const id = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(id);
  }, [map, onReady]);
  return null;
}

/** Ortada sabit pin, harita kaydırıldıkça merkez reverse geocode edilir (§6.6). */
export function MapPickerDialog({ open, title, initial, onClose, onSelect }: Props) {
  const { t } = useTranslation('booking');
  const mobile = useIsMobile();
  const { enqueueSnackbar } = useSnackbar();
  const mapRef = useRef<LeafletMap | null>(null);
  const [center, setCenter] = useState<LatLng>(
    initial ?? { lat: env.DEFAULT_MAP_CENTER[0], lng: env.DEFAULT_MAP_CENTER[1] },
  );
  const [resolved, setResolved] = useState<{ center: LatLng; result: GeocodeResult | null } | null>(null);
  const resolving = resolved?.center !== center;
  const result = resolving ? null : (resolved?.result ?? null);
  const [locating, setLocating] = useState(false);

  // Başlangıç seçimi yoksa kullanıcı konumuna git.
  useEffect(() => {
    if (initial) return;
    getCurrentPosition()
      .then((p) => mapRef.current?.setView([p.lat, p.lng], 16))
      .catch(() => undefined);
  }, [initial]);

  useEffect(() => {
    const controller = new AbortController();
    const id = setTimeout(() => {
      reverseGeocode(center, controller.signal)
        .then((r) => setResolved({ center, result: r }))
        .catch((e: unknown) => {
          if ((e as Error).name !== 'AbortError') setResolved({ center, result: null });
        });
    }, 400);
    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, [center]);

  const goToMyLocation = async () => {
    setLocating(true);
    try {
      const p = await getCurrentPosition();
      mapRef.current?.setView([p.lat, p.lng], 16);
    } catch (e) {
      const denied = (e as GeolocationPositionError).code === 1;
      enqueueSnackbar(t(denied ? 'address.locationDenied' : 'address.locationFailed'), { variant: 'warning' });
    } finally {
      setLocating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={mobile}
      fullWidth
      maxWidth="md"
      slotProps={{ paper: { sx: { overflow: 'hidden', display: 'flex', flexDirection: 'column' } } }}
    >
      <DialogTitle
        sx={{
          bgcolor: 'inverse.main',
          color: 'inverse.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          pt: mobile ? 'calc(16px + env(safe-area-inset-top))' : undefined,
        }}
      >
        <Box component="span" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title ?? t('map.title')}
        </Box>
        <IconButton aria-label={t('common:actions.close')} onClick={onClose} sx={{ color: 'inherit' }}>
          <CloseRounded />
        </IconButton>
      </DialogTitle>
      <Box
        sx={{
          position: 'relative',
          flexGrow: 1,
          height: mobile ? undefined : 460,
          minHeight: 300,
          '& .leaflet-container': { height: '100%', width: '100%' },
        }}
      >
        <MapContainer center={[center.lat, center.lng]} zoom={initial ? 16 : env.DEFAULT_MAP_ZOOM}>
          <TileLayer url={env.TILE_URL} attribution={env.TILE_ATTRIBUTION} />
          <CenterTracker onMove={setCenter} />
          <MapRef onReady={(m) => (mapRef.current = m)} />
        </MapContainer>
        {/* Sabit merkez pin (ucu tam merkezde) */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -100%)',
            zIndex: 1000,
            pointerEvents: 'none',
            color: 'primary.main',
            '& svg': { fontSize: 48, stroke: 'var(--mui-palette-inverse-main)', strokeWidth: 0.6 },
          }}
        >
          <PlaceRounded />
        </Box>
        <Tooltip title={t('map.myLocation')}>
          <Fab
            size="medium"
            color="secondary"
            aria-label={t('map.myLocation')}
            onClick={() => void goToMyLocation()}
            disabled={locating}
            sx={{ position: 'absolute', right: 16, bottom: 16, zIndex: 1000 }}
          >
            <MyLocationRounded />
          </Fab>
        </Tooltip>
      </Box>
      <Stack
        spacing={1.5}
        sx={{
          p: 2,
          pb: mobile ? 'calc(16px + env(safe-area-inset-bottom))' : 2,
          borderTop: 2,
          borderColor: 'primary.main',
        }}
      >
        <Box sx={{ minHeight: 44 }}>
          {resolving ? (
            <>
              <Skeleton variant="text" width="70%" />
              <Typography variant="caption" color="text.secondary">
                {t('map.resolving')}
              </Typography>
            </>
          ) : result ? (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {result.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {result.subtitle}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t('map.unresolved')}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
          <Button color="inherit" onClick={onClose}>
            {t('common:actions.cancel')}
          </Button>
          <Button
            variant="contained"
            disabled={resolving || !result}
            onClick={() => result && onSelect(result.selected)}
          >
            {t('map.confirm')}
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
}
