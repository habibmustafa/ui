import { Home, LayoutGrid, Menu, Palette, Rocket, Search, Type as TypeIcon } from "lucide-react";
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
import { CATALOG } from "./catalog";
import { Preview, Swatch } from "./docs";
import { GithubIcon } from "./icons";
import { PageErrorBoundary } from "./page-error-boundary";
import { Link, Navigate, useRouter } from "./router";
import { findComponent, type ComponentPreviewSpec } from "./registry";

// The generated props data is ~190KB; keep it out of the main bundle until a
// component page actually needs it.
const ApiReference = lazy(() => import("./api-reference"));
// Intro pages pull in their live demos (forms, pickers, zod); component pages don't.
const HomePage = lazy(() => import("./pages/home"));
const GettingStartedPage = lazy(() => import("./pages/getting-started"));
const ComponentsIndexPage = lazy(() => import("./pages/components-index"));

const GITHUB_URL = "https://github.com/habibmustafa/ui";

/** Top-level pages, shared by the sidebar and the search palette. */
const PAGES = [
  { to: "/", label: "Giriş", search: "Giriş ana səhifə home", icon: Home },
  { to: "/getting-started", label: "Başlanğıc", search: "Başlanğıc quraşdırma getting started install", icon: Rocket },
  { to: "/components", label: "Komponentlər", search: "Komponentlər components", icon: LayoutGrid },
  { to: "/colors", label: "Rənglər", search: "Rənglər colors tokens", icon: Palette },
  { to: "/typography", label: "Tipoqrafiya", search: "Tipoqrafiya typography", icon: TypeIcon },
];

/*
 * Route map:
 *   /                     → landing (install, live examples, catalog)
 *   /getting-started      → step-by-step setup
 *   /components           → filterable component index (?group=<role>)
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
  const pathname = path.split("?")[0];

  return (
    <nav className="flex min-w-[220px] flex-col gap-6 py-6 lg:py-8">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-xs uppercase text-foreground-muted">
          Sənədlər
        </p>
        {PAGES.map((page) => (
          <Link
            key={page.to}
            to={page.to}
            onClick={onNavigate}
            aria-current={pathname === page.to ? "page" : undefined}
            className={pathname === page.to ? activeNavLink : navLink}
          >
            {page.label}
          </Link>
        ))}
      </div>

      {CATALOG.map((group) => (
        <div key={group.key} className="flex flex-col gap-2">
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
                aria-current={path === href ? "page" : undefined}
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
        heading: "Səhifələr",
        items: PAGES.map((page) => {
          const Icon = page.icon;
          return {
            key: page.to,
            value: page.search,
            label: page.label,
            icon: <Icon className={commandItemIcon} />,
            onSelect: () => go(page.to),
          };
        }),
      },
      ...CATALOG.map((group) => ({
        key: group.key,
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
    // CATALOG and PAGES are module-level constants — this never actually reruns.
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

        <nav aria-label="Əsas" className="ml-4 hidden items-center gap-5 md:flex">
          {PAGES.slice(1, 3).map((page) => (
            <Link
              key={page.to}
              to={page.to}
              aria-current={path.split("?")[0] === page.to ? "page" : undefined}
              className={path.split("?")[0] === page.to ? activeNavLink : navLink}
            >
              {page.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <CommandMenu />
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repozitoriyası"
            className="focus-ring inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-foreground-light transition-colors hover:bg-surface-100 hover:text-foreground"
          >
            <GithubIcon className="h-4 w-4" />
          </a>
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

function ColorsPage() {
  return (
    <div>
      <PageHeader
        title="Rənglər"
        description="Semantik tokenlər — OKLCH-də ton, səth və kontrast girişlərindən törəyir."
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
        title="Tipoqrafiya"
        description="Inter üçün tənzimlənmiş şkala: text-sm 13px, text-base 15px, normal qalınlıq 450."
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

  const pathname = path.split("?")[0];
  let page: ReactNode;
  let title: string | undefined;
  if (pathname === "/") {
    page = <HomePage />;
  } else if (pathname === "/getting-started") {
    page = <GettingStartedPage />;
    title = "Başlanğıc";
  } else if (pathname === "/components") {
    page = <ComponentsIndexPage />;
    title = "Komponentlər";
  } else if (pathname === "/colors") {
    page = <ColorsPage />;
    title = "Rənglər";
  } else if (pathname === "/typography") {
    page = <TypographyPage />;
    title = "Tipoqrafiya";
  } else if (pathname.startsWith("/components/")) {
    const id = pathname.slice("/components/".length);
    page = <ComponentPage id={id} />;
    title = findComponent(id)?.title;
  } else {
    page = <Navigate to="/" />;
  }

  useEffect(() => {
    document.title = title ? `${title} — ui` : "ui — React 19 komponent kitabxanası";
  }, [title]);

  // The landing page runs full width; every other page reads next to the sidebar.
  const isHome = pathname === "/";

  return (
    <div className="min-h-screen bg-studio text-foreground">
      <Header />
      <div className="flex">
        {!isHome && <Sidebar />}
        <main className="min-w-0 flex-1 scroll-mt-14 px-6 py-8 outline-hidden md:px-10">
          <div className={isHome ? "mx-auto max-w-6xl" : "mx-auto max-w-4xl"}>
            <PageErrorBoundary resetKey={pathname}>
              <Suspense fallback={<div className="min-h-[60vh]" />}>{page}</Suspense>
            </PageErrorBoundary>
          </div>
        </main>
      </div>
      <SonnerToaster theme={resolvedTheme} />
    </div>
  );
}
