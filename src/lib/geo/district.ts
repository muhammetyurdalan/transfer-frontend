import type { PhotonProperties } from './types';

/**
 * Photon sonucundan backend `District.name` ile eşleşecek ilçe adını seçer.
 * Türkiye için öncelik: county → city → district. Seed verisiyle doğrulanmalı (§11).
 * İlçenin kendisi seçildiğinde (`type: city`, ör. "Kemer", "Alanya") `county`/`city` boş gelir,
 * ilçe adı `name`'dedir.
 */
export function districtNameFrom(p: PhotonProperties): string {
  const self = p.type === 'city' || p.type === 'county' ? p.name : undefined;
  return (p.county || p.city || self || p.district || p.locality || '').trim();
}
