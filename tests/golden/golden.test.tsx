// Golden markup baseline (docs/hybrid-api-migration.md §8, §12 Turn 2).
//
// Renders every playground/examples/<component>/*.tsx and snapshots the normalized markup.
// These files are the fidelity contract during the hybrid API migration: once a
// component is split into -parts.tsx + hybrid file, its existing snapshot here
// must stay byte-identical — that's what proves the compound API rendered the
// same DOM before and after the refactor.
//
// Intentional baseline changes (not hybrid refactors), recorded here per the rule above:
// - multi-select-*: the trigger gained aria-label/aria-haspopup/aria-expanded (and
//   aria-controls while open) — it was a role="combobox" with no name or state.
// - form-fields-demo: FormSelect's trigger now carries FormControl's id/aria-describedby/
//   aria-invalid, so its <label> actually labels it (Select's props mode used to drop them).
// - form-fields-demo: FormCheckbox/FormSwitch are wrapped in a FormItem (plain <div>), so
//   their ids are real useId values instead of the shared "undefined-form-item".
// - checkbox-*, form-fields-demo, form-item-layout-with-checkbox*: Checkbox's class list
//   gained data-[state=indeterminate] styles (it now draws a dash for "indeterminate").
// - input-with-prefix-suffix (and the new number-input/data-table baselines): the inner
//   <input> of a prefixed/suffixed Input gained [font-size:inherit] — it rendered at 16px.
// - multi-select-*: the pointer-only chip × is aria-hidden, the trigger is described by a
//   "← → then Backspace" hint (when chips are deletable), plus a polite live region that
//   announces the picked chip.
// - select-*, switch-*, input-states, textarea-states, input-otp-*, data-input-*,
//   progress-demo, popover-*, multi-select-badge-limit*: the demos now label their
//   controls (aria-label / FormControl), so the a11y suite's KNOWN list could shrink to
//   the cmdk-only entries.
// - checkbox-*, form-*, data-table-demo: Checkbox gained `relative after:absolute
//   after:-inset-1` (24px hit area around the 16px box).
// - code-block-demo, error-display-*, status-code-demo: contrast fixes — darker light-theme
//   syntax colours, neutral text on warning backgrounds, destructive-600 status text.
// - chart-*, metric-card-*, drawer-*.open: Recharts 3's ResponsiveContainer adds an inner
//   sizing <div> (jsdom never measures a size, so no chart SVG renders here either way).
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { normalizeMarkup } from "./normalize";
import {
  CLICK_TO_OPEN,
  HOVER_TO_OPEN,
  OPEN_ROLE_SELECTOR,
  exampleName,
  exampleModules as modules,
  withTheme,
} from "../examples";

describe("golden markup", () => {
  for (const [path, mod] of Object.entries(modules)) {
    const name = exampleName(path);
    const Example = mod.default;

    test(`${name} — default render`, async () => {
      render(withTheme(Example));
      const html = normalizeMarkup(document.body);
      await expect(html).toMatchFileSnapshot(`./${name}.html`);
    });

    if (CLICK_TO_OPEN.has(name) || HOVER_TO_OPEN.has(name)) {
      test(
        `${name} — open state`,
        async () => {
          const user = userEvent.setup();
          render(withTheme(Example));
          const trigger = document.body.querySelector("button");
          if (!trigger) throw new Error(`${name}: no trigger <button> found to open it`);

          if (CLICK_TO_OPEN.has(name)) {
            await user.click(trigger);
          } else {
            await user.hover(trigger);
          }

          await waitFor(
            () => {
              if (!document.body.querySelector(OPEN_ROLE_SELECTOR)) {
                throw new Error(`${name}: did not reach an open state`);
              }
            },
            { timeout: 3000, interval: 50 },
          );

          const html = normalizeMarkup(document.body);
          await expect(html).toMatchFileSnapshot(`./${name}.open.html`);
        },
        10000,
      );
    }
  }
});
