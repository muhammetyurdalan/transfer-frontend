# transfer-frontend: React Frontend Rehberi

`transfer-backend` (Django + Strawberry GraphQL) için React frontend'inin sayfa, component ve GraphQL kullanım rehberi. Backend'in tek kaynağı GraphQL şemasıdır (`/graphql/`). Bu dokümandaki input'lar ve kurallar backend koduyla birebir eşleşir, backend değişirse burası da güncellenmelidir.

**İçindekiler**
1. Teknoloji yığını ve paketler
2. Proje kurulumu (yarn, env)
3. Klasör yapısı
4. Backend ile iletişim (Apollo, auth, upload, subscription, hata kodları)
5. Tasarım sistemi (Material, tema, responsive)
6. Ortak componentler (Header, DataTable, AddressField, MapPicker…)
7. Sayfalar ve route'lar
8. Sayfa sayfa query/mutation kullanımı
9. WebSocket olayları
10. Hata kodları
11. Açık konular

**Gösterim:** Input tablolarında **R** = required (zorunlu, şemada `!`), **O** = optional (gönderilmeyebilir). GraphQL'de alan adları camelCase'dir.

---

## 1. Teknoloji yığını ve paketler

Sürümler npm registry'den kontrol edildi (2026-10-24) ve peer dependency'leri birbiriyle uyumludur.

| Paket | Sürüm | Not |
|---|---|---|
| `react`, `react-dom` | `^19.3.1` | |
| `vite` | `^8.3.5` | Node `^20.19` veya `>=22.12` ister |
| `@vitejs/plugin-react` | `^6.1.2` | `vite ^8` ister |
| `typescript` | `~6.0.3` | **7.x kullanma**, `typescript-eslint` henüz `<6.1` destekliyor |
| `@mui/material`, `@mui/icons-material` | `^9.5.0` | Material Design component'leri |
| `@mui/system` | `^9.5.0` | `@mui/x-date-pickers` peer'ı |
| `@emotion/react` / `@emotion/styled` | `^11.14.0` / `^11.14.1` | MUI stil motoru |
| `@mui/x-date-pickers` | `^9.16.0` | Tarih/saat seçici (`dayjs` adapter) |
| `@fontsource/roboto` | `^5.3.0` | Roboto (300/400/500/700) |
| `@apollo/client` | `^4.3.5` | `rxjs ^7.3` peer'ı gerekir |
| `rxjs` | `^7.8.2` | Apollo 4 peer'ı |
| `graphql` | `^17.0.2` | |
| `graphql-ws` | `^6.4.1` | Subscription |
| `apollo-upload-client` | `^20.0.0` | Dosya yükleme (multipart), `@apollo/client ^4` ister |
| `react-router` | `^8.5.0` | |
| `react-hook-form` | `^7.90.0` | Form yönetimi |
| `zod` / `@hookform/resolvers` | `^4.6.7` / `^6.0.0` | Form validasyonu |
| `i18next` / `react-i18next` | `^26.5.6` / `^17.1.3` | EN / TR |
| `dayjs` | `^1.11.23` | `utc`, `timezone`, `relativeTime` plugin'leri |
| `leaflet` / `react-leaflet` | `^1.9.4` / `^5.0.0` | Harita (react-leaflet 5, React 19 ister) |
| `notistack` | `^3.0.2` | Snackbar bildirimleri |

Geliştirme bağımlılıkları:

| Paket | Sürüm |
|---|---|
| `@types/react`, `@types/react-dom` | `^19.3.0` |
| `@types/leaflet` | `^1.9.22` |
| `@types/node` | `^26.6.5` (vite.config / codegen) |
| `@graphql-codegen/cli` / `@graphql-codegen/client-preset` | `^7.4.6` / `^6.2.3` |
| `eslint` / `@eslint/js` | `^10.13.0` / `^10.0.1` |
| `typescript-eslint` | `^8.72.0` |
| `eslint-plugin-react-hooks` / `eslint-plugin-react-refresh` | `^7.1.1` / `^0.5.7` |
| `globals` | `^17.13.0` |
| `prettier` | `^3.9.10` |

**Kurallar**
- Paket eklerken en güncel kararlı sürümü al ve `yarn info <paket> peerDependencies` ile uyumluluğu kontrol et.
- Yarn 4.18, 1 günden yeni sürümleri karantinaya alır (`npmMinimalAgeGate: 1440`, `YN0016 ... quarantined`). Bu yüzden `react-hook-form`, `i18next`, `react-i18next` bir önceki sürümde sabitlendi. Karantina bitince güncellenebilir.
- Kilit dosyası (`yarn.lock`) commit edilir.

## 2. Proje kurulumu

### 2.1 Yarn
Yarn 4 (Berry) corepack ile kullanılır. Yerelde Yarn 1.x kurulu olsa bile corepack proje sürümünü kullanır.

```bash
corepack enable
yarn install                     # packageManager: yarn@4.18.1 (package.json)
cp .env.example .env.development
yarn dev
```

`.yarnrc.yml`:
```yaml
nodeLinker: node-modules
```

Proje Vite `react-ts` şablonunun yapısıyla elle kuruldu (`vite.config.ts`, `tsconfig.app.json` / `tsconfig.node.json`, `eslint.config.js`). `@` → `src/` alias'ı hem Vite'ta hem `tsconfig.app.json` `paths`'te tanımlıdır (`baseUrl` TS 6'da deprecated, kullanılmaz).

Sıfırdan paket kurulumu:
```bash
yarn add react react-dom @mui/material @mui/icons-material @mui/system @emotion/react @emotion/styled \
  @mui/x-date-pickers @fontsource/roboto @apollo/client rxjs graphql graphql-ws \
  apollo-upload-client react-router react-hook-form zod @hookform/resolvers \
  i18next react-i18next dayjs leaflet react-leaflet notistack
yarn add -D vite @vitejs/plugin-react typescript@~6.0.3 @types/react @types/react-dom @types/leaflet @types/node \
  @graphql-codegen/cli @graphql-codegen/client-preset eslint @eslint/js typescript-eslint \
  eslint-plugin-react-hooks eslint-plugin-react-refresh globals prettier
```

`package.json` script'leri:

| Script | Komut |
|---|---|
| `dev` | `vite` (mode: development, `.env.development`) |
| `build` | `tsc -b && vite build` (mode: production, `.env.production`) |
| `preview` | `vite preview` |
| `lint` | `eslint .` |
| `codegen` | `graphql-codegen` |

### 2.2 Ortam değişkenleri

Vite, `--mode`'a göre `.env.development` veya `.env.production` dosyasını yükler.
- `.env.example` commit edilir.
- `.env.development`, `.env.production` ve `.env.*.local` git'e girmez (`.gitignore`).
- Kodda adresler, anahtarlar ve URL'ler **asla sabit yazılmaz**, sadece `import.meta.env` üzerinden, tek bir `src/lib/env.ts` modülünden okunur.
- Bu modül eksik değişkende uygulama açılırken hata fırlatır.

> `VITE_` ile başlayan her değişken build'e gömülür ve tarayıcıda görünür. Buraya sadece public değerler (URL'ler, Firebase web config gibi istemci anahtarları) konur. Backend'in `SECRET_KEY`, `MS_ACCESS_TOKEN` gibi sırları **asla** frontend env'ine yazılmaz.

`.env.example`:
```dotenv
# Backend
VITE_API_URL=http://localhost:8000/graphql/
VITE_WS_URL=ws://localhost:8000/graphql
VITE_MEDIA_URL=http://localhost:8000/

# Harita ve konum servisleri (açık kaynak, prod'da self-host önerilir)
VITE_TILE_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
VITE_TILE_ATTRIBUTION=&copy; OpenStreetMap contributors
VITE_GEOCODER_URL=https://photon.komoot.io
VITE_ROUTING_URL=https://router.project-osrm.org
VITE_DEFAULT_MAP_CENTER=41.0082,28.9784
VITE_DEFAULT_MAP_ZOOM=11
VITE_GEOCODER_COUNTRY_CODES=tr

# Opsiyonel: web push (backend FCM). Boşsa push kapalıdır.
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_VAPID_KEY=
```

`.env.production` aynı anahtarları prod değerleriyle içerir. Prod'da `wss://` ve `https://` kullanılır.

**Backend tarafı:** frontend origin'i backend `.env`'inde `CORS_ALLOWED_ORIGINS` listesine eklenmelidir.

### 2.3 GraphQL codegen
Tipler elle yazılmaz, `@graphql-codegen/client-preset` ile üretilir.

`codegen.ts`:
```ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: process.env.SCHEMA_URL ?? 'http://localhost:8000/graphql/',
  documents: ['src/**/*.{ts,tsx,graphql}', '!src/graphql/generated/**'],
  generates: {
    'src/graphql/generated/': {
      preset: 'client',
      presetConfig: { fragmentMasking: false },
      config: {
        scalars: {
          Decimal: 'string',
          DateTime: 'string',
          Date: 'string',
          Time: 'string',
          JSON: 'Record<string, unknown>',
          Upload: 'File',
        },
        enumsAsTypes: true,
        useTypeImports: true,
      },
    },
  },
};
export default config;
```

- Operasyonlar `src/graphql/operations/*.graphql` dosyalarına yazılır, component'ler üretilen `XxxDocument` ve tipleri `@/graphql/generated/graphql`'den import eder.
- `fragmentMasking: false`: fragment alanları doğrudan erişilir (`useFragment` gerekmez). `useTypeImports`: `verbatimModuleSyntax` ile uyum için.
- Enum tipleri (`TransferStatus`, `Role`…) sadece bir operasyonda kullanılıyorsa üretilir.
- Backend çalışmıyorken şema dosyadan üretilir:
  ```bash
  cd ../transfer-backend && DJANGO_SETTINGS_MODULE=transfer.settings.test ./venv/bin/python manage.py export_schema core.schema:schema --path /tmp/schema.graphql
  cd ../transfer-frontend && SCHEMA_URL=/tmp/schema.graphql yarn codegen
  ```
- **Decimal:** backend'e her zaman **string** gönderilir (`'40.50'`), sayı olarak değil.
- **DateTime:** timezone'lu ISO string gönderilir (`dayjs().toISOString()`).

## 3. Klasör yapısı

```
index.html                 # viewport-fit=cover, tema flash'ını önleyen inline script (§5.2)
codegen.ts, vite.config.ts, eslint.config.js, tsconfig*.json
src/
  main.tsx                 # Providers: Theme (dile göre locale), LocalizationProvider, Snackbar (2 sn, kapatma butonlu, en fazla 3), Apollo, Router
  app/
    router.tsx             # Route tablosu (§7), lazy sayfalar, kök route'ta Auth + Subscription provider
    guards.tsx             # RequireAuth (rol), GuestOnly, HomeRedirect
    theme/
      tokens.ts            # TEK renk/tipografi/şekil kaynağı (§5.2)
      theme.ts             # createAppTheme(lang): MUI tema + component override'ları + palet tip augmentation
    providers/             # AuthProvider (useAuth, useCurrentUser), SubscriptionProvider (useAppEvent)
  lib/
    env.ts                 # import.meta.env okuma ve doğrulama
    apollo.ts              # ApolloClient (upload + auth + ws + error link), apolloEvents, resetWsClient
    errors.ts              # parseErrorCode, getErrorCode, errorKey
    storage.ts             # localStorage/sessionStorage anahtarları, tokenStore, pendingPaymentStore
    format.ts              # para, tarih, mesafe/süre, toCoord/toDecimal, initials
    media.ts               # mediaUrl, isImagePath, fileName
    phone.ts               # libphonenumber-js: tarayıcı ülkesi, ülke listesi, PhoneValue, phoneSchema, normalizePhone, formatPhone
    geo/                   # geocoder.ts (Photon), routing.ts (OSRM + decodePolyline), district.ts, location.ts, types.ts
  graphql/
    operations/            # auth, user, notifications, subscription, booking, transfers, messages, vehicles, users, transactions (.graphql)
    generated/             # codegen çıktısı (commit edilir)
  hooks/                   # useIsMobile / useIsCompact, useDebouncedValue
  types/                   # paket tip bildirimleri (apollo-upload-client)
  components/
    layout/                # AppLayout, AuthLayout, Header, NavDrawer, BrandLogo, LanguageMenu, ProfileMenu, ThemeModeMenu, navItems
    data-table/            # DataTable, RowActions, TableFilters, useTableState (URL durumu)
    address/               # AddressField, MapPickerDialog
    map/                   # RouteMap (A/B pin + rota), leafletSetup (ikon düzeltmesi, pinIcon)
    feedback/              # ConfirmDialog, EmptyState, ErrorState, LoadingSkeleton
    StatusChip.tsx (+TransactionChip), Money.tsx, UserAvatar.tsx, PageHeader.tsx, FileInput.tsx,
    StickyActionBar.tsx, PhoneField.tsx (ülke kodlu telefon input'u), themeModeOptions.tsx
  features/
    auth/                  # LoginPage, RegisterPage, ForgotPasswordPage, EmailVerification (ortak 1-2. adım)
    booking/               # TransferForm (oluştur + düzenle), StopsEditor (ara duraklar), LegsSection (salt okunur), VehicleOptionCard, TripSummaryCard, schema, useRoute
    transfers/             # List, Create, Edit, SelectVehicle, Detail, Dispatch, Jobs sayfaları, dialog'lar, transferPermissions
    messages/              # MessagesPage (/messages), MessagePanel, MessageBubble, MessageComposer, messageRules
    vehicles/              # VehiclesPage, VehicleDialog, VehicleCategoriesPage, VehicleCategoryDialog
    users/                 # UsersPage, UpdateRoleDialog, SendNotificationDialog
    settings/              # SettingsPage, ProfileTab (+AvatarPicker), StatementTab (+RefundDialog), NotificationsTab
    notifications/         # NotificationMenu (header zili)
    errors/                # NotFoundPage, ForbiddenPage, ErrorBoundaryPage, StatusPage (ortak düzen)
  i18n/
    index.ts               # i18next + dayjs kurulumu, dil yardımcıları
    locales/<en|tr>/<namespace>.json
```

