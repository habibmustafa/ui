// Normalizes rendered markup before it is snapshotted, so re-runs and refactors
// only produce a diff when the actual DOM shape changed.
//
// - React 19's `useId()` emits `_r_p_`-style ids (own components) or `:r0:` (older
//   shape); Radix prefixes its own with `radix-`. All are unstable across runs — the
//   exact id depends on how many roots have been mounted before it in the test file,
//   not on markup shape — so both prefixed and bare forms are stripped here.
// - `data-slot` is allowed to grow freely during the hybrid migration (see
//   docs/hybrid-api-migration.md §2) and is not part of the fidelity contract.
// - Attribute order is not meaningful; sorting it removes noise unrelated to markup shape.
// - `xmlns` on inline SVGs (lucide icons, mostly) is dropped rather than just sorted:
//   jsdom doesn't consistently preserve its position across platforms even after a
//   remove+re-add round-trip (observed matching on Windows, reordered on Linux CI),
//   and the attribute carries no information a snapshot diff should care about here.
const RADIX_ID_PATTERN = /(?:radix-)?_r_[a-z0-9]+_|(?:radix-)?:r[a-z0-9]+:/gi;

function sortAttributes(root: Element) {
  const walk = (el: Element) => {
    const attrs = Array.from(el.attributes)
      .map((a) => [a.name, a.value] as const)
      .sort(([a], [b]) => a.localeCompare(b));
    for (const { name } of Array.from(el.attributes)) el.removeAttribute(name);
    for (const [name, value] of attrs) el.setAttribute(name, value);
    for (const child of Array.from(el.children)) walk(child);
  };
  walk(root);
}

export function normalizeMarkup(container: Element): string {
  const clone = container.cloneNode(true) as Element;

  for (const el of Array.from(clone.querySelectorAll("[data-slot]"))) {
    el.removeAttribute("data-slot");
  }
  for (const el of Array.from(clone.querySelectorAll("[xmlns]"))) {
    el.removeAttribute("xmlns");
  }

  sortAttributes(clone);

  return clone.innerHTML
    .replace(RADIX_ID_PATTERN, "ID")
    .split(/(?<=>)(?=<)/) // one tag per line, so file diffs are readable
    .join("\n");
}
