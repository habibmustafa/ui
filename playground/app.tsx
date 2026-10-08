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
  createTheme,
  Sheet,
  SonnerToaster,
  ThemeStyle,
  themeToCss,
  ThemeToggle,
  useTheme,
} from "../src";
import { CATALOG } from "./catalog";
import { PAGES } from "./site-pages";
import { Preview, Swatch } from "./docs";
import { GithubIcon } from "./icons";
import { PageErrorBoundary } from "./page-error-boundary";
import {
  EARLY_STYLE_ID,
  ensureFontLoaded,
  monoFont,
  sansFont,
  saveEarlyCss,
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
const loadBlocks = () => import("./pages/blocks");
const HomePage = lazy(loadHome);
const GettingStartedPage = lazy(loadGettingStarted);
const ComponentsIndexPage = lazy(loadComponentsIndex);
const ThemeBuilderPage = lazy(loadThemeBuilder);
const BlocksPage = lazy(loadBlocks);

const ROUTE_LOADERS: Record<string, () => Promise<unknown>> = {
  "/": loadHome,
  "/getting-started": loadGettingStarted,
  "/components": loadComponentsIndex,
  "/theme": loadThemeBuilder,
  "/blocks": loadBlocks,
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
          {PAGES.slice(1, 5).map((page) => (
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
 * /theme, on the landing page (whose hero edits them) and on /blocks, and on every page
 * once "apply everywhere" is switched on.
 */
function SiteTheme({ active }: { active: boolean }) {
  const { state } = useThemeBuilder();
  const config = useMemo(() => toConfig(state), [state]);

  useEffect(() => {
    if (!active) return;
    ensureFontLoaded(sansFont(state));
    ensureFontLoaded(monoFont(state));
  }, [active, state]);

  const tokens = useMemo(() => createTheme(config), [config]);

  // Keep the pre-paint copy of this theme (see saveEarlyCss) current for the next visit…
  useEffect(() => {
    saveEarlyCss(themeToCss(tokens));
  }, [tokens]);

  // …and drop it once the live <ThemeStyle> below has taken over. Not before: while
  // hydrating, `active` still reflects the server's defaults.
  useEffect(() => {
    if (active) document.getElementById(EARLY_STYLE_ID)?.remove();
  }, [active]);

  return active ? <ThemeStyle tokens={tokens} /> : null;
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

const PAGE_TITLES: Record<string, string> = {
  "/getting-started": "Getting started",
  "/theme": "Theme builder",
  "/components": "Components",
  "/blocks": "Blocks",
  "/colors": "Colors",
  "/typography": "Typography",
};

/** The <title> for a path; shared with the prerender (playground/entry-server.tsx). */
export function documentTitle(pathname: string) {
  const title =
    PAGE_TITLES[pathname] ??
    (pathname.startsWith("/components/")
      ? findComponent(pathname.slice("/components/".length))?.title
      : undefined);
  return title ? `${title} — ui` : "ui — React 19 component library";
}

export function App() {
  const { path } = useRouter();
  const { resolvedTheme } = useTheme();

  // Once the first page is fully loaded, quietly fetch the routes people go to next.
  // requestIdleCallback only waits for the main thread, not the network, so on its own
  // it fired while the current page's demos were still downloading and the warm-up
  // (the getting-started page drags in zod, framer-motion and the form components)
  // competed with them for bandwidth. Instead wait until no new resource has started
  // for a moment, and skip it entirely on Save-Data / 2G connections.
  useEffect(() => {
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
    ).connection;
    if (connection?.saveData || /2g/.test(connection?.effectiveType ?? "")) return;

    let quietTimer: ReturnType<typeof setTimeout> | undefined;
    let idleId: number | undefined;
    let observer: PerformanceObserver | undefined;
    const warm = () => {
      observer?.disconnect();
      void loadComponentPage();
      void loadComponentsIndex();
      void loadGettingStarted();
    };
    const onQuiet = () => {
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(warm, { timeout: 4000 });
      } else {
        warm();
      }
    };
    const rearm = () => {
      clearTimeout(quietTimer);
      quietTimer = setTimeout(onQuiet, 1500);
    };

    rearm();
    try {
      observer = new PerformanceObserver(rearm);
      observer.observe({ type: "resource" });
    } catch {
      // No resource-timing observer (old browsers, test DOMs): the single timer is enough.
    }
    return () => {
      clearTimeout(quietTimer);
      observer?.disconnect();
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
    };
  }, []);

  // Route change → scroll to top (the router does this on push, but a back/forward
  // navigation also needs it since the popstate handler just swaps the path).
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [path]);

  const pathname = path.split("?")[0];
  let page: ReactNode;
  if (pathname === "/") {
    page = <HomePage />;
  } else if (pathname === "/getting-started") {
    page = <GettingStartedPage />;
  } else if (pathname === "/theme") {
    page = <ThemeBuilderPage />;
  } else if (pathname === "/components") {
    page = <ComponentsIndexPage />;
  } else if (pathname === "/blocks") {
    page = <BlocksPage />;
  } else if (pathname === "/colors") {
    page = <ColorsPage />;
  } else if (pathname === "/typography") {
    page = <TypographyPage />;
  } else if (pathname.startsWith("/components/")) {
    page = <ComponentPage id={pathname.slice("/components/".length)} />;
  } else {
    page = <Navigate to="/" />;
  }

  useEffect(() => {
    document.title = documentTitle(pathname);
  }, [pathname]);

  // The landing page runs full width; every other page reads next to the sidebar.
  const isHome = pathname === "/";
  // Wide pages run without the sidebar.
  const isWide = isHome || pathname === "/theme" || pathname === "/blocks";
  const { everywhere } = useThemeBuilder();

  return (
    <div className="min-h-screen bg-studio text-foreground">
      <SiteTheme active={pathname === "/" || pathname === "/theme" || pathname === "/blocks" || everywhere} />
      <Header />
      <CustomThemeNotice />
      <div className="flex">
        {!isWide && <Sidebar />}
        <main className="min-w-0 flex-1 scroll-mt-14 px-6 py-8 outline-hidden md:px-10">
          <div className={isHome || pathname === "/blocks" ? "mx-auto max-w-6xl" : isWide ? "mx-auto max-w-7xl" : "mx-auto max-w-4xl"}>
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
