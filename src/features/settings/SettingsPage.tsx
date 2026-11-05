import { lazy, Suspense, useState, type ReactElement, type ReactNode } from 'react';
import {
  Box,
  Collapse,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Tab,
  Tabs,
} from '@mui/material';
import {
  BadgeRounded,
  CategoryRounded,
  DirectionsCarRounded,
  ExpandLessRounded,
  ExpandMoreRounded,
  GroupRounded,
  HeadsetMicRounded,
  HubRounded,
  MapRounded,
  NotificationsRounded,
  PersonRounded,
  ReceiptLongRounded,
} from '@mui/icons-material';
import { Navigate, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { Role } from '@/graphql/generated/graphql';
import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/app/providers/AuthProvider';
import { useIsCompact } from '@/hooks/useIsMobile';
import { NotificationsTab } from './NotificationsTab';
import { ProfileTab } from './ProfileTab';
import { StatementTab } from './StatementTab';
import { StatesTab } from './states/StatesTab';

const VehiclesPage = lazy(() => import('@/features/vehicles/VehiclesPage'));
const VehicleCategoriesPage = lazy(() => import('@/features/vehicles/VehicleCategoriesPage'));
const RoleUsersPage = lazy(() =>
  import('@/features/network/RoleUsersPage').then((m) => ({ default: m.RoleUsersPage })),
);

const OPERATIONS: Role[] = ['OPERATOR', 'ADMIN', 'STAFF'];
const STAFF: Role[] = ['ADMIN', 'STAFF'];

/** Tıklanınca navigate eden sekme. `roles` verilmişse sadece o rollere görünür. */
type Leaf = { value: string; icon: ReactElement; roles?: Role[]; render: () => ReactNode };
/** Alt sekmeli sekme: tıklanınca sadece alt sekmeleri açar, navigate etmez. */
type Group = { value: string; icon: ReactElement; children: Leaf[] };
type Item = Leaf | Group;

const isGroup = (x: Item): x is Group => 'children' in x;

const ITEMS: Item[] = [
  { value: 'profile', icon: <PersonRounded />, render: () => <ProfileTab /> },
  { value: 'statement', icon: <ReceiptLongRounded />, render: () => <StatementTab /> },
  { value: 'notifications', icon: <NotificationsRounded />, render: () => <NotificationsTab /> },
  { value: 'states', icon: <MapRounded />, roles: OPERATIONS, render: () => <StatesTab /> },
  {
    value: 'vehicles',
    icon: <DirectionsCarRounded />,
    children: [
      { value: 'list', icon: <DirectionsCarRounded />, roles: OPERATIONS, render: () => <VehiclesPage /> },
      { value: 'categories', icon: <CategoryRounded />, roles: STAFF, render: () => <VehicleCategoriesPage /> },
    ],
  },
  {
    value: 'network',
    icon: <HubRounded />,
    children: [
      { value: 'customers', icon: <GroupRounded />, roles: OPERATIONS, render: () => <RoleUsersPage key="c" role="CUSTOMER" /> },
      { value: 'drivers', icon: <BadgeRounded />, roles: OPERATIONS, render: () => <RoleUsersPage key="d" role="DRIVER" /> },
      { value: 'operators', icon: <HeadsetMicRounded />, roles: STAFF, render: () => <RoleUsersPage key="o" role="OPERATOR" /> },
    ],
  },
];

/** Alt sekme etiketi: `vehicles/list` → `tabs.vehicleList`, diğerleri kendi adıyla */
const leafLabel = (group: string | null, leaf: string) =>
  `settings:tabs.${group === 'vehicles' && leaf === 'list' ? 'vehicleList' : leaf}`;
const pathOf = (group: string | null, leaf: string) => `/settings/${group ? `${group}/${leaf}` : leaf}`;

/**
 * Settings (§8.12): masaüstünde solda dikey menü, mobilde üstte kaydırılabilir sekmeler.
 * Alt sekmeli sekmeler (Vehicles, Network) tıklanınca alt sekmelerini açar; alt sekmeye tıklanınca gidilir.
 */
export default function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const compact = useIsCompact();
  const { tab, sub } = useParams();
  const { hasRole } = useAuth();

  const allowed = (x: Leaf) => !x.roles || hasRole(...x.roles);
  const items = ITEMS.flatMap<Item>((x) => {
    if (!isGroup(x)) return allowed(x) ? [x] : [];
    const children = x.children.filter(allowed);
    return children.length ? [{ ...x, children }] : [];
  });

  const currentItem = items.find((x) => x.value === tab);
  const currentGroup = currentItem && isGroup(currentItem) ? currentItem : null;
  const currentLeaf = currentGroup
    ? currentGroup.children.find((c) => c.value === sub)
    : currentItem && !sub
      ? (currentItem as Leaf)
      : undefined;
  const [expanded, setExpanded] = useState<string | null>(currentGroup?.value ?? null);
  // Adres başka bir gruba geçince (ör. sürücüden "Araçlarını gör") o grup açılır
  const [lastGroup, setLastGroup] = useState(currentGroup?.value ?? null);
  if ((currentGroup?.value ?? null) !== lastGroup) {
    setLastGroup(currentGroup?.value ?? null);
    if (currentGroup) setExpanded(currentGroup.value);
  }

  if (!currentLeaf) {
    // Grup adresi (ör. /settings/vehicles) ilk izinli alt sekmeye, geçersiz adres profile gider
    const fallback = currentGroup ? pathOf(currentGroup.value, currentGroup.children[0].value) : '/settings/profile';
    return <Navigate to={fallback} replace />;
  }

  const go = (group: string | null, leaf: string) => void navigate(pathOf(group, leaf));
  const isCurrent = (group: string | null, leaf: string) =>
    (currentGroup?.value ?? null) === group && currentLeaf.value === leaf;

  const desktopMenu = (
    <List disablePadding>
      {items.map((x) =>
        isGroup(x) ? (
          <Box key={x.value}>
            <ListItemButton
              onClick={() => setExpanded((v) => (v === x.value ? null : x.value))}
              aria-expanded={expanded === x.value}
              sx={{ minHeight: 52, px: 2.5 }}
            >
              <ListItemIcon>{x.icon}</ListItemIcon>
              <ListItemText primary={t(`settings:tabs.${x.value}`)} />
              {expanded === x.value ? <ExpandLessRounded /> : <ExpandMoreRounded />}
            </ListItemButton>
            <Collapse in={expanded === x.value} unmountOnExit>
              <List disablePadding>
                {x.children.map((c) => (
                  <ListItemButton
                    key={c.value}
                    selected={isCurrent(x.value, c.value)}
                    onClick={() => go(x.value, c.value)}
                    sx={{ minHeight: 44, pl: 5 }}
                  >
                    <ListItemIcon>{c.icon}</ListItemIcon>
                    <ListItemText primary={t(leafLabel(x.value, c.value))} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </Box>
        ) : (
          <ListItemButton
            key={x.value}
            selected={isCurrent(null, x.value)}
            onClick={() => {
              setExpanded(null);
              go(null, x.value);
            }}
            sx={{ minHeight: 52, px: 2.5 }}
          >
            <ListItemIcon>{x.icon}</ListItemIcon>
            <ListItemText primary={t(`settings:tabs.${x.value}`)} />
          </ListItemButton>
        ),
      )}
    </List>
  );

  // Mobil: üst satır ana sekmeler; açık grup varsa altında alt sekmeler satırı
  const openGroup = items.find((x): x is Group => isGroup(x) && x.value === expanded);
  const mobileMenu = (
    <>
      <Tabs
        value={openGroup?.value ?? currentGroup?.value ?? currentLeaf.value}
        onChange={(_, v: string) => {
          const item = items.find((x) => x.value === v);
          if (!item) return;
          if (isGroup(item)) {
            setExpanded(v);
          } else {
            setExpanded(null);
            go(null, v);
          }
        }}
        variant="scrollable"
        scrollButtons={false}
      >
        {items.map((x) => (
          <Tab key={x.value} value={x.value} icon={x.icon} iconPosition="start" label={t(`settings:tabs.${x.value}`)} />
        ))}
      </Tabs>
      {openGroup && (
        <Tabs
          value={currentGroup?.value === openGroup.value ? currentLeaf.value : false}
          onChange={(_, v: string) => go(openGroup.value, v)}
          variant="scrollable"
          scrollButtons={false}
          sx={{ borderTop: 1, borderColor: 'divider', minHeight: 44 }}
        >
          {openGroup.children.map((c) => (
            <Tab
              key={c.value}
              value={c.value}
              icon={c.icon}
              iconPosition="start"
              label={t(leafLabel(openGroup.value, c.value))}
              sx={{ minHeight: 44 }}
            />
          ))}
        </Tabs>
      )}
    </>
  );

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
        <Paper
          variant="outlined"
          sx={{
            overflow: 'hidden',
            position: { md: 'sticky' },
            top: { md: 96 },
            '& .MuiTab-root': { minHeight: 52, px: 2.5 },
            '& .MuiTab-root.Mui-selected, & .MuiListItemButton-root.Mui-selected': {
              bgcolor: 'highlight.main',
              color: 'text.primary',
            },
            '& .MuiListItemButton-root.Mui-selected': { boxShadow: (th) => `inset 3px 0 0 ${th.vars?.palette.primary.main}` },
            '& .MuiListItemIcon-root': { minWidth: 36, color: 'inherit' },
          }}
        >
          {compact ? mobileMenu : desktopMenu}
        </Paper>
        <Box sx={{ minWidth: 0 }}>
          <Suspense fallback={<LinearProgress />}>{currentLeaf.render()}</Suspense>
        </Box>
      </Box>
    </>
  );
}
