import { ChevronDown, Menu, Search } from "lucide-react";
import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  Badge,
  cn,
  Sheet,
  SonnerToaster,
  ThemeToggle,
  useTheme,
} from "../src";
import { CATALOG, type CatalogGroup } from "./catalog";
import { PAGES } from "./site-pages";
import { Preview, Swatch } from "./docs";
import { GithubIcon } from "./icons";
import { PageErrorBoundary } from "./page-error-boundary";
import {
  DEFAULT_STATE,
  setBuilderState,
  stateToQuery,
  useThemeBuilder,
} from "./theme-store";
import { Link, Navigate, setPrefetcher, useRouter } from "./router";
import { findComponent } from "./registry";
import { BLOCKS } from "./blocks/registry";
import { SiteTheme } from './site-theme';
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
const loadBlockDetail = () => import("./pages/block-detail");
const HomePage = lazy(loadHome);
const GettingStartedPage = lazy(loadGettingStarted);
const ComponentsIndexPage = lazy(loadComponentsIndex);
const ThemeBuilderPage = lazy(loadThemeBuilder);
const BlocksPage = lazy(loadBlocks);
const BlockDetailPage = lazy(loadBlockDetail);
const BlockPreviewPage = lazy(() => import('./block-preview-page'));

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
    void ROUTE_LOADERS[path]().catch(() => {});
    return;
  }
  if (path.startsWith("/blocks/")) {
    void loadBlockDetail().catch(() => {});
    return;
  }
  if (path.startsWith("/components/")) {
    const entry = findComponent(path.slice("/components/".length));
    if (!entry) return;
    void loadComponentPage().catch(() => {});
    void import("./demo-loaders").then(({ prefetchDemo }) =>
      entry.previews.slice(0, 2).forEach((preview) => prefetchDemo(preview.name))
    ).catch(() => {});
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

const sidebarLink = (active: boolean) => cn(
  'focus-ring relative flex min-h-9 items-center gap-2.5 rounded-lg px-3 text-sm transition-colors',
  active
    ? 'bg-brand-400/25 font-medium text-foreground before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-brand-600'
    : 'text-foreground-light hover:bg-surface-100 hover:text-foreground'
);

function SidebarGroup({ group, pathname, onNavigate }: { group: CatalogGroup; pathname: string; onNavigate?: () => void }) {
  const active = group.entries.some((entry) => pathname === `/components/${entry.id}`);
  const [expanded, setExpanded] = useState(active);
  useEffect(() => {
    if (active) setExpanded(true);
  }, [active, pathname]);

  return (
    <div>
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={`${group.title}, ${group.entries.length} components`}
        aria-controls={`nav-${group.key}`}
        onClick={() => setExpanded((value) => !value)}
        className="focus-ring flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-xs font-medium text-foreground-light transition-colors hover:bg-surface-100 hover:text-foreground"
      >
        {group.title}
        <span className="ml-auto font-mono text-[10px] text-foreground-lighter">{group.entries.length}</span>
        <ChevronDown aria-hidden="true" className={cn('h-3.5 w-3.5 transition-transform', !expanded && '-rotate-90')} />
      </button>
      <div id={`nav-${group.key}`} hidden={!expanded} className="mt-1 space-y-0.5">
        {group.entries.map((entry) => {
          const href = `/components/${entry.id}`;
          return <Link key={entry.id} to={href} onClick={onNavigate} aria-current={pathname === href ? 'page' : undefined} className={sidebarLink(pathname === href)}>{entry.title}</Link>;
        })}
      </div>
    </div>
  );
}

/**
 * Nav content shared by the desktop sidebar and the mobile drawer, so the two never
 * drift apart. `onNavigate` closes the mobile sheet after a link is clicked. Search
 * lives in the header's Cmd/Ctrl+K palette instead of a second, in-sidebar filter.
 */
function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { path } = useRouter();
  const pathname = path.split("?")[0];

  return (
    <nav aria-label="Documentation" className="flex w-full flex-col gap-5 py-6">
      <div className="flex flex-col gap-0.5">
        <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-widest text-foreground-lighter">
          Explore
        </p>
        {PAGES.map((page) => (
          <Link
            key={page.to}
            to={page.to}
            onClick={onNavigate}
            aria-current={pathname === page.to ? "page" : undefined}
            className={sidebarLink(pathname === page.to)}
          >
            <page.icon aria-hidden="true" className="h-4 w-4 opacity-70" />
            {page.label}
          </Link>
        ))}
      </div>

      <div className="border-t pt-4">
        <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-widest text-foreground-lighter">Components</p>
        {CATALOG.map((group) => <SidebarGroup key={group.key} group={group} pathname={pathname} onNavigate={onNavigate} />)}
      </div>
    </nav>
  );
}

/**
 * Header search: Ctrl/Cmd+K (from anywhere) or clicking the trigger opens a
 * command palette listing every route, each row carrying the same icon as its
 * Overview card (registry.tsx is the single source for both). The trigger button
 * follows the upstream design system's header search; the dialog composes the Command
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

/*
 * A YouTube-style loading bar along the top of the window. It shows only when a
 * navigation takes longer than a moment, fills quickly and then ever more slowly while
 * the next page loads, and runs to the end and fades out once the page is there.
 */
type ProgressPhase = "idle" | "start" | "loading" | "done";

