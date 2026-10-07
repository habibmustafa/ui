# Hybrid API — current technical rules

This document is used when changing a hybrid component. The existing
`dialog.tsx`/`dialog-parts.tsx` and
`dialog-demo.tsx`/`dialog-props-demo.tsx` pair is the working reference.

## Eligibility and the two modes

Only a component with a Root and several meaningful public parts becomes hybrid. The distinguishing prop
(`items`, `options`, `columns`, etc.) must replace assembling parts by hand. Do not add an artificial second API
to a single-element component or to a system that requires a full schema generator.
`Chart`'s limited props API is not a general hybrid example; Sonner, Calendar, Form and Sidebar
are intentionally not made hybrid.

```tsx
<Tabs items={items} />
<Tabs.Root><Tabs.List><Tabs.Trigger value="a">A</Tabs.Trigger></Tabs.List></Tabs.Root>
```

Props mode is written as `<Component … />`, compound mode as `<Component.Root>` and `<Component.Child>`.
Each part's previous named export (`TabsTrigger`, etc.) remains for compatibility.

## Structure and strategy

`<name>-parts.tsx` holds the compound parts, `<name>.tsx` the props render, and `index.ts`
the `Object.assign(Hybrid, { Root, Child, … })` namespace and the named exports.
The same split applies to fragments. The props render composes the existing parts and other atoms;
it does not assemble Radix/cmdk/vaul directly a second time and duplicate the behavior.
Before writing a new props composition for a fragment, check upstream `packages/ui-patterns`
for a ready-made matching variant.

| Strategy | Condition | Mode selection |
|---|---|---|
| A | There is a distinguishing prop or prop set that is not on the compound root | An explicit check such as `props.items !== undefined`; if the distinguishing prop is absent, compound root |
| B | `children`, `open` and other fields are handled in both modes | `<Component>` props render, `<Component.Root>` compound root |

In Strategy A, the `PropsMode | CompoundMode` union forbids the data prop from falling into compound mode
at the type level (`items?: never`). If `children` is not meaningful in props mode,
add `children?: never`; keep it in a mode that accepts a body, like Card. In Strategy B the
old root name remains as the `ComponentRoot` named export. Do not guess the mode by looking at `child.type` or
the structure of the JSX children.
If more than one field is checked with `||` (Card, Alert), TypeScript may not automatically
narrow the compound branch; cast to the exact compound type in that branch.

Namespace parts are not wrappers but direct references to the existing parts. Export **the prop type of
every part** added to `Object.assign` from `-parts.tsx`; otherwise the declaration
bundle may break with `TS4023`. Do not attach a static field directly to a Radix export; first
build your own function component. Call hooks unconditionally, outside the mode branch.

## Props mode behavior

- In the default appearance, the DOM, classes, ARIA, focus
  management, portal and animation of the upstream demo and the compound example stay the same. Derive variant types from the part's prop type;
  do not write a parallel union. For a new data prop, keep classes in a literal map; do not build dynamic Tailwind
  class names. If there is no upstream demo, choose a minimal part composition
  note it.
- Keep names such as `open/defaultOpen/onOpenChange`, `value/defaultValue/onValueChange`.
  When needed, use `src/lib/use-controllable-state.ts`; do not duplicate controlled state
  with `useEffect`. Keep Tabs/Accordion/Select/RadioGroup value types generic with
  `TValue extends string` where possible. The `trigger` element is rendered through the part's Trigger via
  `asChild`.
- Slot meanings: `undefined` — default appearance; `null` — hide the part;
  `ReactNode` — custom content; `(ctx) => ReactNode` — content with access to internal state.
  A content prop is not limited to `string` only.
- `className` goes to the outer visual element; `classNames` are per-part classes;
  `slotProps` derive from the parts' own prop types. Class merge order:
  default → `classNames.x` → `slotProps.x.className`.
- Do not add unnecessary top-level boolean props or a parallel variant scale;
  choose a `null` slot, `classNames`, `slotProps` or compound composition. A `MenuItem`
  variant is added only if a matching compound part exists. Do not invent new tokens,
  CSS files or runtime dependencies for the props render.
- `content` and `title` already exist in React `HTMLAttributes`. When adding a props field
  with the same name, explicitly `Omit` them from the root type; removing only `children` is not enough.
- During an async `onConfirm`, show pending/loading, block Cancel and overlay dismiss,
  and on success close according to the `closeOnConfirm` rule (`true` by default); if the Promise is rejected,
  the dialog should stay open and the error must not be swallowed.

## Playground and verification

For every eligible hybrid example, pair the props and compound files in
`playground/registry.tsx` with `codeVariants: [{ id: 'props', ... }, { id: 'compound', ... }]`.
`Preview` shows the props example; the compound file uses `.Root`/`.Child`.
If the props API does not express the same behavior, do not fabricate a fake example
note it. Do not create a second mode for flat components.

Before a new hybrid migration, create a golden baseline of the compound example. The existing golden HTML
must not change. If a change is intentional, explain the reason in the
test; do not update the snapshot just to make the test pass. `npm run verify` runs build, lint,
class/token checks and tests together. Document the decision and the result in the same
turn.
