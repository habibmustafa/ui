import { Menu, Search } from "lucide-react";
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
  Sheet,
  SonnerToaster,
  ThemeStyle,
  ThemeToggle,
  useTheme,
} from "../src";
import { CATALOG } from "./catalog";
import { PAGES } from "./site-pages";
import { Preview, Swatch } from "./docs";
import { GithubIcon } from "./icons";
import { PageErrorBoundary } from "./page-error-boundary";
import {
  ensureFontLoaded,
  monoFont,
  sansFont,
  setApplyEverywhere,
  toConfig,
  useThemeBuilder,
} from "./theme-store";
import { Link, Navigate, setPrefetcher, useRouter } from "./router";
import { findComponent } from "./registry";
import { PageHeader } from "./page-header";

// Component pages carry the example loaders (and, lazily, the props tables); none
// of that belongs in the first chunk every page loads.
const loadComponentPage = () => import("./pages/component-page");
const ComponentPage = lazy(loadComponentPage);
// Intro pages pull in their live demos (forms, pickers, zod); component pages don't.
const loadHome = () => import("./pages/home");
const loadGettingStarted = () => import("./pages/getting-started");
const loadComponentsIndex = () => import("./pages/components-index");
const loadThemeBuilder = () => import("./pages/theme-builder");
const HomePage = lazy(loadHome);
const GettingStartedPage = lazy(loadGettingStarted);
const ComponentsIndexPage = lazy(loadComponentsIndex);
const ThemeBuilderPage = lazy(loadThemeBuilder);

const ROUTE_LOADERS: Record<string, () => Promise<unknown>> = {
  "/": loadHome,
  "/getting-started": loadGettingStarted,
  "/components": loadComponentsIndex,
  "/theme": loadThemeBuilder,
};

/**
 * Warms a route before it is visited: its page chunk and, for a component page, the
 * first few demos. Called on link hover/focus/touch, so by the click most of the
 * work is done. Repeat calls are free (the module cache dedupes them).
 */
function prefetchRoute(to: string) {
  const path = to.split("?")[0];
  if (ROUTE_LOADERS[path]) {
    void ROUTE_LOADERS[path]();
    return;
  }
  if (path.startsWith("/components/")) {
    const entry = findComponent(path.slice("/components/".length));
    if (!entry) return;
    void loadComponentPage();
    void import("./component-preview").then(({ prefetchDemo }) =>
      entry.previews.slice(0, 3).forEach((preview) => prefetchDemo(preview.name))
    );
  }
}
setPrefetcher(prefetchRoute);

const GITHUB_URL = "https://github.com/habibmustafa/ui";


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
          Docs
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
// The palette itself (cmdk, the dialog, every row) loads on first use or when the
// pointer reaches a trigger; only the triggers and the shortcut live up front.
const loadCommandPalette = () => import("./command-palette");
const CommandPalette = lazy(loadCommandPalette);

