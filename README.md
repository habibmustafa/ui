<p align="center"><img src="https://raw.githubusercontent.com/habibmustafa/ui/main/public/ui-mark.svg" alt="ui" width="64" height="64" /></p>

<p align="center">
  <a href="https://www.npmjs.com/package/@habibmustafa/ui"><img src="https://img.shields.io/npm/v/%40habibmustafa%2Fui" alt="npm version" /></a>
  <img src="https://img.shields.io/badge/react-19-61dafb" alt="React 19" />
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/%40habibmustafa%2Fui" alt="license" /></a>
</p>

# ui

React 19, TypeScript, Tailwind CSS v4 və Radix üzərində qurulmuş komponent kitabxanası — 53 atom
və 19 fragment, OKLCH token sistemi və seçilmiş komponentlərdə həm **props-driven**, həm də
**compound** API.

**[Canlı playground →](https://ui.habibmustafa.me)**

```sh
npm i @habibmustafa/ui
```

## Xüsusiyyətlər

- **72 komponent** — 53 atom (`Button`, `Dialog`, `Select`, `Table`, `Sidebar`, …) və 19 fragment
  (`DatePicker`, `MultiSelect`, `CodeBlock`, `MetricCard`, `EmptyState`, …).
- **Hibrid API** — seçilmiş komponentlər tək `props` ilə, ya da Radix tərzi
  `Component.Root`/`Component.Part` compound yazılışı ilə işlədilə bilər. Hansı komponentin
  hibrid olduğu və niyə: [docs/hybrid-api-migration.md](docs/hybrid-api-migration.md).
- **Tək dəyişənlə rebrand** — bütün rəng palitri (~700 OKLCH dəyəri) iki giriş dəyişənindən
  (`--hue`, `--chroma`) törəyir; brendi dəyişmək üçün komponent kodu ilə işləməyə ehtiyac yoxdur.
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

Rəng palitrini dəyişmək üçün CSS-i yenidən yazmaq lazım deyil — giriş dəyişənlərini override edin:

```css
:root {
  --hue: 250;      /* neytral + brend rənglərin əsas tonu */
  --chroma: 0.02;  /* doyğunluq */
}
```

## Sənədlər

- [Hibrid API](docs/hybrid-api-migration.md)
- [Versiya tarixçəsi](CHANGELOG.md)
- [Üçüncü tərəf mənbə və lisenziya qeydləri](THIRD-PARTY-NOTICES.md)