**Komutlar:** `yarn dev`, `yarn build` (tsc + vite), `yarn lint`, `yarn codegen` (§2.3).

## 4. Backend ile iletişim

### 4.1 Apollo Client (`src/lib/apollo.ts`)
- **HTTP:** `apollo-upload-client`'ın `UploadHttpLink`'i (`import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs'`, `uri: env.API_URL`). Paket `.d.ts` içermediği için tip bildirimi `src/types/apollo-upload-client.d.ts`'tedir. Backend multipart upload'ı açık (`multipart_uploads_enabled=True`). `File` içeren input'lar otomatik multipart gönderilir.
- **Auth link:** token varsa header `authorization: <token>`. **`Bearer` öneki yok**, backend ham JWT bekler.
- **WebSocket:** `GraphQLWsLink(createClient({ url: env.WS_URL, connectionParams: () => ({ authorization: token }), lazy: true, retryAttempts: Infinity }))`.
  - Backend WebSocket'te kullanıcıyı `connectionParams.authorization`'dan okur.
  - Login/logout sonrası `resetWsClient()` client'ı `dispose()` edip yeniden oluşturur. Apollo link zinciri sabit kalır, WS isteği o anki link'e devredilir.
  - Yeniden bağlanınca (`on.connected`, ilk bağlantı hariç) açık query'ler tazelenir (§9).
- **split:** subscription'lar WS'e, diğer her şey HTTP'ye gider.
- **Error link:** her GraphQL hata mesajı JSON'dur (`{"code":"ERR013"}`), `JSON.parse` ile kod çıkarılır (§10).
  - `ERR002`, `ERR003`, `ERR010` → **token varsa** silinir, cache temizlenir, `/login`'e yönlendirilir. Token yokken (giriş formu) `ERR010` alan hatasıdır.
  - Diğer kodlar → `errors.ts` ile i18n metnine (`errors:ERR0xx`) çevrilip snackbar'da gösterilir.
  - JSON olmayan mesajlar (şema/validasyon hataları) için genel "Beklenmeyen hata" (`errors:unknown`), ağ hataları için `errors:network`.
  - **Hatayı form alanında kendisi gösteren** çağrılar `context: { skipErrorToast: true }` verir, global snackbar atlanır. Kod `getErrorCode(error)` ile alınır.
  - `apollo.ts` React'e bağımlı değildir. Logout/snackbar/reconnect tepkileri `apolloEvents` üzerinden `AuthProvider` tarafından bağlanır.
- **Apollo 4 tipleri:** `useQuery` `data`'yı (defer/streaming ihtimali yüzünden) kısmi tipler. Tam veri gerektiren yerde `dataState === 'complete'` ile daraltılır veya `?.` kullanılır.
- **Cache:** `InMemoryCache`. Varsayılan `watchQuery` `fetchPolicy: 'cache-and-network'`. Id'siz sayfalı sonuç tipleri (`*Paginated`, `VehicleOption`) `keyFields: false`. Mutation'lardan sonra ilgili sorgular `refetchQueries` ile tazelenir.

