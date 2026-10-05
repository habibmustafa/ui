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
//   Sorted with a plain `<`/`>` comparator, not localeCompare: localeCompare is locale-
//   sensitive collation, not codepoint order — e.g. "x".localeCompare("rx") is -1, so
//   attributes landed in whatever order the host's ICU locale data happened to produce.
//   That's what caused Windows and Linux CI to disagree on sorted order for the exact
//   same attribute set.
// - `xmlns` on inline SVGs (lucide icons, mostly) is dropped outright: it carries no
//   information a snapshot diff should care about here.
const RADIX_ID_PATTERN = /(?:radix-)?_r_[a-z0-9]+_|(?:radix-)?:r[a-z0-9]+:/gi;
const TAG_PATTERN = /<([a-zA-Z][\w:-]*)((?:\s+[\w:-]+(?:="[^"]*")?)*)(\s*\/?)>/g;
const ATTR_PATTERN = /([\w:-]+)(?:="([^"]*)")?/g;

function sortTagAttributes(html: string): string {
  return html.replace(TAG_PATTERN, (full, tag: string, attrsStr: string, selfClose: string) => {
    if (!attrsStr.trim()) return full;
    const attrs = [...attrsStr.matchAll(ATTR_PATTERN)]
      .map((m) => [m[1], m[2]] as const)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    const rebuilt = attrs
      .map(([name, value]) => (value === undefined ? name : `${name}="${value}"`))
      .join(" ");
    return `<${tag} ${rebuilt}${selfClose}>`;
  });
}

export function normalizeMarkup(container: Element): string {
  const clone = container.cloneNode(true) as Element;

  for (const el of Array.from(clone.querySelectorAll("[data-slot]"))) {
    el.removeAttribute("data-slot");
  }
  for (const el of Array.from(clone.querySelectorAll("[xmlns]"))) {
    el.removeAttribute("xmlns");
  }

  return sortTagAttributes(clone.innerHTML)
    .replace(RADIX_ID_PATTERN, "ID")
    .split(/(?<=>)(?=<)/) // one tag per line, so file diffs are readable
    .join("\n");
}
