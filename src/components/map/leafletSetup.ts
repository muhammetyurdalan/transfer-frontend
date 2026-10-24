import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Vite'ta Leaflet'in varsayılan marker görsel yolları bozulur, bundler URL'leriyle düzeltilir.
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

/** Tema renginde (CSS değişkeni) yuvarlak pin. `label` ör. "A" / "B". */
export function pinIcon(label: string, variant: 'primary' | 'inverse' = 'primary') {
  const bg = variant === 'primary' ? 'var(--mui-palette-primary-main)' : 'var(--mui-palette-inverse-main)';
  const fg = variant === 'primary' ? 'var(--mui-palette-primary-contrastText)' : 'var(--mui-palette-inverse-accent)';
  const border = 'var(--mui-palette-primary-dark)';
  return L.divIcon({
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${bg};border:2px solid ${border};display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.35)"><span style="transform:rotate(45deg);color:${fg};font:700 13px Roboto,sans-serif">${label}</span></div>`,
  });
}