### 4.2 Oturum
- Token `localStorage`'da (`transfer.token`) tutulur. Tüm storage anahtarları ve güvenli erişim `src/lib/storage.ts`'tedir (`tokenStore`, `pendingPaymentStore`). JWT 14 gün geçerlidir, refresh token yoktur. `ERR003` gelince kullanıcı tekrar giriş yapar.
- Uygulama açılırken token varsa `user` query'si çalışır. Hata gelirse çıkış yapılır.
- `AuthProvider`, `user` (`CurrentUser` fragment'ı: id, role, language, firstName, lastName, name, email, phone, profileImage, createdAt) bilgisini context'te tutar. `useAuth()` → `{ user, initializing, isAuthenticated, hasRole(...roles), login(token, user), logout(reason?) }`, giriş zorunlu sayfalarda `useCurrentUser()`.
- `AuthProvider` ve `SubscriptionProvider` router'ın kök route'unda (`app/router.tsx` `Root`) bulunur, çünkü `useNavigate` kullanırlar.
- **Rol guard'ı:** route ve buton görünürlüğü role göre belirlenir (§7). Backend her zaman yetkiyi tekrar kontrol eder (`ERR001`).

### 4.3 Dosya URL'leri (`src/lib/media.ts`)
`profileImage`, `image`, `file` alanları string döner:
- S3 açıkken tam URL (`https://...`) gelir, olduğu gibi kullanılır.
- Değilse göreli yol gelir (`media/user/xxx.jpg`), başına `VITE_MEDIA_URL` eklenir.
- Boş string = dosya yok.

### 4.4 Sayfalama, filtre, sıralama
Listeleyen query'ler aynı imzayı kullanır:
```graphql
transfers(filters: TransferFilter, ordering: [TransferOrder!], pagination: OffsetPaginationInput): TransfersPaginated!
```

| Argüman | Kullanım |
|---|---|
| `pagination` | `{ offset: page * pageSize, limit: pageSize }`. `offset` R (varsayılan 0), `limit` O |
| `ordering` | `@oneOf`: her elemanda tek alan, örn. `[{ createdAt: DESC }]` |
| `filters` | Örn. `{ status: { inList: [PAID, ASSIGNED] } }`, `{ isSeen: false }`, `{ orderTime: { range: { start, end } } }` |
| Sonuç | `{ <liste>, count }`. `count` toplam kayıt sayısıdır, sayfalama için kullanılır |

### 4.5 Decimal, tarih, para gösterimi
- Para: `Intl.NumberFormat(locale, { style: 'currency', currency })`. `currency` alanı `USD | EUR | GBP | TRY`.
- Tarih: kullanıcının yerel saat diliminde gösterilir, backend'e ISO (UTC) gönderilir.
- Mesafe km, süre dakika gösterilir (`45 km · 1 sa 10 dk`).

## 5. Tasarım sistemi

### 5.1 Genel
- **Material Design 3 hissi:** MUI v9 + Roboto + Material Icons (`@mui/icons-material`, Rounded varyantı).
- Yumuşak köşeler (`shape.borderRadius: 12`, kartlarda ve dialog'larda 16) ve sade gölgeler (kartlar varsayılan `variant="outlined"`).
- Butonlar `textTransform: 'none'`, `fontWeight: 600`, `disableElevation`, en az 44px yükseklik.
- Boşluk birimi 8px. Sayfa içerikleri `Container maxWidth="lg"`.
- **Varsayılan tema açık (light).** Kullanıcı Açık / Koyu / Sistem arasında seçim yapar.
- **MUI v9'da system prop'lar kaldırıldı:** `Stack`/`Box`/`Typography` üzerinde `alignItems`, `justifyContent`, `flexWrap`, `fontWeight`, `textAlign`, `mt`… prop olarak yazılmaz, `sx` içine yazılır. `Grid` v2 kullanılır (`size={{ xs: 12, md: 6 }}`), `InputProps`/`PaperProps` yerine `slotProps`.

### 5.2 Tema: açık zemin, altın sarısı, şampanya vurgu yüzeyleri

**Görsel dil:** zemin açık (fildişi `#FAF8F3`, kartlar beyaz). Marka rengi **altın sarısı** (birincil butonlar, seçili öğeler, vurgu çizgileri, badge). Yazılar koyu siyah (`#0B0B0C`).

**Vurgu yüzeyleri (`inverse`)** açık temada **şampanya tonudur** (`#F4EEDF`, açık), koyu temada siyahtır: header (alt kenarda altın çizgi), nav drawer, giriş sayfalarının marka paneli, sabit alt aksiyon bar'ı, popover/dialog başlıkları, öne çıkan kartlar (fiyat, özet), tooltip'ler, rota haritasında B pini. Bu yüzeylerin rengi değişecekse sadece `inverse` token'ı değiştirilir.

**Tek kaynak: `src/app/theme/tokens.ts`.** Renk, font, köşe yarıçapı sadece bu dosyada değiştirilir.
- `scales.gold` (50–900) ve `scales.ink` (50–900, sıcak siyah/gri) ham skalalardır.
- `lightPalette` / `darkPalette` bu skalalardan türetilir ve MUI `colorSchemes`'e verilir.
- `theme.ts` sadece component varsayılanlarını (override) tanımlar, renkleri `theme.vars.palette.*` üzerinden okur.
- Component'lerde hex/rgba **yazılmaz**. `sx`'te palet anahtarı kullanılır: `'primary.main'`, `'inverse.main'`, `'highlight.border'`. Leaflet gibi MUI dışı yerlerde CSS değişkeni kullanılır: `var(--mui-palette-primary-main)` (SVG `stroke` attribute'u CSS değişkenini çözmediği için class + CSS ile verilir).

| Token | Light | Dark | Kullanım |
|---|---|---|---|
| `primary` | `#B8901F` (gold 500), yazı `#0B0B0C` | `#D4AF37` (gold 400) | Birincil buton (altın zemin, siyah yazı), aktif tab, seçili kart kenarı, link (`primary.dark`) |
| `secondary` | `#0B0B0C` (siyah), yazı altın | `#EEEBE4` | İkincil vurgulu buton (ör. 404 "Ana sayfa") |
| `background.default` | `#FAF8F3` (fildişi) | `#0B0B0C` | Sayfa zemini |
| `background.paper` | `#FFFFFF` | `#16161A` | Kart, tablo, dialog |
| `text.primary` / `secondary` | `#0B0B0C` / `#5F5C57` | `#F2EFE8` / `#BDB8AD` | |
| `inverse.main` / `light` / `contrastText` | `#F4EEDF` / `#E9E0C8` / `#0B0B0C` | `#050506` / `#16161A` / `#F5F2EA` | Vurgu yüzeyleri (header, drawer, auth paneli, StickyActionBar, öne çıkan kartlar, tooltip) |
| `inverse.accent` / `accentSoft` | `#9A7615` (gold 600) / altın %16 | `#D4AF37` / altın %14 | Vurgu yüzeyinde altın: header alt çizgisi, aktif nav linki, ikonlar, tutarlar |
| `highlight.main` / `border` | `#FDF9EC` / `#F2DE96` | altın %12 / %35 | Seçili kart, tablo satır hover'ı, boş durum ikonu, kendi mesaj kartı |
| `success` / `warning` / `error` / `info` | `#2E7D4F` / `#C77700` / `#C62828` / `#2F6DB5` | açık tonlar | Durum renkleri |

Özel palet anahtarları (`inverse`, `highlight`) `theme.ts`'te `Palette` tipine module augmentation ile eklenmiştir. Yeni anahtar eklenirse hem `tokens.ts` (iki palet) hem bu tip güncellenir.

**Tema seçimi (light / dark / system):**
- `createAppTheme(language)` → `createTheme({ cssVariables: { colorSchemeSelector: 'class' }, colorSchemes: { light, dark }, ... }, muiLocale, pickersLocale)`. Dil değişince tema MUI ve date picker locale'leriyle (`trTR`/`enUS`) yeniden oluşturulur (`main.tsx`).
- `ThemeProvider` kullanılır, `defaultMode="light"`.
- SPA'da `InitColorSchemeScript` component'i render edilemediği için `index.html`'de eşdeğer küçük bir inline script vardır: `localStorage['mui-mode']`'u okuyup `<html>`'e `light`/`dark` class'ını ilk boyamadan önce ekler (flash olmaz).
- `useColorScheme()` → `mode` değeri `'light' | 'dark' | 'system'` olur, `setMode` ile değişir. MUI tercihi `localStorage`'da saklar.
- **Seçici:** `ThemeModeMenu` (`components/layout/ThemeModeMenu.tsx`). İkon butonu o anki modun ikonunu gösterir (☀ / ☾ / 🖥), tıklanınca açılır menüde ☀ Açık, ☾ Koyu, 🖥 Sistem seçenekleri listelenir, seçili olan işaretlidir. Giriş yapılmışsa **header'da** (dil menüsünün solunda), giriş öncesi sayfalarda (AuthLayout) sağ üstte bulunur. Settings'te ayrı bir Görünüm kartı yoktur. Seçenekler `components/themeModeOptions.tsx`'tedir.

### 5.3 Responsive ve mobil (zorunlu kurallar)
- **Mobile-first:** stiller önce `xs` için yazılır, `sm/md/lg` ile genişletilir.
- Breakpoint'ler MUI varsayılanı: `sm 600`, `md 900`, `lg 1200`.
- **Yatay kaydırma yok:** sayfa hiçbir genişlikte yatay scroll üretmez. Uzun metinler `noWrap` + `Tooltip` veya satır kırma ile çözülür.
- **Dokunma hedefleri** en az 44×44px. `IconButton` mobilde `size="large"`.
- `useMediaQuery(theme.breakpoints.down('sm'))` ile mobilde:
  - Tüm `Dialog`'lar `fullScreen` açılır (harita seçici dahil).
  - `DataTable` kart görünümüne geçer (§6.2).
  - Header'daki menü linkleri hamburger `Drawer`'a taşınır.
  - Form aksiyonları ekranın altında sabit (`position: sticky; bottom: 0`) bir bar'da durur.
- iOS çentiği için `env(safe-area-inset-*)` padding'leri uygulanır. Viewport meta: `width=device-width, initial-scale=1, viewport-fit=cover`.
- Formlar mobilde tek sütun, `md` üzerinde iki sütundur (`Grid` v2, `size={{ xs: 12, md: 6 }}`).
- Test genişlikleri: 360, 390, 768, 1024, 1440px.

### 5.4 Durum renkleri (`StatusChip`)

| TransferStatus | Renk | İkon |
|---|---|---|
| `PENDING` | default | `HourglassEmpty` |
| `PAID` | info | `Payments` |
| `ASSIGNED` | primary | `AssignmentInd` |
| `STARTED` | warning | `DirectionsCar` |
| `COMPLETED` | success | `CheckCircle` |
| `CANCELLED` | error | `Cancel` |

| TransactionCategory | Renk |
|---|---|
| `PAYMENT` | primary |
| `TIP` | secondary |
| `REFUND` | warning (tutar eksi işaretli gösterilir) |

### 5.5 Diğer kurallar
- **Yükleniyor durumu:** `Skeleton` kullanılır, sayfa ortasında spinner kullanılmaz. Butonlar istek sırasında `loading` prop'uyla disabled olur.
- **Boş durum:** ikon + açıklama + (varsa) birincil aksiyon butonu (`EmptyState`).
- **Erişilebilirlik:** ikon butonlarında `aria-label`, formlarda `label`, renk dışında ikon/metinle de durum bildirme.
- **Çeviri:** tüm metinler i18n anahtarı ile yazılır. Sabit Türkçe/İngilizce metin kullanılmaz.
  - Çeviriler namespace başına ayrı dosyadadır: `src/i18n/locales/<en|tr>/<namespace>.json`. `import.meta.glob` ile otomatik yüklenir, yeni dosya eklemek yeterlidir.
  - Namespace'ler: `common` (varsayılan: aksiyonlar, nav, roller, durumlar, tablo), `errors` (ERR kodları), `auth`, `booking` (oluştur/düzenle/araç seçimi/adres), `transfers` (liste, detay, dispatch, işler), `messages`, `vehicles`, `users`, `settings`, `notifications`.
  - Kullanım: `useTranslation('auth')` → `t('login.title')`, başka namespace için `t('common:actions.save')`.
  - zod mesajları i18n anahtarıdır (`validation.required`), parametreliler `anahtar|değer` (`validation.max|100`).

## 6. Ortak componentler

### 6.1 Header (`components/layout/Header.tsx`)
`AppBar position="sticky"`, `elevation={0}`. Zemin `inverse.main` (açık temada şampanya, koyu temada siyah), alt kenarda 2px altın (`inverse.accent`) çizgi. Aktif nav linki altın yazı + `inverse.accentSoft` zemin. `< md`'de aynı stildeki `NavDrawer` açılır (nav linkleri + Ayarlar). Soldan sağa:

| Öğe | Davranış | Görünürlük |
|---|---|---|
| Hamburger | `NavDrawer`'ı açar | sadece `< md` |
| Logo | `/`'a gider | herkes |
| Nav linkleri | Role göre (§7). CUSTOMER'da ilk link **Create Transfer** (`/transfers/new`), diğer sekmelerle aynı stilde ve "Transferlerim"in solunda. `< md`'de drawer'da aynı sırayla | `>= md` |
| **Notification** (zil) | `Badge` + `NotificationMenu` (§6.4) | giriş yapmış herkes |
| **Theme** | İkon butonu + açılır `Menu`: Açık / Koyu / Sistem (§5.2) | herkes |
| **Language** | `Menu`: English / Türkçe (§6.5) | herkes |
| **Profile** | `Avatar` (profileImage veya baş harfler). Tıklanınca `Menu`: kullanıcı adı ve rolü (başlık), **Settings** (`/settings/profile`), **Logout** | giriş yapmış herkes |

**İkon boyutu:** header ikonları küçüktür: 20px ikon (`fontSize="small"`), varsayılan (medium) `IconButton`, avatar 28px. Sağdaki Notification, Theme, Language ve Profile aralıksız tek bir grup (`Stack`) olarak yan yana durur. Auth ekranlarındaki tema/dil butonları da aynı boyuttadır.

**Logout akışı:**
1. Web push kayıtlıysa `deleteFcmToken(registrationId)` çağrılır.
2. Token silinir, `client.clearStore()` çalışır, WS client kapatılır.
3. `/login`'e yönlendirilir.

### 6.2 DataTable (`components/data-table/DataTable.tsx`)
Projedeki **tüm** listeler bu component'le gösterilir.

**Props:**
```ts
type Column<T> = {
  key: string;
  header: string;                         // i18n anahtarı
  render: (row: T) => ReactNode;
  sortField?: string;                     // ordering alan adı (camelCase), varsa başlık sıralanabilir
  align?: 'left' | 'right' | 'center';
  hideBelow?: 'sm' | 'md' | 'lg';         // dar ekranda gizlenecek sütun
  mobilePrimary?: boolean;                // kart görünümünde başlık satırı
};
type RowAction<T> = {
  label: string; icon: ReactNode;
  onClick: (row: T) => void;
  visible?: (row: T) => boolean;          // rol/durum koşulu
  color?: 'error' | 'inherit';            // yıkıcı aksiyonlar error
  dividerBefore?: boolean;
};
type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  count: number;                          // backend count
  loading: boolean;
  page: number; pageSize: number;         // pageSize: 10 | 20 | 50
  onPageChange; onPageSizeChange;
  ordering?: { field: string; direction: 'ASC' | 'DESC' };
  onOrderingChange?;
  actions?: RowAction<T>[];
  onRowClick?: (row: T) => void;
  toolbar?: ReactNode;                    // filtreler, arama, toplu aksiyonlar
  emptyState?: ReactNode;
  selectable?: boolean; onSelectionChange?;
};
```

**Görünüm:**
- `>= sm`:
  - `Paper variant="outlined"` içinde MUI `Table`, `stickyHeader`.
  - Satırlar hover'da vurgulanır. Altında `TablePagination` var.
  - Son sütun **⋮ (`MoreVert`) aksiyon butonu**. Tıklanınca `Menu` açılır, sadece `visible(row) === true` olan aksiyonlar listelenir. Hiç görünür aksiyon yoksa buton gösterilmez.
  - Aksiyon butonuna tıklama `onRowClick`'i tetiklemez (`stopPropagation`).
- `< sm`:
  - Her satır bir `Card` olur: `mobilePrimary` sütun başlık, diğerleri `etiket: değer` satırları.
  - ⋮ butonu kartın sağ üstündedir. Sayfalama kartların altındadır.
- Yükleniyor: `pageSize` kadar `Skeleton` satırı/kartı. Boş: `emptyState`.
- **Sayfa durumu URL'de tutulur** (`?page=2&pageSize=20&ordering=-createdAt&status=PAID`), geri tuşu ve paylaşım çalışır. `useTableState(defaultOrdering?, prefix?)` bunu yönetir: `pagination`, `orderingInput`, `get/getAll/set` (filtre değişince sayfa sıfırlanır). Aynı sayfada birden fazla tablo `prefix` ile ayrışır (`waiting.page`, `assigned.page`). `orderingInput` genel tiplidir, sayfada ilgili `*Order[]` tipine cast edilir.
- Seçim (`selectable`) ait olduğu `rows` ile saklanır, sayfa/veri değişince sıfırlanır.
- Mobil kartlarda sol kenar altın şerittir. Başlık satırı alt kenarı `primary`, hover `highlight.main`.
- Sıralama → `ordering: [{ [field]: direction }]`, sayfa → `pagination: { offset, limit }`.

### 6.3 Genel component'ler
- `ConfirmDialog`: başlık, açıklama, onay butonu (yıkıcıysa `color="error"`), `loading`.
- `StatusChip`, `Money`, `UserAvatar`, `EmptyState`, `ErrorState` (tekrar dene butonlu), `PageHeader` (başlık + sağda aksiyonlar, mobilde alt alta).
- `FileInput`: `accept`, maksimum boyut kontrolü (istemci tarafında). Görsel için önizleme yapar, `currentUrl` ile mevcut görseli gösterir.
- `StickyActionBar`: form/sayfa aksiyonları için alta yapışan `inverse` bar (altın üst çizgi, safe-area padding).
- `RouteMap` (`components/map`): salt okunur harita, A (altın) / B (`inverse`) pin'leri ve OSRM rotası, sınırlara otomatik sığar.
- `ThemeModeMenu`: tema seçici açılır menü (§5.2).
- `PhoneField`: ülke kodu seçicili telefon input'u. Tüm telefon alanlarında kullanılır (kayıt, profil, yolcu telefonu).
  - Solda bayrak + `+90` butonu. Tıklanınca arama kutusu açılır. **En az 2 karakter** yazılınca ülke kodu (ISO `TR`, alan kodu `90` / `+90`) veya ülke adı eşleşen ülkeler kutunun altında kaydırılabilir bir liste olarak gösterilir. Açılır kutu `Popper` ile input'un altına sabitlenir, **yer değiştirmez** (flip yok): sonuç sayısı artınca yukarı kayıp üstteki alanların üzerine binmez. Liste yüksekliği açılışta altta kalan alana göre belirlenir (160–280px), fazla sonuç listenin içinde kaydırılır. Dışarı tıklanınca veya Esc ile kapanır. Sıra: ISO kodu tam eşleşen, adı aramayla başlayan, alan kodu eşleşen, adın içinde geçen. 2 karakterden önce "en az 2 karakter yazın" ipucu görünür. Ülke adları `Intl.DisplayNames` ile seçili dilde gösterilir.
  - Varsayılan ülke `DEFAULT_PHONE_COUNTRY` (`lib/phone.ts`): **tarayıcının ülkesi**. `navigator.languages` sırasıyla dil etiketinin bölgesi alınır (`tr-TR` → TR, `en-GB` → GB). Bölgesiz etiketlerde en olası bölge kullanılır (`Intl.Locale.maximize()`: `de` → DE, `en` → US). Çıkarılamazsa `TR`. Kayıtlı numara varsa ülke numaradan çıkarılır. `+` ile başlayan bir numara yazılır/yapıştırılırsa ülke otomatik seçilir.
  - Placeholder seçilen ülkenin örnek numarasıdır. Odaktan çıkınca numara ülkenin biçimine göre düzenlenir (`532 123 45 67`).
  - Form değeri `PhoneValue = { country, number }`'dır: seçili ülke + **E.164** numara (`+905321234567`). Backend'e sadece `number` gider, boşsa gönderilmez. Kayıtlı değerden `toPhoneValue(phone)`, boş değer `emptyPhone()` ile oluşturulur.
  - Doğrulama: `phoneSchema` (`isValidPhoneFor(number, country)`). `libphonenumber-js/max` metadata'sı ile **seçili ülkenin numara kurallarına** (uzunluk, alan/operatör kodu) göre yapılır. Numara başka bir ülkeye aitse geçerli olsa bile reddedilir (alan kodu paylaşılan ülkeler: +1 US/CA, +44 GB/GG, +7 RU/KZ…). Boş değer geçerlidir (alanlar opsiyonel).
  - Hata mesajı ülke adı ve örnek numarayla `PhoneField` tarafından gösterilir: "Almanya için geçerli bir telefon numarası girin (örn. 1512 3456789)". Form gönderilmeden de, alandan bir kez çıkıldıktan sonra kontrol edilir. Ülke değişince mesaj ve kontrol yeni ülkeye göre güncellenir.
  - Eski/serbest biçimli kayıtlı numaralar (`0532…`) form açılırken `normalizePhone` ile E.164'e çevrilir. Ülke kodu olmayan eski numaralar tarayıcının ülkesine göre değil `TR`'ye göre yorumlanır. Listelerde ve detayda numaralar `formatPhone` ile `+90 532 123 45 67` biçiminde gösterilir.
- Hook'lar: `useIsMobile` (`< sm`), `useIsCompact` (`< md`), `useDebouncedValue`, `useAppEvent` (§9).

### 6.4 NotificationMenu (`features/notifications/NotificationMenu.tsx`)
- **Badge:** `unseenNotificationCount` query'si (altın badge). Uygulama açılışında ve her `NOTIFICATION` WebSocket olayında tazelenir (§9). 99'dan büyükse `99+`.
- **Zile tıklanınca** `Popover` açılır (mobilde `Drawer anchor="bottom"`, tam genişlik):
  - Liste: **sadece görülmemiş** bildirimler.
    ```graphql
    notifications(filters: { isSeen: false }, ordering: [{ createdAt: DESC }], pagination: { offset: 0, limit: 10 })
    ```
  - Her öğe: başlık (kalın), gövde (2 satır kısaltılmış), göreli zaman (`dayjs().fromNow()`).
  - Öğeye tıklanınca:
    1. `seeNotifications(ids: [id])` çağrılır.
    2. `data.transferId` (veya `data.id`) varsa `/transfers/:id`'ye gidilir.
    3. Popover kapanır.
  - Liste boşsa: "Yeni bildiriminiz yok" boş durumu.
- **Alt bar:**
  - **Mark all as read:** `seeNotifications` **`ids` gönderilmeden** çağrılır (backend tüm görülmemişleri okundu yapar). Sonra liste ve badge tazelenir. Liste boşken disabled.
  - **View all:** `/settings/notifications`'a gider, popover kapanır.

### 6.5 Dil seçimi
- Header'daki dil menüsü: `i18n.changeLanguage(lng)`, `dayjs.locale(lng)`. MUI ve date picker locale'leri de güncellenir (`trTR`/`enUS`). Seçim `localStorage`'da saklanır.
- **Giriş yapmışsa** ayrıca `updateUser(data: { language: EN | TR })` çağrılır. Backend bildirimleri ve araç kategorisi isimlerini (`vehicleOptions`) kullanıcının dilinde üretir. Sonra açık olan `vehicleOptions` / `vehicleCategories` sorguları tazelenir.
- Giriş yapmamışsa `vehicleCategories(language: ...)` argümanı kullanılır, `getCode` de seçili dili gönderir.
- İlk açılışta: `localStorage` → kullanıcı `language` → `navigator.language` → `EN`.

### 6.6 AddressField ve harita (`components/address/`)

**Servisler (açık kaynak, OpenStreetMap tabanlı, URL'ler env'den):**

| İş | Servis | Not |
|---|---|---|
| Harita karoları | OSM tile (`VITE_TILE_URL`) | `react-leaflet` `TileLayer`, attribution zorunlu. Yoğun prod kullanımında kendi tile sunucusu veya sağlayıcı kullanılmalı |
| Adres autocomplete | **Photon** (`VITE_GEOCODER_URL/api?q=&limit=6&lat=&lon=`) | OSM verisi, yazarken arama için tasarlandı. **Nominatim kullanma**, kullanım politikası autocomplete'i yasaklıyor |
| Reverse geocode (haritadan seç, konumum) | Photon `/reverse?lat=&lon=` | |
| Mesafe ve süre | **OSRM** (`VITE_ROUTING_URL/route/v1/driving/{lng},{lat};…;{lng},{lat}?overview=full&geometries=polyline`, ara duraklar waypoint olarak araya girer, `routes[0].legs` bölüm süreleri) | Public demo sunucusu sadece geliştirme içindir, prod'da self-host OSRM |

- **`lang` parametresi gönderilmez.** Photon yerel isimleri (Türkçe ilçe adlarını) döndürsün, backend `District.name` ile eşleşebilsin.
- Sonuçlar `VITE_GEOCODER_COUNTRY_CODES`'a göre istemcide süzülür.
- Kullanıcının konumu biliniyorsa `lat/lon` ile sonuçlar yakına öncelendirilir.

**Seçilmiş adres modeli:**
```ts
type SelectedAddress = {
  address: string;        // gösterilen tam adres, max 255 karakter (backend sınırı)
  latitude: string;       // 6 ondalık, string ("41.275300")
  longitude: string;
  districtName: string;   // backend pickup/dropoffDistrictName
};
```

**`districtName` çıkarımı (`lib/geo/district.ts`, tek fonksiyon):**
- Photon `properties` alanlarından ilçe adı seçilir. Türkiye için öncelik `county → city → district`.
- Bu sıra seed edilen `District` verisine göre **gerçek adreslerle doğrulanmalıdır** (§11).
- Backend en az bir noktanın ilçesini bulamazsa `ERR035` döner.

**AddressField davranışı:**
- MUI `Autocomplete` (`freeSolo={false}`):
  - Yazarken 350ms debounce, en az 3 karakterde arama. Önceki istek `AbortController` ile iptal edilir.
  - Seçenekler iki satırdır: ad + bölge/şehir. Yükleniyor göstergesi ve "Sonuç yok" metni vardır.
- **Seçilen adres input'ta gösterilir.** Seçim yapılmadan yazılan serbest metin geçerli adres sayılmaz.
- Input'un sonunda (`endAdornment`) sırasıyla:
  - **Konumum** (`MyLocation`):
    1. `navigator.geolocation.getCurrentPosition` (`enableHighAccuracy`, 10sn timeout) çağrılır.
    2. Reverse geocode yapılır, sonuç seçilir.
    3. İzin reddedilirse snackbar ile açıklama gösterilir.
  - **Haritadan seç** (`Map`): `MapPickerDialog`'u açar.
  - **Adresi sil** (`Close`): **sadece adres seçiliyken görünür**. Seçimi ve input'u temizler, rota bilgisini sıfırlar.
- Hata durumunda (`ERR035` dahil) helper text ile alan altında gösterilir.

**MapPickerDialog:**
- Mobilde tam ekran, masaüstünde `maxWidth="md"`.
- `MapContainer` merkezi şu sırayla seçilir: mevcut seçim → kullanıcı konumu → `VITE_DEFAULT_MAP_CENTER`.
- Ortada sabit pin bulunur. Harita kaydırıldıkça (`moveend`) merkez koordinatı reverse geocode edilir (debounce) ve adres alt panelde gösterilir.
- Haritada "Konumum" FAB'ı vardır.
- Alt bar: **Vazgeç** / **Bu konumu seç** (adres çözümlenene kadar disabled).
- Leaflet CSS'i `import 'leaflet/dist/leaflet.css'` ile eklenir. Vite'ta varsayılan marker ikon yolları `L.Icon.Default.mergeOptions` ile düzeltilir.

## 7. Sayfalar ve route'lar

| Route | Sayfa | Roller |
|---|---|---|
| `/login` | Giriş | misafir |
| `/register` | Kayıt (3 adım) | misafir |
| `/forgot-password` | Şifre sıfırlama (3 adım) | misafir |
| `/` | Role göre yönlendirme: CUSTOMER → `/transfers`, OPERATOR → `/dispatch`, DRIVER → `/jobs`, ADMIN/STAFF → `/transfers` | giriş yapmış |
| `/transfers` | Transfer listesi | hepsi (backend kapsamı otomatik) |
| `/transfers/new` | Transfer oluştur | CUSTOMER |
| `/transfers/:id/vehicle` | Araç seçimi ve ödeme | CUSTOMER |
| `/transfers/:id` | Transfer detayı + mesajlar | hepsi |
| `/transfers/:id/edit` | Transfer düzenle (sadece `PENDING`) | CUSTOMER |
| `/dispatch` | Atama bekleyen işler | OPERATOR, ADMIN, STAFF |
| `/jobs` | Sürücünün işleri | DRIVER |
| `/messages`, `/messages/:transferId` | Mesajlar: aktif transfer sohbetleri (§8.14) | CUSTOMER, DRIVER, OPERATOR |
| `/vehicles` | Araçlar | ADMIN, STAFF, OPERATOR, DRIVER (DRIVER sadece okur, sadece kendi araçları) |
| `/vehicle-categories` | Araç kategorileri | ADMIN, STAFF |
| `/users` | Kullanıcılar | ADMIN, STAFF |
| `/settings/profile` | Profil sekmesi | hepsi |
| `/settings/statement` | Ödeme hareketleri sekmesi | hepsi |
| `/settings/notifications` | Bildirimler sekmesi | hepsi |
| `*` | 404 | |

**Nav linkleri (header / drawer):**
- CUSTOMER: Create Transfer (`/transfers/new`), Transferlerim, Mesajlar. Create Transfer ayrı bir buton değil, nav sekmesidir (backend `createTransfer` sadece CUSTOMER'a açık).
- OPERATOR: Dispatch, Transferler, Mesajlar, Araçlar.
- DRIVER: İşlerim, Mesajlar, Araçlarım.
- Mesajlar sadece mesajlaşma katılımcılarına (customer, driver, operator) açıktır. ADMIN/STAFF mesajları transfer detayında salt okunur görür.
- ADMIN/STAFF: Transferler, Dispatch, Araçlar, Kategoriler, Kullanıcılar.

- **Aktif link:** adrese en uzun eşleşen link aktif sayılır (`activeNavPath`). `/transfers/new`'de sadece Create Transfer, `/transfers/12`'de Transferlerim vurgulanır.

**Yetki dışı route:** 403 sayfası.

**Error Boundary (`features/errors/ErrorBoundaryPage.tsx`):** react-router `errorElement` olarak iki seviyede tanımlıdır:
- Giriş yapılmış sayfaları saran pathless route'ta: sayfa render/yükleme hatası header ve menü korunarak içerik alanında gösterilir.
- Kök route'ta (`fullPage`): provider, layout veya auth sayfalarındaki hatalar tam sayfa, kendi zemini ile gösterilir.
- İçerik: uyarı ikonu, kod (`500` veya route hata yanıtının status'u), başlık ve açıklama. Butonlar: **Sayfayı yenile** (`window.location.reload()`) ve **Ana sayfaya git** (`/`, uygulama durumu bozuk olabileceği için `reloadDocument` ile tam yenileme).
- Yeni sürüm sonrası eski lazy chunk yüklenemezse (`Failed to fetch dynamically imported module`) "Yeni sürüm yayınlandı, sayfayı yenileyin" metni gösterilir.
- Geliştirme modunda (`env.DEV`) katlanır "Hata detayları" bölümünde stack gösterilir. Hata konsola da yazılır.
- 403/404/Error Boundary sayfaları ortak `StatusPage` düzenini kullanır. Giriş yapmamış kullanıcı `/login?next=...`'e gider.

## 8. Sayfa sayfa query / mutation kullanımı

### 8.1 Auth

#### Giriş (`/login`)
`LoginForm`: e-posta, şifre. Gönderilince `signIn`. Başarılıysa token kaydedilir, `next` veya `/`'a gidilir.

`signIn(data: SignIn!) → SignInResponse { user, token }`

| Alan | R/O | Kural |
|---|---|---|
| `email` | R | max 100, e-posta formatı |
| `password` | R | max 128 |

Hatalar: `ERR010` (kullanıcı yok/pasif), `ERR012` (şifre yanlış).

#### Kayıt (`/register`), MUI `Stepper` ile 3 adım
1. **E-posta:** `getCode(data: { email, language, isUser: false })` → `{ secret, expireSeconds }`.
   - Geri sayım `expireSeconds`'tan başlar. "Kodu tekrar gönder" sayaç bitince aktifleşir.
   - `ERR011`: e-posta zaten kayıtlı.
2. **Kod:** `validateCode(data: { code, secret })` → yeni `secret` (doğrulanmış). 6 haneli kod girişi için tek input + `inputMode="numeric"`. `ERR004` yanlış kod, `ERR009` süre doldu.
3. **Bilgiler:** `createUser(data: CreateUser!)` → `{ user, token }`. Ardından otomatik giriş yapılır.

`GetCode`:

| Alan | R/O | Kural |
|---|---|---|
| `email` | R | max 100 |
| `language` | R | `EN \| TR`, seçili arayüz dili |
| `isUser` | O | Kayıtta **`false`**, şifre sıfırlamada **`true`** (her zaman açıkça gönder) |

`ValidateCode`:

| Alan | R/O | Kural |
|---|---|---|
| `code` | R | 6 hane |
| `secret` | R | `getCode` cevabındaki secret |

`CreateUser`:

| Alan | R/O | Kural |
|---|---|---|
| `secret` | R | `validateCode` cevabındaki secret |
| `password` | R | max 128, istemcide min 8 + tekrar alanı |
| `firstName` | R | max 50 |
| `lastName` | R | max 50 |
| `phone` | O | E.164, seçilen ülkeye göre geçerli olmalı (`PhoneField`, §6.3) |
| `profileImage` | O | `Upload` (görsel) |
| `role` | O | `CUSTOMER` (varsayılan) veya `DRIVER`. "Sürücü olarak kaydol" seçeneği |

#### Şifre sıfırlama (`/forgot-password`)
- Kayıtla aynı 3 adım: `getCode(isUser: true)` (`ERR010` kullanıcı yok) → `validateCode` → `resetPassword`. Sonra `/login`'e gidilir.
- Profil sayfasındaki "Şifre değiştir" de bu akışı kullanır (ayrı bir şifre değiştirme mutation'ı yok).

`ResetPassword`:

| Alan | R/O | Kural |
|---|---|---|
| `secret` | R | doğrulanmış secret |
| `password` | R | max 128 |

### 8.2 Transfer listesi (`/transfers`)
`PageHeader`:
- Başlık.
- CUSTOMER için "Create Transfer" butonu (mobilde gizli, drawer'daki Create Transfer linki kullanılır).

Filtre toolbar'ı:
- Durum (çoklu `Select` → `status: { inList }`).
- Tarih aralığı (`pickupTime: { range }`).
- Yolcu adı araması (`passengerName: { iContains }`, 400ms debounce).
- ADMIN/STAFF/OPERATOR için bölge filtresi (`stateId: { exact }`). Backend'de State sorgusu olmadığı için sayısal id alanıdır.

`DataTable` → `transfers(filters, ordering: [{ pickupTime: DESC }], pagination)`.

| Sütun | Alan |
|---|---|
| # | `id` |
| Alış zamanı | `pickupTime` (sıralanabilir) |
| Güzergah | `pickupAddress` → `dropoffAddress` (kısaltılmış, `mobilePrimary`) |
| Yolcu | `passengerName`, `passengerCount` |
| Araç | `vehicleCategory { name }` |
| Fiyat | `price`, `currency` |
| Durum | `status` (`StatusChip`) |
| Sürücü | `driver { name }` (`hideBelow: 'md'`) |

Satır tıklama → `/transfers/:id`.

⋮ aksiyonları:

| Aksiyon | Koşul | Ne yapar |
|---|---|---|
| Detay | her zaman | `/transfers/:id` |
| Araç seç / Öde | CUSTOMER, `PENDING` | `/transfers/:id/vehicle` |
| Düzenle | CUSTOMER, `PENDING` | `/transfers/:id/edit` |
| Sürücü ata | OPERATOR/ADMIN/STAFF, `PAID` veya `ASSIGNED` | `AssignDriverDialog` (§8.7) |
| Mesajlar | `ASSIGNED`/`STARTED` ve kullanıcı katılımcı | `/transfers/:id#messages` |
| Bahşiş ver | CUSTOMER, `COMPLETED` | `TipDialog` (§8.6) |
| İptal et | CUSTOMER/OPERATOR/ADMIN/STAFF, `PENDING`/`PAID`/`ASSIGNED` | `ConfirmDialog` → `cancelTransfer` (§8.6) |

### 8.3 Transfer oluştur (`/transfers/new`), CUSTOMER

**Düzen:**
- Masaüstünde iki sütun: solda form, sağda (`md+`) rota önizleme haritası (pickup/dropoff pin'leri + OSRM polyline).
- Mobilde tek sütun. Harita adresler seçilince formun üstünde küçük önizleme olarak görünür.
- Alt sabit aksiyon bar'ında özet (mesafe · süre) ve **Create Transfer** butonu var.

**Form bölümleri ve alanlar:**

1. **Güzergah**
   - `Pickup` → `AddressField` (konumum, haritadan seç, sil butonlarıyla)
   - **Ara duraklar** (`StopsEditor`): pickup ile dropoff arasında **Add stop** butonu. Her tıklama araya numaralı yeni bir `AddressField` açar (1., 2., … durak), her durağın yanında kaldır butonu vardır. **En fazla 10 durak** (`MAX_STOPS`, `features/booking/schema.ts`), sınıra gelince buton disabled olur ve "En fazla 10 durak" yazar. Sayaç `n/10` gösterilir.
   - `Dropoff` → `AddressField`
   - "Add stop" satırının sağında "yer değiştir" (`SwapVert`) ikon butonu. Pickup ↔ dropoff değişir, ara duraklar ters sıraya girer.
   - Pickup ve dropoff seçilince OSRM'den rota alınır. Seçilmiş ara duraklar sırayla waypoint olarak eklenir (pickup → 1 → 2 → … → dropoff):
     - `distance` = toplam metre / 1000, 2 ondalık (ara duraklar dahil, yani fiyat da durakları içerir)
     - `duration` = toplam saniye / 60, yukarı yuvarlanır
     - Haritada ara duraklar 1, 2, 3… numaralı pin olarak gösterilir.
     - Rota alınırken skeleton gösterilir. Hata olursa "Rota hesaplanamadı, tekrar dene" + tekrar butonu.
2. **Zaman:** `pickupTime` → `DateTimePicker`, `disablePast`, minimum şu an + 15 dk (backend sadece gelecek ister, `ERR016`).
3. **Yolcu ve ihtiyaçlar** (alanlar her ekran genişliğinde alt alta, tam genişlik)
   - `passengerCount`: stepper input, min 1
   - `luggageCount`: min 0
   - `childSeatCount`: min 0
   - `needsWheelchair`: `Switch`
4. **Yolcu bilgisi**
   - `passengerName`: varsayılan kullanıcının adı soyadı
   - `passengerPhone`: varsayılan kullanıcının telefonu, ülke kodu seçicili (`PhoneField`, §6.3)
   - `flightNumber`
   - `note` (çok satırlı)
5. **`legs` üretimi (kullanıcı ayrıca girmez):** ara durak varsa `buildLegs` (`features/booking/values.ts`) rota bölümlerinden `legs` listesi üretir: pickup → 1. durak, 1. → 2. durak, …, son durak → dropoff (N durak = N+1 leg).
   - `startTime` = `pickupTime` + önceki bölümlerin OSRM süreleri, `endTime` = `startTime` + bu bölümün süresi (en az 1 dk). Böylece her zaman `endTime > startTime` olur.
   - `order` bölüm sırasıdır (0'dan), `route` gönderilmez.
   - Ara durak yoksa `legs` gönderilmez.

**Create Transfer butonu ne zaman aktif:**
- **Pickup ve dropoff ikisi de seçilmeden (koordinat + districtName dolu) asla aktif olmaz.**
- Eklenmiş her ara durağın adresi seçilmiş olmalı (boş durak ya doldurulur ya kaldırılır).
- Ayrıca rota hesaplanmış (`distance > 0`, `duration > 0`), `pickupTime` gelecekte, `passengerName` dolu ve form validasyonu (zod) geçerli olmalı.
- İstek sürerken `loading`.

**Gönderim:** `createTransfer(data: CreateTransfer!) → TransferResponse { transfer, vehicleOptions }`.
- Başarılı → `/transfers/:id/vehicle`'a gidilir. `vehicleOptions` route state ile taşınır, cache'de de bulunur.
- `ERR035` → "Seçilen adreslerin bölgesi hizmet alanımızda bulunamadı", adres alanlarına hata yazılır.
- `ERR016` → zaman alanına, `ERR030` → genel form hatası. Bu mutation'lar `skipErrorToast` kullanır, diğer hatalar formun üstünde `Alert` olarak gösterilir.
- Varsayılan alış zamanı: şimdi + 15 dk'dan sonraki ilk tam saat. `flightNumber` büyük harfe çevrilerek gönderilir. Leg'ler ara duraklardan otomatik üretilir (yukarıda 5. madde).
- Oluşturma ve düzenleme aynı `features/booking/TransferForm` component'ini kullanır.

`CreateTransfer`:

| Alan | R/O | Kaynak / Kural |
|---|---|---|
| `pickupAddress` | R | seçilen adres, max 255 |
| `pickupLatitude` | R | string, 6 ondalık |
| `pickupLongitude` | R | string, 6 ondalık |
| `dropoffAddress` | R | max 255 |
| `dropoffLatitude` | R | |
| `dropoffLongitude` | R | |
| `pickupDistrictName` | R | geocoder'dan (§6.6). İki ilçeden en az biri backend'de bulunmalı, yoksa `ERR035` |
| `dropoffDistrictName` | R | aynı |
| `pickupTime` | R | gelecekte, ISO + timezone |
| `distance` | R | km, > 0, string (`"40.50"`), OSRM'den |
| `duration` | R | dakika, > 0, tam sayı, OSRM'den |
| `passengerCount` | O | varsayılan 1, >= 1 |
| `luggageCount` | O | varsayılan 0 |
| `childSeatCount` | O | varsayılan 0 |
| `needsWheelchair` | O | varsayılan false |
| `passengerName` | R | max 100 |
| `passengerPhone` | O | E.164, seçilen ülkeye göre geçerli olmalı (`PhoneField`, §6.3) |
| `flightNumber` | O | max 10 |
| `note` | O | |
| `legs` | O | `[CreateLeg!]`, boşsa gönderilmez |

`CreateLeg`:

| Alan | R/O | Kural |
|---|---|---|
| `startLatitude`, `startLongitude` | R | string, 6 ondalık |
| `startAddress` | R | |
| `startTime` | R | ISO + timezone |
| `endLatitude`, `endLongitude` | R | |
| `endAddress` | R | |
| `endTime` | R | `startTime`'dan sonra, değilse `ERR030` |
| `order` | O | gönderilmezse listedeki sırası (0'dan). Frontend bölüm sırasını gönderir |
| `route` | O | OSRM encoded polyline (isteğe bağlı) |

### 8.4 Araç seçimi ve ödeme (`/transfers/:id/vehicle`), CUSTOMER

Transfer oluşturulduktan sonra **her zaman** bu ekran açılır.

- **Veri:**
  - Route state'te `vehicleOptions` varsa Apollo cache'ine yazılır ve `VehicleOptions` query'si cache'ten okur, yoksa `vehicleOptions(transferId: $id)` çağrılır. Böylece dil değişimindeki `VehicleOptions` refetch'i çalışır.
  - Üst özet kartı için `transfer(id)` çağrılır (güzergah, zaman, yolcu/bagaj).
  - Transfer `PENDING` değilse detay sayfasına yönlendirilir.
- **`VehicleOptionCard` listesi:** masaüstünde grid (`md: 2-3 sütun`), mobilde dikey liste. Her kartta:
  - Kategori görseli (`vehicleCategory.image`), adı ve açıklaması (`name`, `description`, kullanıcının dilinde).
  - Kapasite ikonları: `maxPassengers`, `maxLuggage`, `childSeatCapacity`, `isWheelchairAccessible`.
  - `distance` km, `duration` dk ve büyük punto **`price` + `currency`**.
  - Kart `radio` gibi seçilir. Seçili kart `primary` kenarlıklı olur.
- **Liste boşsa:** "Bu ihtiyaçlara uygun araç yok" + "Transferi düzenle" butonu (`/transfers/:id/edit`).
- **Alt bar:** seçilen fiyat + **Öde** butonu (seçim yoksa disabled). Tıklanınca:
  1. `payTransfer(data: { id, vehicleCategoryId })` → `PaymentResponse { paymentLink, linkExpireTime }`.
  2. `sessionStorage`'a `pendingPayment = { transferId }` yazılır.
  3. `window.location.assign(paymentLink)` ile ödeme sayfasına gidilir.
- Hata: `ERR025` (kategori uygun değil: seçim temizlenir, liste tazelenir), `ERR031` (ödeme servisi hatası, tekrar dene).
- `pendingPayment` değeri `{ transferId, kind: 'payment' | 'tip' }`'tir.

`PayTransfer`:

| Alan | R/O | Kural |
|---|---|---|
| `id` | R | transfer id |
| `vehicleCategoryId` | R | `vehicleOptions` içinden biri |

**Ödeme sonrası:**
- Kullanıcı ödeme sayfasından `/transfers/:id`'ye döner (dönüş URL'i §11'de açık konu).
- Detay sayfası `pendingPayment` görürse "Ödemeniz kontrol ediliyor" banner'ı gösterir.
- `PAYMENT_SUCCESS` / `PAYMENT_FAILED` olayını (aynı `transferId`) bekler. Yedek olarak status `PENDING` kaldığı sürece `transfer` query'sini 5 sn aralıkla en fazla 2 dk poll eder.
- Durum `PENDING`'den çıkarsa ödeme başarılı sayılır. Bahşişte status değişmediği için poll yapılmaz, sadece `TIP_*` olayı 2 dk beklenir, sonra zaman aşımı uyarısı gösterilir.
- Sonuç:
  - Başarılıysa success snackbar, status `PAID`.
  - Başarısızsa error banner + "Tekrar öde" (`/transfers/:id/vehicle`).

### 8.5 Transfer düzenle (`/transfers/:id/edit`), CUSTOMER, sadece `PENDING`
- Oluşturma formunun aynısı, `transfer(id)` ile doldurulur. Sadece **değişen alanlar** gönderilir.
- Adres değişirse aynı istekte yeni koordinat, adres, `*DistrictName` ve yeniden hesaplanan `distance`/`duration` gönderilir.
- `updateTransfer(data: UpdateTransfer!) → TransferResponse`.
  - Rota/ihtiyaç alanları değiştiyse (`pickupTime, distance, duration, passengerCount, luggageCount, childSeatCount, needsWheelchair`) backend araç seçimini ve fiyatı sıfırlar → `/transfers/:id/vehicle`'a gidilir.
  - Diğer alanlarda detay sayfasına dönülür.
- Adres değişmediyse kayıtlı `distance`/`duration` korunur, OSRM sadece çizgi için çağrılır. "Kaydet" bir şey değişene kadar disabled.
- `legs` bu mutation'la **değiştirilemez** (alan yok), düzenleme ekranında leg bölümü salt okunur gösterilir.

`UpdateTransfer` (hepsi **O**, sadece `id` **R**):

| Alan | R/O | Kural |
|---|---|---|
| `id` | R | |
| `pickupAddress`, `pickupLatitude`, `pickupLongitude` | O | birlikte gönderilir |
| `pickupDistrictName` | O | pickup adresi değiştiyse gönderilir |
| `dropoffAddress`, `dropoffLatitude`, `dropoffLongitude` | O | birlikte gönderilir |
| `dropoffDistrictName` | O | dropoff adresi değiştiyse gönderilir |
| `pickupTime` | O | gelecekte |
| `distance` | O | > 0 |
| `duration` | O | > 0 |
| `passengerCount` | O | >= 1 |
| `luggageCount`, `childSeatCount` | O | >= 0 |
| `needsWheelchair` | O | |
| `passengerName` | O | max 100 |
| `passengerPhone` | O | E.164, seçilen ülkeye göre geçerli olmalı (`PhoneField`, §6.3) |
| `flightNumber` | O | max 10 |
| `note` | O | |

### 8.6 Transfer detayı (`/transfers/:id`)
`transfer(id)` query'si sayfanın tamamını besler (null gelirse 404 veya yetkisiz durumu gösterilir).
Alanlar: `status, pickup*/dropoff*, pickupTime, endTime, distance, duration, passenger*, luggageCount, childSeatCount, needsWheelchair, flightNumber, note, price, currency, vehicleCategory { name image }, vehicle { plate brand model color }, driver { name profileImage phone }, customer { name }, operator { name }, pickupDistrict { name city { name } }, dropoffDistrict { name }, state { name }, legs { order startAddress endAddress startTime endTime }`.

**Düzen:**
- Masaüstü: sol sütunda bilgi kartları, sağ sütunda harita ve mesajlar.
- Mobil: kartlar alt alta. Mesajlar ayrı bir sekmede (`Tabs`: Detay / Mesajlar) veya tam ekran `Drawer`'da.

**Kartlar:**
- **Durum çizelgesi:** dikey `Stepper` (tüm ekran boyutlarında `orientation="vertical"`), diğer bölümler gibi başlıklı `SectionCard` içinde ("Transfer durumu" / "Transfer status", `transfers:detail.progress`), `dense` (küçük ikon, sıkı aralık). **Masaüstü (md+) yerleşimi:** solda sayfanın %75'i (`Grid md=9`) alt alta Trip, Route, Vehicle & driver, Payment kartları ve mesajlar; sağda %25 (`md=3`) durum kartı. Durum kartı sticky'dir (`top: 88`): sayfa aşağı kaydıkça header'ın altında görünür kalarak sayfayla birlikte iner (sağ sütun satır yüksekliğine uzadığı için). Tablet ve mobilde durum kartı **en üstte**, diğer kartlarla aynı tam genişliktedir. PENDING → PAID → ASSIGNED → STARTED → COMPLETED. CANCELLED ise kırmızı uyarı kartı gösterilir.
- **Güzergah:** harita (iki pin + polyline), adresler, ilçe/il, ara duraklar listesi.
- **Yolculuk:** zaman, mesafe, süre, yolcu/bagaj/çocuk koltuğu/tekerlekli sandalye, uçuş no, not.
- **Araç ve sürücü:** atanmışsa sürücü avatarı, adı, telefonu (sadece yetkili görür, null olabilir), plaka ve araç.
- **Ödeme:** fiyat ve bu transferin hareketleri: `transactions(filters: { transferId: { exact: $id } })`.

**Aksiyon butonları** (`PageHeader` sağında, mobilde alt sabit bar):

| Buton | Koşul | Mutation |
|---|---|---|
| Araç seç / Öde | CUSTOMER, `PENDING` | `/transfers/:id/vehicle` |
| Düzenle | CUSTOMER, `PENDING` | `/transfers/:id/edit` |
| Sürücü ata / değiştir | OPERATOR/ADMIN/STAFF, `PAID`/`ASSIGNED` | `AssignDriverDialog` |
| Yolculuğu başlat | DRIVER (kendi işi) veya ADMIN/STAFF, `ASSIGNED` | `updateTransferStatus(data: { id, status: STARTED })` |
| Yolculuğu tamamla | DRIVER veya ADMIN/STAFF, `STARTED` | `updateTransferStatus(data: { id, status: COMPLETED })` |
| Bahşiş ver | CUSTOMER, `COMPLETED` | `TipDialog` |
| İptal et | CUSTOMER/OPERATOR/ADMIN/STAFF, `PENDING`/`PAID`/`ASSIGNED` | `cancelTransfer(id)` |

`UpdateTransferStatus`:

| Alan | R/O | Kural |
|---|---|---|
| `id` | R | |
| `status` | R | sadece `ASSIGNED → STARTED → COMPLETED`, başka geçiş `ERR014` |

**İptal (`cancelTransfer(id: ID!)`):**
- `ConfirmDialog` metni duruma göre değişir:
  - `PENDING`: "Ödeme linki iptal edilecek."
  - `PAID`/`ASSIGNED`: "Ödemeniz iade edilecek." Müşteri iptalinde kesinti olabileceği belirtilir.
- Sonra transfer tazelenir. `ERR014` → durum artık iptale uygun değil.

**Bahşiş (`TipDialog`):**
- Hazır tutar çipleri + serbest tutar alanı.
- `tipDriver(data: TipDriver!) → PaymentResponse`, ardından `paymentLink`'e gidilir. Dönüşte `TIP_PAYMENT_SUCCESS` / `TIP_PAYMENT_FAILED` beklenir.
- `ERR033` geçersiz bahşiş (transfer tamamlanmamış veya tutar hatalı).

`TipDriver`:

| Alan | R/O | Kural |
|---|---|---|
| `id` | R | transfer id |
| `amount` | R | > 0, string, 2 ondalık |

**Mesajlar (`MessagePanel`):**
- **Görünürlük:** `status` `ASSIGNED`/`STARTED` iken ve kullanıcı katılımcıysa (customer, driver, operator) yazma açıktır. Diğer durumlarda geçmiş salt okunur gösterilir ("Mesajlaşma sadece aktif transferlerde açık"). ADMIN/STAFF sadece okur.
- **Liste:** `messages(transferId, ordering: [{ time: ASC }])`.
  - Kart görünümü (balon değil): köşeleri hafif yuvarlatılmış (4px) düz dikdörtgen, 1px ince çerçeve ve hafif gölge. Kendi mesajı sağda `highlight` zeminde, sağ kenarında 3px altın (`primary`) çizgi. Diğerleri solda kâğıt zeminde, sol kenarında 3px koyu (`text.primary`) çizgi.
  - Kartın üst satırında gönderen adı (kendi mesajında "Siz") ve saat, altında ince ayraç çizgisi ve içerik.
  - Reply'da içerikten önce alıntı (`parent`): solda 2px altın çizgili, hafif gri zeminli kutu.
  - Silinmiş mesaj "Bu mesaj silindi" olarak görünür.
  - Dosya: görselse küçük önizleme, değilse indirme çipi. Konum: haritaya link.
- **Açılınca** `seeMessages(transferId)` çağrılır.
- **Yeni `MESSAGE` olayında:** panel açıksa `Messages` tazelenir (olay göndereni taşımaz) ve `seeMessages` çağrılır. `UPDATE_MESSAGE` / `DELETE_MESSAGE` cache'teki mesajı doğrudan günceller. Kapalıysa sekmede okunmamış badge'i artar.
- **Gönderim kutusu (alt sabit):**
  - Çok satırlı input, ataç (dosya, istemcide **2MB** sınırı), konum paylaş (`navigator.geolocation` → `location: "lat,lng"`) ve gönder butonları.
  - Reply modundayken üstte iptal edilebilir alıntı çubuğu durur.
- **Mesaj ⋮ menüsü** (kendi mesajları):
  - **Düzenle:** sadece metin mesajı ve gönderiminden sonraki 1 saat içinde.
  - **Sil.**
  - **Yanıtla:** herkes için.

| Mutation | Input | Kurallar |
|---|---|---|
| `sendMessage(data: SendMessage!)` | `transferId` **R**, `message` O, `location` O, `file` O (Upload, max 2MB), `parentId` O | `message`/`location`/`file`'dan en az biri dolu olmalı (`ERR017`). `ERR019` mesajlaşma kapalı, `ERR023` yanıtlanamaz, `ERR024` dosya büyük |
| `updateMessage(data: UpdateMessage!)` | `id` **R**, `message` **R** | dosya/konum mesajı düzenlenemez (`ERR022`), 1 saat sınırı (`ERR020`), silinmiş (`ERR021`) |
| `deleteMessage(id: ID!)` | `id` **R** | sadece gönderen |
| `seeMessages(transferId: ID!)` | `transferId` **R** | |

### 8.7 Dispatch (`/dispatch`), OPERATOR, ADMIN, STAFF
- **Sekmeler:**
  - **Atama bekleyen:** `status: { exact: PAID }`, `ordering: [{ pickupTime: ASC }]`.
  - **Atanmış:** `status: { inList: [ASSIGNED, STARTED] }`.
- `DataTable` sütunları transfer listesiyle aynı, ek olarak "Alışa kalan süre" sütunu var (1 saatten azsa `warning` rengi).
- Aktif sekme URL'de (`?tab=assigned`), her sekmenin tablo durumu kendi prefix'iyle tutulur.
- `TRANSFER_PAID` olayı gelince "Atama bekleyen" listesi tazelenir ve snackbar gösterilir ("Yeni ödenmiş transfer #id").
- ⋮: Detay, **Sürücü ata**, İptal et.

**`AssignDriverDialog`** (mobilde tam ekran):
1. **Sürücü listesi:** `availableDrivers(transferId, pagination, filters)`. Arama kutusu `firstName/lastName: { iContains }` ile çalışır. Liste, o saatte işi olmayan ve uygun araca sahip sürücülerdir.
   - Liste satırı: avatar, ad, telefon.
   - Boşsa "Bu saat için uygun sürücü yok".
2. **Sürücü seçilince** `availableVehicles(transferId)` sonuçları `driverId`'ye göre süzülür ve araç seçimi gösterilir (radio). Tek araç varsa otomatik seçilir. Araç seçimi opsiyoneldir, seçilmezse backend ilk uygun aracı atar.
3. **Ata:** `assignDriver(data: AssignDriver!) → Transfer`. Başarılı olunca liste ve detay tazelenir.
   - `ERR015`: sürücü artık uygun değil, listeyi tazele.
   - `ERR027`: araç uygun değil.
   - `ERR014`: transfer durumu uygun değil.

`AssignDriver`:

| Alan | R/O | Kural |
|---|---|---|
| `id` | R | transfer id |
| `driverId` | R | `availableDrivers` içinden |
| `vehicleId` | O | o sürücünün `availableVehicles` içindeki aracı, gönderilmezse ilk uygun araç |

### 8.8 Sürücü işleri (`/jobs`), DRIVER
- **Sekmeler:**
  - **Yaklaşan:** `status: { inList: [ASSIGNED, STARTED] }`, `pickupTime ASC`.
  - **Geçmiş:** `status: { inList: [COMPLETED, CANCELLED] }`, `pickupTime DESC`.
- Backend DRIVER'a sadece kendine atanmış transferleri döner.
- Mobilde kart görünümü öne çıkar. Kartta büyük "Başlat" / "Tamamla" butonu doğrudan bulunur (`updateTransferStatus`). Kart içinde buton olduğu için mobilde kart tıklanamaz, detay ⋮ menüsündedir. Sekmeler `upcoming` / `past` prefix'leriyle URL'de.
- ⋮: Detay, Mesajlar, Yol tarifi (pickup koordinatına `geo:` / Google Maps linki).
- `TRANSFER_ASSIGNED` gelince "Yaklaşan" listesi tazelenir. `TRANSFER_CANCELLED` (atama geri alındı veya iptal) gelince de tazelenir ve uyarı gösterilir.

### 8.9 Araçlar (`/vehicles`)
`vehicles(filters, ordering, pagination)`. DRIVER sadece kendi araçlarını görür ve sadece okur.

Filtreler: plaka (`plate: { iContains }`, URL `?plate=`, 400ms debounce), kategori (`categoryId`), aktiflik (`isActive`). Düzenleme formları sadece değişen alanları gönderir. OPERATOR için sürücü alanı disabled ve açıklamalıdır (§11).

| Sütun | Alan |
|---|---|
| Plaka | `plate` (`mobilePrimary`) |
| Araç | `brand model year color` |
| Kategori | `category { name }` |
| Sürücü | `driver { name }` |
| Durum | `isActive` |

⋮ (ADMIN/STAFF/OPERATOR):
- **Düzenle:** `VehicleDialog`.
- **Aktif/Pasif yap:** `updateVehicle({ id, isActive })`.
- **Sil:** `ConfirmDialog` → `deleteVehicle(id)`. `ERR029` → "Araç transferlerde kullanılmış, pasif yapın".

"Araç ekle" butonu: `VehicleDialog` → `createVehicle`.

- **Kategori seçimi:** `vehicleCategories(pagination: { offset: 0, limit: 100 })`.
- **Sürücü seçimi:** `users(filters: { role: { exact: DRIVER }, isActive: true })` ile `Autocomplete`. Bu query ADMIN/STAFF'a açık, OPERATOR için §11'e bak.

`CreateVehicle`:

| Alan | R/O | Kural |
|---|---|---|
| `driverId` | R | aktif DRIVER (`ERR015`) |
| `categoryId` | R | (`ERR025`) |
| `plate` | R | max 20, benzersiz (`ERR028`), backend büyük harfe çevirir |
| `brand` | R | max 50 |
| `model` | R | max 50 |
| `year` | O | |
| `color` | O | max 30 |
| `image` | O | Upload |
| `isActive` | O | varsayılan true |

`UpdateVehicle`: `id` **R**, diğer tüm alanlar (`driverId, categoryId, plate, brand, model, year, color, image, isActive`) **O**.

### 8.10 Araç kategorileri (`/vehicle-categories`), ADMIN, STAFF
`vehicleCategories(filters, ordering: [{ order: ASC }], pagination)`. ADMIN/STAFF pasifleri de görür.

Sütunlar: görsel + ad (`mobilePrimary`), kapasite (yolcu/bagaj/çocuk koltuğu/♿), fiyatlandırma (`baseFare`, `perKmPrice`, `perMinutePrice`, `minimumFare`, `currency`), sıra, aktif.

⋮:
- **Düzenle:** `updateVehicleCategory`.
- **Aktif/Pasif yap.**
- **Sil:** `deleteVehicleCategory(id)`. `ERR026` → "Kategori kullanımda, pasif yapın".

`VehicleCategoryDialog`:
- Dil sekmeleri: EN / TR alanları ayrı.
- Fiyat önizleme: örnek 30 km / 40 dk için `max(minimumFare, baseFare + km*perKm + dk*perMinute)` hesaplanıp gösterilir.

`CreateVehicleCategory`:

| Alan | R/O | Kural |
|---|---|---|
| `nameEn` | R | max 50, boş olamaz |
| `nameTr` | O | max 50, boşsa EN gösterilir |
| `descriptionEn`, `descriptionTr` | O | |
| `image` | O | Upload |
| `maxPassengers` | R | >= 1 |
| `maxLuggage` | R | >= 0 |
| `childSeatCapacity` | O | varsayılan 0 |
| `isWheelchairAccessible` | O | varsayılan false |
| `baseFare`, `perKmPrice`, `perMinutePrice`, `minimumFare` | O | >= 0, string, varsayılan 0 |
| `currency` | O | varsayılan `TRY` |
| `order` | O | liste sırası, varsayılan 0 |
| `isActive` | O | varsayılan true |

`UpdateVehicleCategory`: `id` **R**, diğer tüm alanlar **O**. Geçersiz değer `ERR030`.

### 8.11 Kullanıcılar (`/users`), ADMIN, STAFF
`users(filters, ordering, pagination)`. Filtreler: rol, aktiflik, ad/e-posta araması (`OR` ile `email/firstName/lastName: { iContains }`, URL `?q=`, 400ms debounce).

Sütunlar: avatar + ad (`mobilePrimary`), e-posta, telefon, rol (chip), aktif, kayıt tarihi.

⋮:
- **Rol değiştir** (sadece ADMIN): `updateAdminUser({ id, role })`. OPERATOR rolü sadece buradan verilir.
- **Aktif/Pasif yap** (sadece ADMIN): `updateAdminUser({ id, isActive })`.
- **Bildirim gönder:** `sendNotification`.
- **Transferlerini gör:** `/transfers?customerId=`.

Toplu seçimle "Bildirim gönder" de yapılabilir.

`UpdateAdminUser`: `id` **R**, `role` O, `isActive` O.

`SendNotification`:

| Alan | R/O | Kural |
|---|---|---|
| `userIds` | R | en az bir id |
| `title` | R | max 100 |
| `body` | R | |
| `action` | O | `Action` enum |
| `data` | O | JSON |

### 8.12 Settings (`/settings/:tab`)
- **Düzen:**
  - Masaüstünde solda dikey `Tabs` (veya `List`), sağda içerik.
  - Mobilde üstte yatay kaydırılabilir `Tabs` (`variant="scrollable"`).
  - Sekme route'a bağlıdır: `/settings/profile`, `/settings/statement`, `/settings/notifications`.

#### Profile sekmesi
Veri: `user` query'si (`id firstName lastName email phone language role profileImage createdAt`).

- **Profil kartı:** avatar yükleme (`AvatarPicker`: ayrı buton yok, avatarın üzerine gelince yarı saydam "Fotoğrafı değiştir" katmanı çıkar, tıklanınca dosya seçilir. Dokunmatik cihazlarda hover olmadığı için köşede kamera rozeti görünür. Seçilen görsel kaydedilene kadar avatarda önizlenir), ad, soyad, telefon. E-posta salt okunurdur. Formda **dil ve rol alanı yoktur**: dil header'daki dil menüsünden değişir (§6.5, `updateUser({ language })` orada çağrılır), rol sadece ADMIN tarafından Kullanıcılar sayfasından değiştirilir (§8.11).
  - "Kaydet" sadece değişiklik varsa aktif olur. **Sadece değişen alanlar** gönderilir.
  - `updateUser(data: UpdateUser!) → User`. Başarılı olunca `AuthProvider` güncellenir.
- **Güvenlik kartı:** "Şifre değiştir" → `/forgot-password?email=<email>` akışı.
- **Tehlikeli bölge:** "Hesabımı sil" → yazarak onaylatılan `ConfirmDialog` → `deleteUser` → logout.

`UpdateUser` (hepsi **O**):

| Alan | R/O | Kural |
|---|---|---|
| `firstName` | O | max 50 |
| `lastName` | O | max 50 |
| `phone` | O | E.164, seçilen ülkeye göre geçerli olmalı (`PhoneField`, §6.3) |
| `language` | O | `EN \| TR`. Profil formu göndermez, sadece header dil menüsü gönderir |
| `profileImage` | O | Upload (görsel) |

#### Statement sekmesi
`transactions(filters, ordering: [{ orderTime: DESC }], pagination)`.

**Backend kapsamı:**
- ADMIN/STAFF: hepsi.
- DRIVER: kendi transferlerinin bahşişleri ve iadeleri.
- Diğerleri: kendi ödemeleri, bahşişleri ve iadeleri.

Filtreler: kategori (`category: { inList }`), tarih aralığı (`orderTime: { range }`).

Üstte özet kartları (`>= sm`): bu sayfadaki toplam ödeme / bahşiş / iade, para birimine göre gruplu (ödeme kartı `inverse` zemin + altın tutar). Filtreler URL'de: `?category=PAYMENT,TIP&from=YYYY-MM-DD&to=YYYY-MM-DD`.

| Sütun | Alan |
|---|---|
| Tarih | `orderTime` (sıralanabilir) |
| Tür | `category` (chip) |
| Tutar | `orderAmount` + `currency` (iade eksi, sıralanabilir, `mobilePrimary`) |
| Transfer | `transferId` → link |
| Not | `note` (`hideBelow: 'md'`) |
| Sipariş no | `orderId` (`hideBelow: 'lg'`) |
| İade edilen kayıt | `parentId` (REFUND satırlarında) |

⋮:
- **Transferi gör:** `/transfers/:transferId`.
- **İade et** (ADMIN/STAFF, `category` PAYMENT veya TIP): `RefundDialog`.
  - Tutar boş bırakılırsa kalan tutarın tamamı iade edilir.
  - `refundTransaction(data: RefundTransaction!) → Transaction`.
  - `ERR032` iade tutarı geçersiz (kalanı aşıyor), `ERR034` kayıt bulunamadı, `ERR031` ödeme servisi.

`RefundTransaction`:

| Alan | R/O | Kural |
|---|---|---|
| `id` | R | PAYMENT veya TIP transaction id |
| `amount` | O | > 0, kalan iade edilebilir tutarı aşamaz. Boşsa kalanın tamamı |
| `note` | O | |

#### Notifications sekmesi
`notifications(filters, ordering: [{ createdAt: DESC }], pagination)`. Filtre: Tümü / Okunmamış (`isSeen: false`) / Okunmuş (`isSeen: true`) segmentli butonu (URL `?seen=unread|read`).

| Sütun | Alan |
|---|---|
| (nokta) | `isSeen` false ise `primary` nokta |
| Başlık | `title` (okunmamışsa kalın, `mobilePrimary`) |
| İçerik | `body` |
| Zaman | `createdAt` (göreli, tooltip'te tam tarih, sıralanabilir) |

- Satır tıklama: `seeNotifications(ids: [id])` çağrılır, `data.transferId` varsa transfere gidilir.
- ⋮: **Okundu işaretle** (`isSeen` false iken), **Sil** (`deleteNotifications(ids: [id])`).
- **Toolbar:**
  - **Tümünü okundu yap:** `seeNotifications` (ids'siz).
  - **Seçilenleri sil:** `deleteNotifications(ids: [...])`.
  - **Tümünü sil:** `ConfirmDialog` → `deleteNotifications` ids'siz. **Dikkat:** ids'siz çağrı kullanıcının TÜM bildirimlerini siler, onay zorunlu.
- Her işlemden sonra liste ve header badge'i (`unseenNotificationCount`) tazelenir.

| Mutation | Argüman | R/O | Not |
|---|---|---|---|
| `seeNotifications` | `ids: [ID!]` | O | boş = tüm görülmemişler |
| `deleteNotifications` | `ids: [ID!]` | O | boş = **tüm** bildirimler |

### 8.13 Web push (opsiyonel)
- `VITE_FIREBASE_*` doluysa giriş sonrası Firebase Messaging token'ı alınır ve `updateFcmToken(data: { registrationId, type: WEB })` çağrılır.
- Token `localStorage`'da saklanır. Logout'ta `deleteFcmToken(registrationId)` çağrılır.
- Firebase env'i boşsa bu adım tamamen atlanır.
- Firebase paketleri ancak bu özellik açılacaksa eklenir. **Henüz uygulanmadı** (Firebase paketi yok). Logout akışındaki `deleteFcmToken` çağrısı hazırdır (`transfer.fcmToken` anahtarı).

| Mutation | Alan | R/O |
|---|---|---|
| `updateFcmToken` | `registrationId` | R |
| | `type` | R (`WEB`) |
| `deleteFcmToken` | `registrationId` | R |

### 8.14 Mesajlar (`/messages`, `/messages/:transferId`), CUSTOMER, DRIVER, OPERATOR
Header'daki **Mesajlar** sekmesi. Sohbetler **aktif transferlere** göre açılır: her aktif transfer bir sohbettir, `:transferId` seçili sohbettir.

```graphql
query MessageThreads($filters: TransferFilter) {
  transfers(filters: $filters, ordering: [{ pickupTime: ASC }], pagination: { offset: 0, limit: 100 }) {
    count
    transfers { id status pickupTime pickupAddress dropoffAddress customerId driverId operatorId
                customer { id name firstName lastName profileImage } driver { id name firstName lastName profileImage } }
  }
}
```
- **Aktif:** `status: { inList: [ASSIGNED, STARTED] }` (mesaj yazılabilen durumlar, `can.message`). Backend CUSTOMER'a kendi, DRIVER'a kendine atanmış transferleri döner. OPERATOR tüm transferleri gördüğü için ek olarak `operatorId: { exact: <kendi id> }` filtresi gönderilir.
- **Masaüstü:** solda sohbet listesi (%33, `md=4`), sağda seçili sohbet (`MessagePanel`, %67). Seçim yoksa ilk sohbete yönlendirilir. Liste kendi içinde kayar.
- **Mobil:** `/messages` sadece listeyi, `/messages/:transferId` sadece sohbeti gösterir. Sohbet başlığında listeye dönüş butonu vardır.
- **Liste öğesi:** karşı tarafın avatarı ve adı (CUSTOMER'a sürücü, DRIVER/OPERATOR'a müşteri), `#id`, alış → bırakış, durum chip'i, alış zamanı. Seçili öğe altın sol çizgi + `highlight` zemin.
- **Sohbet başlığı:** `MessagePanel`'in `title` prop'u ile karşı taraf, "Transfer #id · alış zamanı", durum chip'i ve transfer detayına link.
- **Okunmamış:** backend sohbet başına okunmamış sayısı vermediği için oturum içinde sayılır. Açık olmayan bir sohbete başkasından `MESSAGE` olayı gelince avatarda altın badge artar, sohbet açılınca sıfırlanır (`seeMessages` `MessagePanel` açılınca çağrılır). Listede olmayan bir transferden mesaj gelirse liste tazelenir.
- **Liste tazeleme:** `TRANSFER_ASSIGNED` / `TRANSFER_STATUS_UPDATED` / `TRANSFER_CANCELLED` olaylarında `MessageThreads` de refetch edilir (yeni atanan transfer listeye girer, tamamlanan çıkar).
- **Aktif olmayan sohbet** (ör. adres çubuğundan tamamlanmış bir transfer): "Bu sohbet aktif değil" boş durumu ve **Transferi aç** butonu. Mesaj geçmişi transfer detayında okunur.
- **Boş liste:** "Aktif sohbet yok", sohbetlerin sürücü atanınca açılıp transfer tamamlanınca kapandığı açıklanır.

## 9. WebSocket olayları (`SubscriptionProvider`)

Giriş yapıldığında tek bir subscription açılır:
```graphql
subscription { subscribe { action senderId message notificationId transferId messageId parentId location file } }
```

Olaylar `action`'a göre dağıtılır. Genel tepkiler (bildirim sayısı, `CurrentUser`, `Transfers`/`Transfer` refetch, devre dışı logout) `SubscriptionProvider`'dadır. Sayfaya özel tepkiler `useAppEvent(['MESSAGE', ...], handler)` ile component'te yazılır. Refetch operasyon **adıyla** yapıldığı için liste, detay ve sohbet listesi query'leri `Transfers` / `Transfer` / `MessageThreads` adını korumalıdır.

| `action` | Frontend tepkisi |
|---|---|
| `NOTIFICATION` | `unseenNotificationCount` ve açık bildirim listesi tazelenir |
| `MESSAGE` | `transferId` paneli açıksa mesaj listeye eklenir (`messageId`, `message`, `file`, `location`, `parentId`) ve `seeMessages` çağrılır. Değilse okunmamış badge'i artar |
| `UPDATE_MESSAGE` | ilgili mesaj metni güncellenir |
| `DELETE_MESSAGE` | ilgili mesaj "silindi" olarak işaretlenir |
| `PAYMENT_SUCCESS` / `PAYMENT_FAILED` | `transferId` detay sayfası tazelenir, ödeme banner'ı kapanır, snackbar gösterilir |
| `TIP_PAYMENT_SUCCESS` / `TIP_PAYMENT_FAILED` | aynı, bahşiş için |
| `TRANSFER_PAID` | (OPERATOR) dispatch listesi tazelenir |
| `TRANSFER_ASSIGNED` | transfer detayı/listeleri ve sürücünün iş listesi tazelenir |
| `TRANSFER_STATUS_UPDATED` | transfer detayı/listeleri tazelenir |
| `TRANSFER_CANCELLED` | transfer detayı/listeleri tazelenir, uyarı gösterilir |
| `USER_UPDATED` | `user` query'si tazelenir (rol değişmiş olabilir, nav güncellenir) |
| `USER_DEACTIVATED` | anında logout + "Hesabınız devre dışı" mesajı |
| `REFUND` | sadece bildirim olarak gelir (`NOTIFICATION`), ayrıca statement açıksa tazelenir |

Bağlantı koptuğunda `graphql-ws` otomatik yeniden bağlanır. Yeniden bağlanınca açık sayfanın query'leri tazelenir (`client.refetchQueries({ include: 'active' })`).

## 10. Hata kodları

Backend hataları `errors[0].message` içinde JSON string olarak döner: `{"code":"ERR013"}`. `src/lib/errors.ts` kodu i18n anahtarına çevirir (`errors.ERR013`). Metinler `en.json` ve `tr.json`'da bulunur.

| Kod | Anlam | UI tepkisi |
|---|---|---|
| ERR001 | Yetkisiz | 403 / snackbar |
| ERR002 | Geçersiz token | logout |
| ERR003 | Token süresi doldu | logout |
| ERR004 | Kod yanlış | kod alanında hata |
| ERR009 | Doğrulama süresi doldu | 1. adıma dön |
| ERR010 | Geçersiz kullanıcı | giriş: hata, oturum: logout |
| ERR011 | E-posta zaten kayıtlı | e-posta alanında hata, girişe link |
| ERR012 | Şifre yanlış | şifre alanında hata |
| ERR013 | Transfer bulunamadı | 404 |
| ERR014 | Transfer durumu uygun değil | snackbar + tazele |
| ERR015 | Sürücü uygun değil | atama listesini tazele |
| ERR016 | Alış zamanı geçersiz | zaman alanında hata |
| ERR017 | Mesaj boş | gönder disabled |
| ERR018 | Alıcı yok | snackbar |
| ERR019 | Mesajlaşma kapalı | paneli salt okunur yap |
| ERR020 | Düzenleme süresi doldu | snackbar |
| ERR021 | Mesaj silinmiş | listeyi tazele |
| ERR022 | Mesaj düzenlenemez | snackbar |
| ERR023 | Yanıtlanamaz mesaj | reply'ı iptal et |
| ERR024 | Dosya çok büyük (2MB) | ataç alanında hata |
| ERR025 | Geçersiz araç kategorisi | seçenekleri tazele |
| ERR026 | Kategori kullanımda | "pasif yapın" önerisi |
| ERR027 | Geçersiz araç | araç seçimini tazele |
| ERR028 | Plaka zaten var | plaka alanında hata |
| ERR029 | Araç kullanımda | "pasif yapın" önerisi |
| ERR030 | Geçersiz parametre | form hatası |
| ERR031 | Ödeme servisi hatası | "tekrar dene" |
| ERR032 | Geçersiz iade tutarı | tutar alanında hata |
| ERR033 | Geçersiz bahşiş | tutar alanında hata |
| ERR034 | İşlem bulunamadı | listeyi tazele |
| ERR035 | İlçe bulunamadı (iki adres de) | adres alanlarında "hizmet bölgesi dışında" |

Yeni kod backend `errors.txt`'ye eklendikçe bu tabloya ve i18n dosyalarına eklenir.

## 11. Açık konular (backend ile netleştirilecek)

| Konu | Durum |
|---|---|
| Ödeme dönüş URL'i | Ödeme mikroservisi başarılı/başarısız ödeme sonrası kullanıcıyı hangi URL'e yönlendiriyor belli değil. Öneri: `<frontend>/transfers/:id?payment=done`. Sonuç her durumda WebSocket/poll ile doğrulanır, URL parametresine güvenilmez |
| OPERATOR sürücü listesi | `createVehicle` OPERATOR'e açık, ama sürücü seçmek için gereken `users` query'si sadece ADMIN/STAFF'a açık. Backend'e OPERATOR için bir `drivers` query'si eklenmeli, o zamana kadar OPERATOR'ün araç formunda sürücü seçimi yapılamaz |
| İlçe adı eşleştirme | Photon'un hangi alanının (`county`/`city`/`district`) backend `District.name` ile eşleştiği seed verisiyle test edilmeli. Aynı isimli ilçeler (ör. "Merkez") yanlış eşleşebilir |
| Leg düzenleme | `updateTransfer` leg'leri değiştirmiyor. Düzenleme ekranında ara duraklar salt okunur ("Add stop" yok), rota sadece pickup → dropoff üzerinden hesaplanır |
| Web push | §8.13 uygulanmadı, Firebase config verilince eklenecek |
| Mesaj konum formatı | Backend `location`'ı serbest metin saklar. Frontend standardı `"lat,lng"` |
| Prod harita servisleri | OSM tile, Photon ve OSRM public sunucuları yoğun kullanım için değil. Prod'da self-host veya ücretli sağlayıcı URL'i `.env.production`'a yazılmalı |
