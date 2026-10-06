// Shared by the golden-markup and accessibility suites: every playground example, how
// to render it in isolation, and which ones have an open state worth checking too.
import { createElement, type ComponentType } from "react";
import { ThemeProvider } from "../src/providers";

// Playground examples normally render under main.tsx's <ThemeProvider>. Most don't need it,
// but a fragment can call useTheme() directly (CodeBlock does, matching upstream's own
// next-themes usage) — wrapping here keeps every example renderable in isolation.
export function withTheme(Example: ComponentType) {
  return createElement(ThemeProvider, null, createElement(Example));
}

export const exampleModules = import.meta.glob<{ default: ComponentType }>(
  "../playground/examples/**/*.tsx",
  { eager: true },
);

export function exampleName(path: string) {
  return path.split("/").pop()!.replace(/\.tsx$/, "");
}

// True overlay/portal examples get an additional open-state snapshot, per §8.1.
// Everything else (forms, static display, non-portal composites) only needs the
// closed/default-render snapshot.
export const CLICK_TO_OPEN = new Set([
  "alert-dialog-demo",
  "alert-dialog-props-demo",
  "alert-dialog-destructive",
  "alert-dialog-destructive-props-demo",
  "alert-dialog-warning",
  "alert-dialog-warning-props-demo",
  "alert-dialog-close-only",
  "alert-dialog-close-only-props-demo",
  "alert-dialog-async",
  "alert-dialog-async-props-demo",
  "alert-dialog-async-error",
  "alert-dialog-async-error-props-demo",
  "dialog-demo",
  "dialog-props-demo",
  "sheet-demo",
  "sheet-props-demo",
  "drawer-demo",
  "drawer-props-demo",
  "popover-demo",
  "popover-props-demo",
  "dropdown-menu-demo",
  "dropdown-menu-props-demo",
  "dropdown-menu-checkboxes-demo",
  "dropdown-menu-checkboxes-props-demo",
  "dropdown-menu-radio-group-demo",
  "dropdown-menu-radio-group-props-demo",
  "menubar-demo",
  "menubar-props-demo",
  "navigation-menu-demo",
  "navigation-menu-props-demo",
]);
export const HOVER_TO_OPEN = new Set([
  "tooltip-demo",
  "tooltip-props-demo",
  "hover-card-demo",
  "hover-card-props-demo",
]);
export const OPEN_ROLE_SELECTOR =
  '[role="dialog"], [role="menu"], [role="tooltip"], [data-state="open"]';
