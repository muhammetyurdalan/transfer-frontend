import { StrictMode, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, IconButton, ThemeProvider } from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ApolloProvider } from '@apollo/client/react';
import { RouterProvider } from 'react-router/dom';
import { closeSnackbar, SnackbarProvider } from 'notistack';
import { useTranslation } from 'react-i18next';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import 'leaflet/dist/leaflet.css';
import '@/components/map/leafletSetup';
import '@/i18n';
import { client } from '@/lib/apollo';
import { createAppTheme } from '@/app/theme';
import { router } from '@/app/router';

/** Toast'lar 2 sn ekranda kalır, her birinde kapatma butonu vardır */
const TOAST_DURATION_MS = 2000;

function App() {
  const { t, i18n } = useTranslation();
  const theme = useMemo(() => createAppTheme(i18n.language), [i18n.language]);
  return (
    <ThemeProvider theme={theme} defaultMode="light">
      <CssBaseline enableColorScheme />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={i18n.language}>
        <SnackbarProvider
          maxSnack={3}
          autoHideDuration={TOAST_DURATION_MS}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          action={(key) => (
            <IconButton size="small" color="inherit" aria-label={t('actions.close')} onClick={() => closeSnackbar(key)}>
              <CloseRounded fontSize="small" />
            </IconButton>
          )}
        >
          <ApolloProvider client={client}>
            <RouterProvider router={router} />
          </ApolloProvider>
        </SnackbarProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
