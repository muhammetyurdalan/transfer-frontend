import type { ReactNode } from 'react';

export type Column<T> = {
  key: string;
  /** i18n anahtarı (çevrilmiş metin de olabilir) */
  header: string;
  /** Sütun seçicide gösterilecek ad (verilmezse `header`) */
  columnLabel?: string;
  render: (row: T) => ReactNode;
  /** ordering alan adı (camelCase). Verilirse başlık sıralanabilir */
  sortField?: string;
  align?: 'left' | 'right' | 'center';
  /** Bu genişliğin altında gizlenir */
  hideBelow?: 'sm' | 'md' | 'lg';
  /** Kart görünümünde başlık satırı */
  mobilePrimary?: boolean;
  width?: number | string;
};

export type RowAction<T> = {
  label: string;
  icon: ReactNode;
  onClick: (row: T) => void;
  visible?: (row: T) => boolean;
  color?: 'error' | 'inherit';
  dividerBefore?: boolean;
};
