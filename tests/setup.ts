import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

// Deterministic timezone: components that format a timestamp for display (TimestampInfo)
// render it in the local zone. Without pinning this, the same frozen instant renders
// different wall-clock text depending on which machine runs the suite (e.g. UTC+4 locally
// vs CI's UTC), producing a false golden-snapshot mismatch.
process.env.TZ = "UTC";

// Deterministic clock: date-dependent examples (calendar-demo selects `new Date()` and
// renders a `data-today` cell) would otherwise produce a new snapshot every day. Fixed to
// the documented project date so the baseline stays stable.
const FROZEN_NOW = new Date("2026-09-23T12:00:00.000Z");

// Deterministic Math.random: a few examples generate sample data with it (metric-card's
// sparkline, sidebar's skeleton widths). Reset the seed per test so the same render always
// produces the same values; the demos themselves stay untouched for faithful live previews.
let randomSeed = 0;
function seededRandom() {
  randomSeed = (randomSeed * 1664525 + 1013904223) >>> 0;
  return randomSeed / 4294967296;
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.setSystemTime(FROZEN_NOW);
  randomSeed = 0x2f6e2b1;
  vi.spyOn(Math, "random").mockImplementation(seededRandom);
});

afterEach(() => {
  cleanup();
});

// jsdom does not implement these — Radix (Select/DropdownMenu/Tooltip/...) calls them
// during pointer interaction and layout measurement.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList;
}

if (!("ResizeObserver" in window)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // @ts-expect-error — test-only stub
  window.ResizeObserver = ResizeObserverStub;
}

for (const method of ["hasPointerCapture", "setPointerCapture", "releasePointerCapture"] as const) {
  if (!(method in Element.prototype)) {
    Element.prototype[method] = () => false;
  }
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

if (typeof PointerEvent === "undefined") {
  class PointerEventStub extends MouseEvent {
    pointerId: number;
    pointerType: string;
    constructor(type: string, params: MouseEventInit & { pointerId?: number; pointerType?: string } = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 1;
      this.pointerType = params.pointerType ?? "mouse";
    }
  }
  // @ts-expect-error — test-only stub
  window.PointerEvent = PointerEventStub;
}

// jsdom ignores the `inert` attribute. In a browser nothing inside an inert subtree can take
// focus, so `focus()` on it is a no-op; the gallery thumbnails on /components rely on that.
// Without it, a thumbnail demo that mounted late moved focus onto its own element (the
// resizable demo's handle) in the middle of `user.type` on the filter box, so the keys went
// elsewhere and the components-index test failed whenever the machine was busy.
const nativeFocus = HTMLElement.prototype.focus;
HTMLElement.prototype.focus = function focus(this: HTMLElement, options?: FocusOptions) {
  if (this.closest("[inert]")) return;
  nativeFocus.call(this, options);
};