export function RouteProgress({ active }: { active: boolean }) {
  const [phase, setPhase] = useState<ProgressPhase>("idle");

  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => setPhase("start"), 120);
      return () => clearTimeout(timer);
    }
    setPhase((current) => (current === "start" || current === "loading" ? "done" : "idle"));
  }, [active]);

  useEffect(() => {
    // "start" paints the empty bar first, so the fill has somewhere to grow from.
    if (phase === "start") {
      const frame = requestAnimationFrame(() => requestAnimationFrame(() => setPhase("loading")));
      return () => cancelAnimationFrame(frame);
    }
    if (phase === "done") {
      const timer = setTimeout(() => setPhase("idle"), 600);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  if (phase === "idle") return null;
  return (
    <div
      role="progressbar"
      aria-label="Loading page"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] origin-left bg-brand-default shadow-[0_0_8px] shadow-brand-default/60"
      style={{
        transform: `scaleX(${phase === "start" ? 0 : phase === "loading" ? 0.9 : 1})`,
        opacity: phase === "done" ? 0 : 1,
        transition:
          phase === "loading"
            ? "transform 8s cubic-bezier(0.1, 0.7, 0.2, 1)"
            : phase === "done"
              ? "transform 200ms ease-out, opacity 300ms ease 250ms"
              : "none",
      }}
    />
  );
}

function Header() {
  const { path, pending } = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // A route change (link click, back/forward, or a redirect) always means the
  // drawer's job is done — close it rather than trusting every call site to do so.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [path]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-studio/95 backdrop-blur-sm supports-backdrop-filter:bg-studio/90">
      <RouteProgress active={pending} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-default/70 to-transparent"
      />
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-3 px-4 sm:px-6">
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
    <aside className="sticky top-14 z-30 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r px-3 md:block">
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
 * The theme picked on the landing page or in the builder styles every page. Away from
 * those two editors, a bar says so and offers the way back to the default look.
 */
function CustomThemeNotice() {
  const { state } = useThemeBuilder();
  const { path } = useRouter();
  const pathname = path.split("?")[0];
  // stateToQuery lists only what differs from the default, so empty means "default".
  if (!stateToQuery(state) || pathname === "/" || pathname === "/theme") return null;
  return (
    <div className="flex items-center justify-center gap-3 border-b bg-surface-100 px-6 py-1.5 text-xs text-foreground-light">
      <span>Your theme is applied.</span>
      <Link to="/theme" className="focus-ring rounded-xs text-foreground underline underline-offset-2">
        Edit
      </Link>
      <button
        type="button"
        onClick={() => setBuilderState(DEFAULT_STATE)}
        className="focus-ring cursor-pointer rounded-xs text-foreground underline underline-offset-2"
      >
        Reset
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
      : pathname.startsWith("/blocks/")
        ? BLOCKS.find((block) => block.id === pathname.slice("/blocks/".length))?.title
        : undefined);
  return title ? `${title} — ui` : "ui — React 19 component library";
}

export function App() {
  const { path } = useRouter();
  const { resolvedTheme } = useTheme();

  // Warm the shared documentation shell without downloading unrelated forms,
  // charts and pickers. Explicit hover/focus/touch still warms each exact target.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('preview')) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (connection?.saveData || /2g/.test(connection?.effectiveType ?? '')) return;
    const warm = () => {
      void loadComponentPage().catch(() => {});
      void loadCommandPalette().catch(() => {});
    };
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(warm, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(warm, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Route change → scroll to top (the router does this on push, but a back/forward
  // navigation also needs it since the popstate handler just swaps the path).
  // Not on the first render: that would force a layout during hydration and throw away
  // the browser's own scroll restoration on reload and any #anchor in the URL.
  const scrolledPath = useRef(path.split("?")[0]);
  useEffect(() => {
    const pathname = path.split("?")[0];
    if (scrolledPath.current === pathname) return;
    scrolledPath.current = pathname;
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
  } else if (pathname.startsWith("/blocks/")) {
    page = <BlockDetailPage id={pathname.slice("/blocks/".length)} />;
  } else {
    page = <Navigate to="/" />;
  }

  useEffect(() => {
    document.title = documentTitle(pathname);
  }, [pathname]);

  // The landing page runs full width; every other page reads next to the sidebar.
  const isHome = pathname === "/";
  // Wide pages run without the sidebar.
  const isBlocks = pathname === "/blocks" || pathname.startsWith("/blocks/");
  const isWide = isHome || pathname === "/theme" || isBlocks;
  const blockPreview = pathname === '/blocks' ? new URLSearchParams(path.split('?')[1]).get('preview') : null;

  if (blockPreview) {
    return <>
      <SiteTheme />
      <PageErrorBoundary resetKey={blockPreview}>
        <Suspense fallback={<div className="min-h-screen bg-background" />}><BlockPreviewPage id={blockPreview} /></Suspense>
      </PageErrorBoundary>
      <SonnerToaster theme={resolvedTheme} />
    </>;
  }

  return (
    <div className="min-h-screen bg-studio text-foreground">
      <SiteTheme />
      <Header />
      <CustomThemeNotice />
      <div className="mx-auto flex max-w-[1600px]">
        {!isWide && <Sidebar />}
        <main className="min-w-0 flex-1 scroll-mt-14 px-4 py-8 outline-hidden sm:px-6 md:px-10">
          <div className={isHome || isBlocks ? "mx-auto max-w-6xl" : isWide ? "mx-auto max-w-7xl" : "mx-auto max-w-4xl"}>
            <PageErrorBoundary resetKey={pathname}>
              <Suspense fallback={<div role="status" className="min-h-[60vh]"><span className="sr-only">Loading page</span></div>}>{page}</Suspense>
            </PageErrorBoundary>
          </div>
        </main>
      </div>
      <SonnerToaster theme={resolvedTheme} />
    </div>
  );
}
