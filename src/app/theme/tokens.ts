/**
 * Tema tokenları: uygulamanın TEK renk/tipografi/şekil kaynağı.
 *
 * Rengi değiştirmek için sadece bu dosyayı düzenle. Component'ler sabit renk (hex) kullanmaz,
 * `theme.palette.*` / sx'te `'primary.main'`, `'inverse.main'` gibi anahtarlarla okur.
 */

/** Ham renk skalaları. Paletler aşağıda bunlardan türetilir. */
export const scales = {
  /** Altın sarısı (marka rengi) */
  gold: {
    50: '#FDF9EC',
    100: '#F9EFCC',
    200: '#F2DE96',
    300: '#E8C960',
    400: '#D4AF37',
    500: '#B8901F',
    600: '#9A7615',
    700: '#7A5C10',
    800: '#5A430B',
    900: '#3B2C07',
  },
  /** Koyu siyah ve sıcak griler */
  ink: {
    50: '#F7F5F0',
    100: '#EEEBE4',
    200: '#DEDAD1',
    300: '#BDB8AD',
    400: '#8E8A82',
    500: '#5F5C57',
    600: '#3D3B38',
    700: '#26252A',
    800: '#16161A',
    900: '#0B0B0C',
  },
  white: '#FFFFFF',
  /** Açık temanın zemin rengi (fildişi) */
  ivory: '#FAF8F3',
} as const;

const { gold, ink } = scales;

/** Açık tema (varsayılan): açık zemin, altın vurgular, koyu siyah yüzeyler (header, drawer). */
export const lightPalette = {
  primary: { main: gold[500], light: gold[300], dark: gold[700], contrastText: ink[900] },
  secondary: { main: ink[900], light: ink[700], dark: '#000000', contrastText: gold[400] },
  background: { default: scales.ivory, paper: scales.white },
  text: { primary: ink[900], secondary: ink[500], disabled: ink[400] },
  divider: 'rgba(11, 11, 12, 0.10)',
  success: { main: '#2E7D4F' },
  warning: { main: '#C77700' },
  error: { main: '#C62828' },
  info: { main: '#2F6DB5' },
  /** Koyu yüzeyler: header, nav drawer, auth hero paneli, öne çıkan kartlar */
  inverse: {
    main: ink[900],
    light: ink[700],
    contrastText: '#F5F2EA',
    accent: gold[400],
    /** Koyu yüzeyde seçili/aktif öğe zemini */
    accentSoft: 'rgba(212, 175, 55, 0.14)',
  },
  /** Hafif altın tonlu yüzey: seçili kart, vurgulu satır, kendi mesaj balonu */
  highlight: { main: gold[50], border: gold[200], contrastText: ink[900] },
} as const;

/** Koyu tema: koyu siyah zemin, daha parlak altın. */
export const darkPalette = {
  primary: { main: gold[400], light: gold[300], dark: gold[600], contrastText: ink[900] },
  secondary: { main: ink[100], light: scales.white, dark: ink[300], contrastText: ink[900] },
  background: { default: ink[900], paper: ink[800] },
  text: { primary: '#F2EFE8', secondary: ink[300], disabled: ink[500] },
  divider: 'rgba(255, 255, 255, 0.10)',
  success: { main: '#5FBF86' },
  warning: { main: '#F0A33A' },
  error: { main: '#EF6B6B' },
  info: { main: '#6FA8E8' },
  inverse: {
    main: '#050506',
    light: ink[800],
    contrastText: '#F5F2EA',
    accent: gold[400],
    accentSoft: 'rgba(212, 175, 55, 0.14)',
  },
  highlight: { main: 'rgba(212, 175, 55, 0.12)', border: 'rgba(212, 175, 55, 0.35)', contrastText: '#F2EFE8' },
} as const;

export const typography = {
  fontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif',
  headingWeight: 700,
  buttonWeight: 600,
} as const;

export const shape = {
  /** Genel köşe yarıçapı (input, buton, menü) */
  radius: 12,
  /** Kart ve dialog köşe yarıçapı */
  cardRadius: 16,
} as const;

/** Tarayıcı çubuğu (`<meta name="theme-color">`) için header rengi */
export const metaThemeColor = ink[900];
