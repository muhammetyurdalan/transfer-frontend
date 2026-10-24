import { env } from './env';

/** Backend dosya alanını (`profileImage`, `image`, `file`) görüntülenebilir URL'e çevirir. Boşsa `undefined`. */
export function mediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const base = env.MEDIA_URL.endsWith('/') ? env.MEDIA_URL : `${env.MEDIA_URL}/`;
  return base + path.replace(/^\/+/, '');
}

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|bmp|svg)(\?.*)?$/i;

export function isImagePath(path: string | null | undefined): boolean {
  return !!path && IMAGE_EXT.test(path);
}

export function fileName(path: string): string {
  return decodeURIComponent(path.split('?')[0].split('/').pop() ?? path);
}
