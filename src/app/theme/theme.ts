import { alpha, createTheme } from '@mui/material/styles';
import { enUS, trTR } from '@mui/material/locale';
import { enUS as pickersEnUS, trTR as pickersTrTR } from '@mui/x-date-pickers/locales';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import { darkPalette, lightPalette, shape, typography } from './tokens';

type InverseColor = {
  main: string;
  light: string;
  contrastText: string;
  accent: string;
  accentSoft: string;
};
type HighlightColor = { main: string; border: string; contrastText: string };

declare module '@mui/material/styles' {
  interface Palette {
    inverse: InverseColor;
    highlight: HighlightColor;
  }
  interface PaletteOptions {
    inverse?: InverseColor;
    highlight?: HighlightColor;
  }
}

/**
 * MUI teması. Renkler `tokens.ts`'ten gelir, burada sadece component varsayılanları tanımlanır.
 * `cssVariables` açık olduğu için override'larda `theme.vars.palette.*` kullanılır,
 * böylece light/dark geçişinde stiller yeniden hesaplanmaz.
 */
export function createAppTheme(language: string) {
  const locales = language === 'tr' ? [trTR, pickersTrTR] : [enUS, pickersEnUS];
  return createTheme(options, ...locales);
}

const options: Parameters<typeof createTheme>[0] = {
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: {
    light: { palette: lightPalette },
    dark: { palette: darkPalette },
  },
  shape: { borderRadius: shape.radius },
  typography: {
    fontFamily: typography.fontFamily,
    h1: { fontWeight: typography.headingWeight },
    h2: { fontWeight: typography.headingWeight },
    h3: { fontWeight: typography.headingWeight },
    h4: { fontWeight: typography.headingWeight, letterSpacing: '-0.01em' },
    h5: { fontWeight: typography.headingWeight },
    h6: { fontWeight: typography.headingWeight },
    button: { textTransform: 'none', fontWeight: typography.buttonWeight },
    overline: { fontWeight: 600, letterSpacing: '0.12em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
          overflowX: 'hidden',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: shape.radius, minHeight: 44 },
        sizeSmall: { minHeight: 32 },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { borderRadius: shape.radius } },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: { root: { borderRadius: shape.cardRadius } },
    },
    MuiPaper: {
      styleOverrides: { rounded: { borderRadius: shape.cardRadius } },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: shape.cardRadius } },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'inherit' },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.vars.palette.inverse.main,
          color: theme.vars.palette.inverse.contrastText,
          borderBottom: `2px solid ${theme.vars.palette.inverse.accent}`,
        }),
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500 } },
    },
    MuiTableHead: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiTableCell-head': {
            fontWeight: 600,
            color: theme.vars.palette.text.secondary,
            backgroundColor: theme.vars.palette.background.paper,
            borderBottom: `2px solid ${theme.vars.palette.primary.main}`,
          },
        }),
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.MuiTableRow-hover:hover': {
            backgroundColor: theme.vars.palette.highlight.main,
          },
        }),
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 3, borderRadius: 3 },
      },
    },
    MuiTab: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 48 } },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'none',
          '&.Mui-selected': {
            backgroundColor: theme.vars.palette.highlight.main,
            color: theme.vars.palette.text.primary,
            borderColor: theme.vars.palette.primary.main,
          },
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: shape.radius,
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.vars.palette.primary.main,
          },
        }),
      },
    },
    MuiTextField: {
      defaultProps: { fullWidth: true },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-active, &.Mui-completed': { color: theme.vars.palette.primary.main },
        }),
        text: ({ theme }) => ({ fill: theme.vars.palette.primary.contrastText }),
      },
    },
    MuiLink: {
      defaultProps: { underline: 'hover' },
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.vars.palette.primary.dark,
          fontWeight: 500,
          ...theme.applyStyles('dark', { color: theme.vars.palette.primary.main }),
        }),
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          backgroundColor: alpha(darkPalette.inverse.main, 0.95),
          color: theme.vars.palette.inverse.contrastText,
        }),
      },
    },
  },
};
