/*
 * The small icon button at the end of a picker field (calendar, clock): one size, one hover
 * and one icon weight for all of them, so a date field and a time field side by side read as
 * the same kind of control. The caller positions it (the date field sets it absolutely,
 * the time field pulls it into the padding) so it sits 4px from the field's edge.
 */

export const fieldIconButtonClass =
  'flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-sm text-foreground-lighter transition-colors hover:bg-accent hover:text-foreground focus-ring disabled:pointer-events-none disabled:opacity-50'

/** lucide icons inside it: 16px, drawn with a lighter stroke than the 2px default. */
export const fieldIconClass = 'h-4 w-4'
export const fieldIconStrokeWidth = 1.5
