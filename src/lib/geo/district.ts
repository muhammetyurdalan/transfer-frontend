import type { PhotonProperties } from './types';

/**
 * Photon sonucundan backend `District.name` ile eşleşecek ilçe adını seçer.
 * Türkiye için öncelik: county → city → district. Seed verisiyle doğrulanmalı (§11).
 */
export function districtNameFrom(p: PhotonProperties): string {
  return (p.county || p.city || p.district || p.locality || '').trim();
}
