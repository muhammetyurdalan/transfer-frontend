import { StrictMode, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ApolloProvider } from '@apollo/client/react';
import { RouterProvider } from 'react-router/dom';
import { SnackbarProvider } from 'notistack';
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

function App() {
  const { i18n } = useTranslation();
  const theme = useMemo(() => createAppTheme(i18n.language), [i18n.language]);
  return (
    <ThemeProvider theme={theme} defaultMode="light">
      <CssBaseline enableColorScheme />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={i18n.language}>
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
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
