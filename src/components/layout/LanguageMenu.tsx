import { useState } from 'react';
import { IconButton, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import { TranslateRounded } from '@mui/icons-material';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { UpdateUserDocument } from '@/graphql/generated/graphql';
import { LANGUAGES, toBackendLanguage, type AppLanguage } from '@/i18n';
import { useAuth } from '@/app/providers/AuthProvider';

/** Dil seçimi (§6.5). Giriş yapmışsa backend dili de güncellenir. */
export function LanguageMenu() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const client = useApolloClient();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [updateUser] = useMutation(UpdateUserDocument);

  const change = async (lng: AppLanguage) => {
    setAnchor(null);
    if (lng === i18n.language) return;
    await i18n.changeLanguage(lng);
    if (isAuthenticated) {
      await updateUser({ variables: { data: { language: toBackendLanguage(lng) } } });
    }
    void client.refetchQueries({ include: ['VehicleOptions', 'VehicleCategories'] });
  };

  return (
    <>
      <Tooltip title={t('nav.language')}>
        <IconButton
          color="inherit"
          aria-label={t('nav.language')}
          onClick={(e) => setAnchor(e.currentTarget)}
        >
          <TranslateRounded fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        {LANGUAGES.map((lng) => (
          <MenuItem key={lng} selected={i18n.language === lng} onClick={() => void change(lng)}>
            <ListItemText>{t(`languages.${lng}`)}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
