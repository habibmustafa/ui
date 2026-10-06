import { Home, Menu, Palette, Search, Type as TypeIcon } from "lucide-react";
import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  Badge,
  Command,
  Dialog,
  Sheet,
  SonnerToaster,
  ThemeToggle,
  useTheme,
  type CommandGroupData,
} from "../src";
import { ComponentPreview, previewAnchor } from "./component-preview";
import { Preview, Swatch } from "./docs";
import { Link, Navigate, useRouter } from "./router";
import {
  COMPONENT_GROUPS,
  findComponent,
  type ComponentPreviewSpec,
} from "./registry";

// The generated props data is ~190KB; keep it out of the main bundle until a
// component page actually needs it.
const ApiReference = lazy(() => import("./api-reference"));

/*
 * Route map:
 *   /                     → overview (tokens + component index)
 *   /colors, /typography  → token pages
 *   /components/<id>      → one page per component (id = registry entry id)
 * Unknown paths redirect to "/" via <Navigate>.
 */

const navLink =
  "text-sm text-foreground-light transition-colors hover:text-foreground";
const activeNavLink = "text-sm font-medium text-foreground transition-colors";
const commandItemIcon = "mr-2 h-4 w-4 shrink-0 text-foreground-muted";
// The library's CommandDialog is roomy (h-12 input, py-3 items) to match the generic
// "Type a command…" demo — this header search wants the same compact rows upstream's
// own site-wide search uses, so it composes the parts directly instead of that wrapper.
const commandRootClassName =
  "overflow-hidden rounded-md bg-overlay text-foreground-light [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-foreground-muted [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-4 [&_[cmdk-input-wrapper]_svg]:w-4 [&_[cmdk-input]]:h-10 [&_[cmdk-item]]:rounded-xs [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-1.5 [&_[cmdk-item]]:text-sm [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4";

/**
 * Nav content shared by the desktop sidebar and the mobile drawer, so the two never
 * drift apart. `onNavigate` closes the mobile sheet after a link is clicked. Search
 * lives in the header's Cmd/Ctrl+K palette instead of a second, in-sidebar filter.
 */
