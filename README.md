<p align="center"><img src="https://raw.githubusercontent.com/habibmustafa/ui/main/public/ui-mark.svg" alt="ui" width="64" height="64" /></p>

<p align="center">
  <a href="https://www.npmjs.com/package/@habibmustafa/ui"><img src="https://img.shields.io/npm/v/%40habibmustafa%2Fui" alt="npm version" /></a>
  <img src="https://img.shields.io/badge/react-19-61dafb" alt="React 19" />
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/%40habibmustafa%2Fui" alt="license" /></a>
</p>

# ui

A component library built on React 19, TypeScript, Tailwind CSS v4 and Radix: 84 atoms and
14 fragments, an OKLCH token system, and both a **props-driven** and a **compound** API on
selected components.

**[Live playground →](https://ui.habibmustafa.me)**

```sh
npm i @habibmustafa/ui
```

## Features

- **98 components**: 84 atoms (`Button`, `Dialog`, `Select`, `DatePicker`, `MultiSelect`, …)
  and 14 fragments (`FormFields`, `DataTable`, `CodeBlock`, `MetricCard`, `EmptyState`, …).
  How they are split is described under [Project structure](#project-structure).
- **Blocks**: 12 whole screens built only from the library (sign in, settings, billing, dashboard,
  pricing, API keys and more), each shown live and as copyable code at
  [/blocks](https://ui.habibmustafa.me/blocks).
- **Hybrid API**: selected components work either with plain `props` or with a Radix-style
  `Component.Root` / `Component.Part` compound composition. Which components are hybrid, and
  why: [docs/hybrid-api-migration.md](docs/hybrid-api-migration.md).
- **Your own theme**: pick colors, contrast, radius and fonts live in the
  [theme builder](https://ui.habibmustafa.me/theme) and take the result as CSS or code. The same
  generator ships as `createTheme()`: one brand color produces the full scale for light and
  dark themes.
- **Light / dark / system themes**: `ThemeProvider` stores the choice in `localStorage` and
  follows `prefers-color-scheme` live.
- **Tree-shakeable**: the build emits every module as its own file, so importing a single
  `Button` doesn't pull in the whole library.
- Built for React 19 (`ref` as a plain prop, compiled with the React Compiler), with full
  TypeScript types.

## Usage

The package requires React 19 (a peer dependency):

```tsx
import { Button, ThemeProvider } from '@habibmustafa/ui'
import '@habibmustafa/ui/styles.css'

export function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <Button>Get started</Button>
    </ThemeProvider>
  )
}
```

### Hybrid components: two modes

Props mode: quick, little code:

```tsx
<Dialog
  trigger={<Button>Delete</Button>}
  title="Delete item"
  description="This can't be undone."
  onConfirm={handleDelete}
/>
```

Compound mode: full control, your own layout:

```tsx
<Dialog.Root>
  <Dialog.Trigger asChild>
    <Button>Delete</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Delete item</Dialog.Title>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>
```

## Theming

`ThemeProvider` writes the selected theme to the `html` element as a `data-theme` attribute
and a `.light` / `.dark` class (the tokens key off the class, the `dark:` utilities off the
attribute):

```tsx
<ThemeProvider defaultTheme="system" storageKey="theme">
  <App />
</ThemeProvider>
```

```tsx
const { theme, resolvedTheme, setTheme } = useTheme()
```

If you manage themes yourself, you can set the same two attributes without `ThemeProvider`.

### Your own theme

The easiest way is the [theme builder](https://ui.habibmustafa.me/theme): see your choices
live, then export them as a `theme.css` file, JSON or code. The same generator in code:

```tsx
import { ThemeProvider, createTheme } from '@habibmustafa/ui'

const theme = createTheme({
  brand: '#6366f1',         // buttons, links, focus; the whole brand scale comes from this
  accent: '#ec4899',        // info color, second chart series
  neutral: { tint: 0.2 },   // a brand-hued tint on surfaces (0 = gray)
  contrast: 0.6,            // 0–1, default 0.5
  status: { warningHue: 70, destructiveHue: 20 },
  radius: 8,                // rounded-md in px; the other sizes scale with it
  font: { sans: "'IBM Plex Sans'" }, // load the font yourself
})

<ThemeProvider tokens={theme}>
  <App />
</ThemeProvider>
```

- `createTheme` only changes the keys you pass; an empty config is the default theme.
- Every scale step keeps the light/dark structure of the original palette (lightness and
  relative chroma), so button text and hover steps stay readable in any color.
- For static CSS (SSR, a separate file), use `themeToCss(config)` and load the result after
  `styles.css`. The selectors are `:root`-qualified, so load order doesn't matter.
- `<ThemeStyle tokens={…} />` applies a theme without a provider (for a preview, say).

## Project structure

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

- **Atom**: a general-purpose building block. Every control, overlay, navigation, layout and
  feedback component, foldered by role. One component does one job, however many parts it is
  built from: `DatePicker` (trigger + `Popover` + `Calendar`) is one control just like
  `TimePicker`, so both live in `atoms/forms`.
- **Fragment**: a ready-made, opinionated composition of atoms for a specific job: a form
  field's layout, a data table, a metric card, an error screen, a code block, a theme toggle.
- **Dependency direction**: fragments may import atoms; atoms never import fragments.
  `tests/structure.test.ts` enforces this.

## Docs

- [Getting started](https://ui.habibmustafa.me/getting-started): from install to a working form
- [Hybrid API](docs/hybrid-api-migration.md)
- [Changelog](CHANGELOG.md)
- [Third-party sources and license notes](THIRD-PARTY-NOTICES.md)
