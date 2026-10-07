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
- **Dəyişənlərlə tema** — semantik rənglər (fon, mətn, sərhəd, `primary`) OKLCH-də bir neçə giriş
  dəyişənindən (`--primary-hue`, `--surface-hue`, `--chroma`) törəyir; tonu dəyişmək üçün
  komponent kodu ilə işləməyə ehtiyac yoxdur.
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

Semantik rəngləri dəyişmək üçün CSS-i yenidən yazmaq lazım deyil — `styles.css`-dən sonra
yüklənən faylda giriş dəyişənlərini override edin:

```css
:root, .light, .dark {
  --primary-hue: 250;  /* primary: keçidlər, primary mətn və fonlar */
  --surface-hue: 250;  /* fon, mətn və sərhədlərin çaları */
}
.light { --chroma: 0.008; } /* neytralların doyğunluğu; açıq temada standart 0-dır (tam boz) */
.dark  { --chroma: 0.03; }
```

Düymələrin və vurğuların yaşıl brend şkalası (`--brand-default`, `--brand-200` … `--brand-600`)
hər tema üçün ayrıca HSL dəyərləridir və bu dəyişənlərdən törəmir. Brend rəngini dəyişmək üçün
həmin dəyişənləri də override edin (dəyərlər `H S% L%` formatındadır).

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