function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const show = () => {
    setMounted(true);
    setOpen(true);
  };

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setMounted(true);
        setOpen((value) => !value);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const warm = () => void loadCommandPalette();

  return (
    <>
      {/* Wide trigger, upstream's own breakpoint (`lg:flex hidden`) and classes. */}
      <button
        type="button"
        onClick={show}
        onMouseEnter={warm}
        onFocus={warm}
        className="focus-ring relative hidden h-8 items-center justify-start rounded-lg border border-strong bg-background px-2.5 text-sm font-normal text-foreground-muted shadow-none transition-colors hover:border-foreground-muted hover:bg-surface-100 hover:text-foreground-lighter sm:pr-10 lg:flex lg:w-48"
      >
        <span className="truncate">Search components…</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded-sm border bg-surface-200 px-1.5 font-mono text-[10px] font-medium text-foreground-light opacity-100 sm:flex">
          <span className="text-sm">⌘</span>K
        </kbd>
      </button>
      {/* Icon-only trigger below the breakpoint the wide box needs. */}
      <button
        type="button"
        aria-label="Search"
        onClick={show}
        onTouchStart={warm}
        className="focus-ring inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground-light transition-colors hover:bg-surface-100 hover:text-foreground lg:hidden"
      >
        <Search className="h-4 w-4" />
      </button>
      {mounted && (
        <Suspense fallback={null}>
          <CommandPalette open={open} onOpenChange={setOpen} />
        </Suspense>
      )}
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
                aria-label="Open navigation"
                className="focus-ring inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground-light transition-colors hover:bg-surface-100 hover:text-foreground md:hidden"
              >
                <Menu className="h-4.5 w-4.5" />
              </button>
            </Sheet.Trigger>
            <Sheet.Content side="left" className="w-72 overflow-y-auto px-6">
              <Sheet.Title className="sr-only">Navigation</Sheet.Title>
              <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
            </Sheet.Content>
          </Sheet.Root>

          <Link
            to="/"
            aria-label="ui — home"
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

        <nav aria-label="Main" className="ml-4 hidden items-center gap-5 md:flex">
          {PAGES.slice(1, 4).map((page) => (
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
            aria-label="GitHub repository"
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


function ColorsPage() {
  return (
    <div>
      <PageHeader
        title="Colors"
        description="Semantic tokens, derived in OKLCH from hue, surface and contrast inputs."
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

/**
 * The theme builder's tokens, rendered with the library's own <ThemeStyle>: always on
 * /theme, and on every page once "apply everywhere" is switched on.
 */
function SiteTheme({ active }: { active: boolean }) {
  const { state } = useThemeBuilder();
  const config = useMemo(() => toConfig(state), [state]);

  useEffect(() => {
    if (!active) return;
    ensureFontLoaded(sansFont(state));
    ensureFontLoaded(monoFont(state));
  }, [active, state]);

  return active ? <ThemeStyle tokens={config} /> : null;
}

function CustomThemeNotice() {
  const { everywhere } = useThemeBuilder();
  const { path } = useRouter();
  if (!everywhere || path.split("?")[0] === "/theme") return null;
  return (
    <div className="flex items-center justify-center gap-3 border-b bg-surface-100 px-6 py-1.5 text-xs text-foreground-light">
      <span>Your theme from the theme builder is applied.</span>
      <Link to="/theme" className="focus-ring rounded-xs text-foreground underline underline-offset-2">
        Edit
      </Link>
      <button
        type="button"
        onClick={() => setApplyEverywhere(false)}
        className="focus-ring cursor-pointer rounded-xs text-foreground underline underline-offset-2"
      >
        Turn off
      </button>
    </div>
  );
}

export function App() {
  const { path } = useRouter();
  const { resolvedTheme } = useTheme();

  // Once the first page is up, quietly fetch the routes people go to next.
  useEffect(() => {
    const warm = () => {
      void loadComponentPage();
      void loadComponentsIndex();
      void loadGettingStarted();
    };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(warm, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(warm, 2000);
    return () => clearTimeout(timer);
  }, []);

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
    title = "Getting started";
  } else if (pathname === "/theme") {
    page = <ThemeBuilderPage />;
    title = "Theme builder";
  } else if (pathname === "/components") {
    page = <ComponentsIndexPage />;
    title = "Components";
  } else if (pathname === "/colors") {
    page = <ColorsPage />;
    title = "Colors";
  } else if (pathname === "/typography") {
    page = <TypographyPage />;
    title = "Typography";
  } else if (pathname.startsWith("/components/")) {
    const id = pathname.slice("/components/".length);
    page = <ComponentPage id={id} />;
    title = findComponent(id)?.title;
  } else {
    page = <Navigate to="/" />;
  }

  useEffect(() => {
    document.title = title ? `${title} — ui` : "ui — React 19 component library";
  }, [title]);

  // The landing page runs full width; every other page reads next to the sidebar.
  const isHome = pathname === "/";
  // Wide pages run without the sidebar.
  const isWide = isHome || pathname === "/theme";
  const { everywhere } = useThemeBuilder();

  return (
    <div className="min-h-screen bg-studio text-foreground">
      <SiteTheme active={pathname === "/theme" || everywhere} />
      <Header />
      <CustomThemeNotice />
      <div className="flex">
        {!isWide && <Sidebar />}
        <main className="min-w-0 flex-1 scroll-mt-14 px-6 py-8 outline-hidden md:px-10">
          <div className={isHome ? "mx-auto max-w-6xl" : isWide ? "mx-auto max-w-7xl" : "mx-auto max-w-4xl"}>
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
