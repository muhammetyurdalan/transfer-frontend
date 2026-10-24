import { Box, Paper, Tab, Tabs } from '@mui/material';
import { NotificationsRounded, PersonRounded, ReceiptLongRounded } from '@mui/icons-material';
import { Navigate, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { useIsCompact } from '@/hooks/useIsMobile';
import { NotificationsTab } from './NotificationsTab';
import { ProfileTab } from './ProfileTab';
import { StatementTab } from './StatementTab';

const TABS = [
  { value: 'profile', icon: <PersonRounded /> },
  { value: 'statement', icon: <ReceiptLongRounded /> },
  { value: 'notifications', icon: <NotificationsRounded /> },
] as const;
type TabValue = (typeof TABS)[number]['value'];

/** Settings (§8.12): masaüstünde solda dikey sekmeler, mobilde üstte kaydırılabilir sekmeler. */
export default function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const compact = useIsCompact();
  const { tab } = useParams();
  if (!TABS.some((x) => x.value === tab)) return <Navigate to="/settings/profile" replace />;
  const current = tab as TabValue;

  return (
    <>
      <PageHeader title={t('settings:title')} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '240px minmax(0, 1fr)' },
          gap: { xs: 2, md: 3 },
          alignItems: 'start',
        }}
      >
        <Paper variant="outlined" sx={{ overflow: 'hidden', position: { md: 'sticky' }, top: { md: 96 } }}>
          <Tabs
            value={current}
            onChange={(_, v: TabValue) => void navigate(`/settings/${v}`)}
            orientation={compact ? 'horizontal' : 'vertical'}
            variant={compact ? 'scrollable' : 'standard'}
            scrollButtons={false}
            sx={{
              '& .MuiTab-root': {
                justifyContent: { md: 'flex-start' },
                minHeight: 52,
                px: 2.5,
              },
              '& .MuiTab-root.Mui-selected': { bgcolor: 'highlight.main', color: 'text.primary' },
              '& .MuiTabs-indicator': { left: { md: 0 }, right: { md: 'auto' } },
            }}
          >
            {TABS.map((x) => (
              <Tab key={x.value} value={x.value} icon={x.icon} iconPosition="start" label={t(`settings:tabs.${x.value}`)} />
            ))}
          </Tabs>
        </Paper>
        <Box sx={{ minWidth: 0 }}>
          {current === 'profile' && <ProfileTab />}
          {current === 'statement' && <StatementTab />}
          {current === 'notifications' && <NotificationsTab />}
        </Box>
      </Box>
    </>
  );
}
