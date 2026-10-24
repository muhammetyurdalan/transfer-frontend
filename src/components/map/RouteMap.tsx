import { useEffect } from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { env } from '@/lib/env';
import type { LatLng } from '@/lib/geo';
import { pinIcon } from './leafletSetup';

type Props = {
  from?: LatLng | null;
  to?: LatLng | null;
  /** [lat, lng][] (decodePolyline çıktısı) */
  path?: [number, number][];
  height?: number | string;
  sx?: SxProps<Theme>;
};

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = JSON.stringify(points);
  useEffect(() => {
    if (points.length === 1) map.setView(points[0], 14);
    else if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [32, 32] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

/** Alış (A) / bırakış (B) pin'leri ve rota çizgisi olan salt-okunur harita. */
export function RouteMap({ from, to, path, height = 280, sx }: Props) {
  const points: [number, number][] = [
    ...(path && path.length > 1 ? path : []),
    ...(from ? [[from.lat, from.lng] as [number, number]] : []),
    ...(to ? [[to.lat, to.lng] as [number, number]] : []),
  ];
  return (
    <Box
      sx={[
        { height, borderRadius: 4, overflow: 'hidden', border: 1, borderColor: 'divider', '& .leaflet-container': { height: '100%', width: '100%' },
          // SVG attribute'ları CSS değişkenini çözmez, rota rengi class ile verilir.
          '& .route-line': { stroke: 'var(--mui-palette-primary-main)' },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <MapContainer center={env.DEFAULT_MAP_CENTER} zoom={env.DEFAULT_MAP_ZOOM} scrollWheelZoom={false}>
        <TileLayer url={env.TILE_URL} attribution={env.TILE_ATTRIBUTION} />
        {from && <Marker position={[from.lat, from.lng]} icon={pinIcon('A')} />}
        {to && <Marker position={[to.lat, to.lng]} icon={pinIcon('B', 'inverse')} />}
        {path && path.length > 1 && (
          <Polyline positions={path} pathOptions={{ className: 'route-line', weight: 5, opacity: 0.9 }} />
        )}
        <FitBounds points={points} />
      </MapContainer>
    </Box>
  );
}
