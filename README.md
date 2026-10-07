<p align="center"><img src="https://raw.githubusercontent.com/habibmustafa/ui/main/public/ui-mark.svg" alt="ui" width="64" height="64" /></p>

<p align="center">
  <a href="https://www.npmjs.com/package/@habibmustafa/ui"><img src="https://img.shields.io/npm/v/%40habibmustafa%2Fui" alt="npm version" /></a>
  <img src="https://img.shields.io/badge/react-19-61dafb" alt="React 19" />
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/%40habibmustafa%2Fui" alt="license" /></a>
</p>

# ui

React 19, TypeScript, Tailwind CSS v4 və Radix üzərində qurulmuş komponent kitabxanası — 68 atom
və 14 fragment, OKLCH token sistemi və seçilmiş komponentlərdə həm **props-driven**, həm də
**compound** API.

**[Canlı playground →](https://ui.habibmustafa.me)**

```sh
npm i @habibmustafa/ui
```

## Xüsusiyyətlər

- **82 komponent** — 68 atom (`Button`, `Dialog`, `Select`, `DatePicker`, `MultiSelect`, …) və
  14 fragment (`FormFields`, `DataTable`, `CodeBlock`, `MetricCard`, `EmptyState`, …).
  Bölgü qaydası aşağıda: [Layihə strukturu](#layihə-strukturu).
- **Hibrid API** — seçilmiş komponentlər tək `props` ilə, ya da Radix tərzi
  `Component.Root`/`Component.Part` compound yazılışı ilə işlədilə bilər. Hansı komponentin
  hibrid olduğu və niyə: [docs/hybrid-api-migration.md](docs/hybrid-api-migration.md).
- **Öz temanız** — [Tema yaradıcısı](https://ui.habibmustafa.me/theme) ilə rəngləri, kontrastı,
  radiusu və şrifti canlı seçin, CSS və ya kod kimi götürün. Eyni generator kitabxanada
  `createTheme()` kimi var: bir brend rəngindən açıq və tünd tema üçün bütün şkala hesablanır.
- **Açıq/tünd/sistem tema** — `ThemeProvider` seçimi `localStorage`-a yazır və
  `prefers-color-scheme` dəyişikliyini canlı izləyir.
- **Tree-shakeable** — build hər modulu ayrıca fayl kimi çıxarır; tək `Button` import etmək
  bütün kitabxananı bundle-a çəkmir.
- React 19 üçün hazırlanıb (`ref` adi prop, React Compiler ilə compile olunub), tam TypeScript tipləri.

## İstifadə

Paket React 19 tələb edir (peer dependency):

```tsx
import { Button, ThemeProvider } from '@habibmustafa/ui'
import '@habibmustafa/ui/styles.css'

export function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <Button>Başla</Button>
    </ThemeProvider>
  )
}
```

### Hibrid komponentlər: iki rejim

Props rejimi — sürətli, az kod:

```tsx
<Dialog
  trigger={<Button>Sil</Button>}
  title="Elementi sil"
  description="Bu geri qaytarıla bilməz."
  onConfirm={handleDelete}
/>
```

Compound rejimi — tam nəzarət, öz layoutunu qur:

```tsx
<Dialog.Root>
  <Dialog.Trigger asChild>
    <Button>Sil</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Elementi sil</Dialog.Title>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>
```

## Temalaşdırma

`ThemeProvider` seçilən temanı `html` elementinə `data-theme` atributu və `.light`/`.dark`
class-ı kimi yazır (tokenlər class-a, `dark:` utility-ləri isə atributa əsaslanır):

```tsx
<ThemeProvider defaultTheme="system" storageKey="theme">
  <App />
</ThemeProvider>
```

```tsx
const { theme, resolvedTheme, setTheme } = useTheme()
```

Öz tema idarəetməniz varsa, `ThemeProvider` işlətmədən eyni iki atributu özünüz təyin edə
bilərsiniz.

### Öz temanız

Ən rahatı [Tema yaradıcısı](https://ui.habibmustafa.me/theme)dır: seçimlərinizi canlı görün,
sonra `theme.css` faylı, JSON və ya kod kimi export edin. Kodda eyni generator:

```tsx
import { ThemeProvider, createTheme } from '@habibmustafa/ui'

const theme = createTheme({
  brand: '#6366f1',         // düymələr, keçidlər, fokus — bütün brend şkalası bundan
  accent: '#ec4899',        // info rəngi, qrafikin 2-ci seriyası
  neutral: { tint: 0.2 },   // fonun brend tonunda çaları (0 = boz)
  contrast: 0.6,            // 0–1, standart 0.5
  status: { warningHue: 70, destructiveHue: 20 },
  radius: 8,                // rounded-md (px), digər ölçülər mütənasib
  font: { sans: "'IBM Plex Sans'" }, // şrifti özünüz yükləyin
})

<ThemeProvider tokens={theme}>
  <App />
</ThemeProvider>
```

- `createTheme` yalnız verdiyiniz açarları dəyişir; boş konfiq standart temadır.
- Hər şkala addımı orijinal palitranın açıq/tünd tema strukturunu (işıqlılıq, nisbi doyğunluq)
  saxlayır, ona görə düymə mətni və hover addımları istənilən rəngdə oxunaqlı qalır.
- Statik CSS lazımdırsa (SSR, ayrıca fayl): `themeToCss(config)` — nəticəni `styles.css`-dən
  sonra yükləyin. Selektorlar `:root` ilə gücləndirilib, yükləmə sırası fərq etmir.
- `<ThemeStyle tokens={…} />` temanı provider-siz (məsələn, önizləmə üçün) tətbiq edir.

## Layihə strukturu

```
src/components/
  atoms/
    actions/       Button, CopyButton, Toggle, ToggleGroup
    data-display/  Accordion, Avatar, Chart, Collapsible, Kbd, Table
    feedback/      Alert, Badge, Banner, Progress, ShimmeringLoader, Skeleton, Sonner, Spinner
    forms/         Input, Select, Combobox, MultiSelect, DatePicker, TimePicker, FileUpload, …
    layout/        Box, Flex, Grid, Stack, Card, ScrollArea, …
    navigation/    Breadcrumb, Command, Menubar, Pagination, Sidebar, Tabs, TextLink, …
    overlay/       Dialog, Popover, Sheet, Tooltip, ConfirmPopover, …
  fragments/       FormFields, FormItemLayout, DataTable, MetricCard, CodeBlock, …
```

- **Atom** — ümumi təyinatlı tikinti bloku: hər bir kontrol, overlay, naviqasiya, layout və
  feedback komponenti, roluna görə qovluqlanır. Bir komponent bir iş görür, daxildə nə qədər
  hissədən qurulmasından asılı olmayaraq. Məsələn, `DatePicker` (trigger + `Popover` +
  `Calendar`) da `TimePicker` kimi bir kontroldur, ona görə hər ikisi `atoms/forms`-dadır.
- **Fragment** — atomlardan konkret bir iş üçün yığılmış hazır, fikirli kompozisiya: forma
  sahəsinin layout-u, data cədvəli, metrik kartı, xəta ekranı, kod bloku, tema düyməsi və s.
- **Asılılıq istiqaməti** — fragment atomları import edə bilər, atom isə fragmenti heç vaxt.
  Bunu `tests/structure.test.ts` yoxlayır.

## Sənədlər

- [Başlanğıc bələdçisi](https://ui.habibmustafa.me/getting-started): quraşdırmadan işləyən formaya qədər
- [Hibrid API](docs/hybrid-api-migration.md)
- [Versiya tarixçəsi](CHANGELOG.md)
- [Üçüncü tərəf mənbə və lisenziya qeydləri](THIRD-PARTY-NOTICES.md)
