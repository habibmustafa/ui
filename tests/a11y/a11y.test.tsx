// Accessibility baseline: runs axe-core over every playground example (and the open state
// of every overlay example) and fails on any violation that isn't listed in KNOWN below.
//
// jsdom has no layout or computed colors, so `color-contrast` can't be judged here;
// `region` only makes sense for a whole page, not an isolated example.
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterAll, describe, expect, test } from "vitest";
import {
  CLICK_TO_OPEN,
  HOVER_TO_OPEN,
  OPEN_ROLE_SELECTOR,
  exampleModules,
  exampleName,
  withTheme,
} from "../examples";

const AXE_OPTIONS: axe.RunOptions = {
  rules: {
    "color-contrast": { enabled: false },
    region: { enabled: false },
  },
  resultTypes: ["violations"],
};

/*
 * Violations accepted on purpose, by example name → axe rule id, each with the reason.
 * Only cmdk internals remain: every demo labels its controls, so any new unlabeled
 * control in a demo fails here.
 * Anything not listed here fails the suite, and an entry that no longer reproduces
 * fails too (see the last test) — so this list can only shrink by fixing things.
 */
const KNOWN: Record<string, Record<string, string>> = {
  // cmdk hard-codes role="separator" (after the prop spread, so it can't be overridden)
  // inside its role="listbox" list, which ARIA doesn't allow as a listbox child.
  "command-demo": { "aria-required-children": "cmdk renders role=separator inside the listbox" },
  "command-props-demo": { "aria-required-children": "cmdk renders role=separator inside the listbox" },
  // cmdk's input always points aria-controls at its list, which the closed popover hasn't
  // mounted yet. Not overridable from outside cmdk.
  "multi-select-inline-search-input": {
    "aria-valid-attr-value": "cmdk input's aria-controls targets a list that is not mounted while closed",
  },
  "multi-select-inline-search-input-props-demo": {
    "aria-valid-attr-value": "cmdk input's aria-controls targets a list that is not mounted while closed",
  },
};

const seen = new Map<string, Set<string>>();

function describeViolation(v: axe.Result) {
  const nodes = v.nodes
    .slice(0, 3)
    .map((n) => `    ${n.target.join(" ")}\n      ${n.failureSummary?.replace(/\n/g, "\n      ")}`)
    .join("\n");
  return `${v.id} (${v.impact}): ${v.help}\n${nodes}`;
}

async function expectNoNewViolations(name: string) {
  const { violations } = await axe.run(document.body, AXE_OPTIONS);
  const known = KNOWN[name] ?? {};
  const found = seen.get(name) ?? new Set<string>();
  for (const v of violations) found.add(v.id);
  seen.set(name, found);

  const unexpected = violations.filter((v) => !(v.id in known));
  expect(unexpected.map(describeViolation).join("\n\n"), name).toBe("");
}

describe("accessibility (axe)", () => {
  for (const [path, mod] of Object.entries(exampleModules)) {
    const name = exampleName(path);
    const Example = mod.default;

    test(`${name} — default render`, async () => {
      render(withTheme(Example));
      await expectNoNewViolations(name);
    });

    if (CLICK_TO_OPEN.has(name) || HOVER_TO_OPEN.has(name)) {
      test(
        `${name} — open state`,
        async () => {
          const user = userEvent.setup();
          render(withTheme(Example));
          const trigger = document.body.querySelector("button")!;
          if (CLICK_TO_OPEN.has(name)) await user.click(trigger);
          else await user.hover(trigger);
          await waitFor(() => expect(document.body.querySelector(OPEN_ROLE_SELECTOR)).not.toBeNull(), {
            timeout: 3000,
          });
          await expectNoNewViolations(name);
        },
        10000,
      );
    }
  }

  afterAll(() => {
    // Only meaningful when the whole suite ran (not under a -t filter).
    if (seen.size !== Object.keys(exampleModules).length) return;
    const stale = Object.entries(KNOWN).flatMap(([name, rules]) =>
      Object.keys(rules)
        .filter((rule) => !seen.get(name)?.has(rule))
        .map((rule) => `${name}: ${rule}`),
    );
    expect(stale, "KNOWN entries that no longer reproduce — remove them").toEqual([]);
  });
});