function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { path } = useRouter();

  return (
    <nav className="flex min-w-[220px] flex-col gap-6 py-6 lg:py-8">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-xs uppercase text-foreground-muted">
          Overview
        </p>
        <Link
          to="/"
          onClick={onNavigate}
          className={path === "/" ? activeNavLink : navLink}
        >
          Components
        </Link>
        <Link
          to="/colors"
          onClick={onNavigate}
          className={path === "/colors" ? activeNavLink : navLink}
        >
          Colors
        </Link>
        <Link
          to="/typography"
          onClick={onNavigate}
          className={path === "/typography" ? activeNavLink : navLink}
        >
          Typography
        </Link>
      </div>

      {COMPONENT_GROUPS.map((group) => (
        <div key={group.title} className="flex flex-col gap-2">
          <p className="font-mono text-xs uppercase text-foreground-muted">
            {group.title}
          </p>
          {group.entries.map((entry) => {
            const href = `/components/${entry.id}`;
            return (
              <Link
                key={entry.id}
                to={href}
                onClick={onNavigate}
                className={path === href ? activeNavLink : navLink}
              >
                {entry.title}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

/**
 * Header search: Ctrl/Cmd+K (from anywhere) or clicking the trigger opens a
 * command palette listing every route, each row carrying the same icon as its
 * Overview card (registry.tsx is the single source for both). The trigger button
 * is lifted verbatim from supabase.com/design-system's own header (checked against
 * its live, rendered DOM); the dialog composes the Command
 * primitives directly rather than the library's own CommandDialog, which is sized
 * for its "Type a command…" demo, not a dense, whole-library search list.
 */
function CommandMenu() {
  const { navigate } = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  const groups: CommandGroupData[] = useMemo(
    () => [
      {
        key: "pages",
        heading: "Pages",
        items: [
          {
            key: "overview",
            value: "Components overview",
            label: "Components",
            icon: <Home className={commandItemIcon} />,
            onSelect: () => go("/"),
          },
          {
            key: "colors",
            value: "Colors tokens",
            label: "Colors",
            icon: <Palette className={commandItemIcon} />,
            onSelect: () => go("/colors"),
          },
          {
            key: "typography",
            value: "Typography tokens",
            label: "Typography",
            icon: <TypeIcon className={commandItemIcon} />,
            onSelect: () => go("/typography"),
          },
        ],
      },
      ...COMPONENT_GROUPS.map((group) => ({
        key: group.title,
        heading: group.title,
        items: group.entries.map((entry) => {
          const Icon = entry.icon;
          return {
            key: entry.id,
            value: entry.title,
            label: entry.title,
            icon: <Icon className={commandItemIcon} />,
            onSelect: () => go(`/components/${entry.id}`),
          };
        }),
      })),
    ],
    // COMPONENT_GROUPS is a module-level constant — this never actually reruns.
    []
  );

  return (
    <>
      {/* Wide trigger, upstream's own breakpoint (`lg:flex hidden`) and classes. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring relative hidden h-8 items-center justify-start rounded-lg border border-strong bg-background px-2.5 text-sm font-normal text-foreground-muted shadow-none transition-colors hover:border-foreground-muted hover:bg-surface-100 hover:text-foreground-lighter sm:pr-10 lg:flex lg:w-48"
      >
        <span className="truncate">Komponent axtar…</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded-sm border bg-surface-200 px-1.5 font-mono text-[10px] font-medium text-foreground-light opacity-100 sm:flex">
          <span className="text-sm">⌘</span>K
        </kbd>
      </button>
      {/* Icon-only trigger below the breakpoint the wide box needs. */}
      <button
        type="button"
        aria-label="Axtar"
        onClick={() => setOpen(true)}
        className="focus-ring inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground-light transition-colors hover:bg-surface-100 hover:text-foreground lg:hidden"
      >
        <Search className="h-4 w-4" />
      </button>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Content className="overflow-hidden p-0 shadow-lg">
          <Dialog.Title className="sr-only">Komponent axtar</Dialog.Title>
          <Command.Root className={commandRootClassName}>
            <Command.Input placeholder="Komponent axtar…" />
            {/*
             * 63 rows would otherwise stretch the dialog to the viewport height (the
             * shared CommandList defaults to max-h-full, i.e. uncapped) — upstream's own
             * search dialog caps its list the same way (max-h-[300px] in its live DOM).
             */}
            <Command.List className="max-h-[300px]">
              <Command.Empty>Nəticə tapılmadı.</Command.Empty>
              {groups.map((group, index) => (
                <div key={group.key}>
                  {index > 0 && <Command.Separator />}
                  <Command.Group heading={group.heading}>
                    {group.items.map((item) => (
                      <Command.Item key={item.key} value={item.value} onSelect={item.onSelect}>
                        {item.icon}
                        <span>{item.label}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                </div>
              ))}
            </Command.List>
          </Command.Root>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}

function Header() {
  const { path } = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // A route change (link click, back/forward, or a redirect) always means the
  // drawer's job is done — close it rather than trusting every call site to do so.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [path]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-studio/95 backdrop-blur-sm supports-backdrop-filter:bg-studio/60 relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-default/70 to-transparent"
      />
      <div className="flex h-14 items-center gap-3 px-6">
        <div className="flex items-center gap-3">
          <Sheet.Root open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <Sheet.Trigger asChild>
              <button
                type="button"
                aria-label="Komponent siyahısını aç"
                className="focus-ring inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground-light transition-colors hover:bg-surface-100 hover:text-foreground md:hidden"
              >
                <Menu className="h-4.5 w-4.5" />
              </button>
            </Sheet.Trigger>
            <Sheet.Content side="left" className="w-72 overflow-y-auto px-6">
              <Sheet.Title className="sr-only">Naviqasiya</Sheet.Title>
              <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
            </Sheet.Content>
          </Sheet.Root>

          <Link
            to="/"
            aria-label="ui — ana səhifə"
            className="focus-ring shrink-0 rounded-sm"
          >
            <img
              src="/ui-logo.svg"
              alt="ui"
              width={52}
              height={26}
              className="dark:invert"
            />
          </Link>
          <Badge variant="secondary" className="hidden lg:inline-flex">
            design system
          </Badge>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <CommandMenu />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function Sidebar() {
  return (
    <aside className="sticky top-14 z-30 hidden h-[calc(100vh-3.5rem)] shrink-0 overflow-y-auto border-r px-6 md:block">
      <SidebarNav />
    </aside>
  );
}

/* Shared page anatomy: every route gets an h1 title, a lede and a divider. */
function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <>
      <h1 className="scroll-m-20 text-3xl tracking-tight">{title}</h1>
      <p className="mt-2 text-lg text-foreground-light">{description}</p>
      <div role="none" className="mt-6 mb-6 h-px w-full shrink-0 bg-border-muted" />
    </>
  )
}

function Overview() {
  return (
    <div className="flex flex-col">
      <h1 className="scroll-m-20 text-4xl tracking-tight">Components</h1>
      <p className="mt-2 text-lg text-foreground-light">
        React components, patterns and design tokens for ui.
      </p>
      <div
        role="none"
        className="mt-6 mb-6 h-px w-full shrink-0 bg-border-muted"
      />
      {COMPONENT_GROUPS.map((group) => (
        <div key={group.title} className="mb-10">
          <p className="font-mono text-xs uppercase text-foreground-muted">
            {group.title}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.entries.map((entry) => {
              const Icon = entry.icon;
              return (
                <Link
                  key={entry.id}
                  to={`/components/${entry.id}`}
                  className="focus-ring group flex gap-3 rounded-md border bg-studio p-4 transition-colors hover:border-foreground-lighter"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-surface-100 text-foreground-muted transition-colors group-hover:text-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{entry.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-foreground-light">
                      {entry.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ColorsPage() {
  return (
    <div>
      <PageHeader
        title="Colors"
        description="Semantic tokens derived in OKLCH from a single hue, surface and contrast input."
      />
      <Preview label="Surfaces" align="start">
        <Swatch token="bg-background" className="bg-background" />
        <Swatch token="bg-surface-100" className="bg-surface-100" />
        <Swatch token="bg-surface-200" className="bg-surface-200" />
        <Swatch token="bg-surface-300" className="bg-surface-300" />
        <Swatch token="bg-overlay" className="bg-overlay" />
      </Preview>
      <Preview label="Brand & status" align="start">
        <Swatch token="bg-brand-default" className="bg-brand-default" />
        <Swatch token="bg-brand-400" className="bg-brand-400" />
        <Swatch token="bg-primary" className="bg-primary" />
        <Swatch token="bg-warning" className="bg-warning" />
        <Swatch token="bg-destructive" className="bg-destructive" />
      </Preview>
      <Preview label="Foreground & border" align="start">
        <Swatch token="bg-foreground" className="bg-foreground" />
        <Swatch token="bg-foreground-light" className="bg-foreground-light" />
        <Swatch token="bg-foreground-muted" className="bg-foreground-muted" />
        <Swatch token="bg-border" className="bg-border" />
        <Swatch token="bg-border-stronger" className="bg-border-stronger" />
      </Preview>
    </div>
  );
}

function TypographyPage() {
  return (
    <div>
      <PageHeader
        title="Typography"
        description="Inter-tuned scale: text-sm is 13px and text-base 15px, with normal weight at 450."
      />
      <Preview label="Scale" align="start">
        <div className="flex flex-col gap-2">
          <p className="text-2xl">text-2xl — heading</p>
          <p className="text-base">text-base — body</p>
          <p className="text-sm text-foreground-light">
            text-sm — foreground-light
          </p>
          <p className="text-xs text-foreground-lighter">
            text-xs — foreground-lighter
          </p>
          <p className="font-mono text-xs uppercase text-foreground-muted">
            font-mono — labels
          </p>
        </div>
      </Preview>
    </div>
  );
}

const contentsLink =
  "focus-ring rounded-sm text-foreground-light transition-colors hover:text-foreground";

/**
 * Jumps to the labelled previews on a page (Button's "Variants", "Sizes", …) and to
 * the API section. Anchors match the ids ComponentPreview derives from the same
 * labels; previews are only listed when there are at least two labelled ones.
 */
function PageContents({ previews }: { previews: ComponentPreviewSpec[] }) {
  const labelled = previews.filter((preview) => preview.label);

  return (
    <nav className="mb-8 flex flex-wrap gap-x-4 gap-y-1 border-b pb-4 text-sm">
      {labelled.length >= 2
        ? labelled.map((preview) => (
            <a
              key={preview.name}
              href={`#${previewAnchor(preview.label!)}`}
              className={contentsLink}
            >
              {preview.label}
            </a>
          ))
        : null}
      <a href="#api" className={contentsLink}>
        API
      </a>
    </nav>
  );
}

function ComponentPage({ id }: { id: string }) {
  const entry = findComponent(id);

  if (!entry) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      <PageHeader title={entry.title} description={entry.description} />
      <PageContents previews={entry.previews} />
      {entry.previews.map((preview) => (
        <ComponentPreview key={preview.name} {...preview} />
      ))}
      <Suspense fallback={null}>
        <ApiReference id={entry.id} />
      </Suspense>
    </div>
  );
}

export function App() {
  const { path } = useRouter();
  const { resolvedTheme } = useTheme();

  // Route change → scroll to top (the router does this on push, but a back/forward
  // navigation also needs it since the popstate handler just swaps the path).
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [path]);

  let page: ReactNode;
  if (path === "/") {
    page = <Overview />;
  } else if (path === "/colors") {
    page = <ColorsPage />;
  } else if (path === "/typography") {
    page = <TypographyPage />;
  } else if (path.startsWith("/components/")) {
    page = <ComponentPage id={path.slice("/components/".length)} />;
  } else {
    page = <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-studio text-foreground">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1 scroll-mt-14 px-6 py-8 outline-hidden md:px-10">
          <div className="mx-auto max-w-4xl">{page}</div>
        </main>
      </div>
      <SonnerToaster theme={resolvedTheme} />
    </div>
  );
}
