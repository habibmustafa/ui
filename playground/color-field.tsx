import { useId, useState } from 'react'

import { Input, Label, cn, parseColor, toHex } from '../src'

/*
 * A color picker plus a text field that accepts HEX, rgb(), hsl() or oklch(). The text
 * keeps whatever is being typed until it parses, and snaps back to the last good value on
 * blur. Shared by the theme builder and the landing page's live theme control.
 */
export function ColorField({
  label,
  description,
  value,
  onChange,
  className,
}: {
  label: string
  description?: string
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  const id = useId()
  const [draft, setDraft] = useState(value)
  const [lastValue, setLastValue] = useState(value)
  if (value !== lastValue) {
    setLastValue(value)
    setDraft(value)
  }
  const parsed = parseColor(value)
  const hex = parsed ? toHex(parsed) : '#000000'
  const invalid = draft !== value && !parseColor(draft)

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={`${id}-text`}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label}: color picker`}
          value={hex}
          onChange={(event) => onChange(event.target.value)}
          className="h-[34px] w-10 shrink-0 cursor-pointer rounded-md border border-control bg-transparent p-0.5 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0"
        />
        <Input
          id={`${id}-text`}
          value={draft}
          aria-invalid={invalid || undefined}
          aria-describedby={description || invalid ? `${id}-hint` : undefined}
          spellCheck={false}
          onChange={(event) => {
            setDraft(event.target.value)
            if (parseColor(event.target.value)) onChange(event.target.value.trim())
          }}
          onBlur={() => setDraft(value)}
          className="font-mono"
        />
      </div>
      {(description || invalid) && (
        <p id={`${id}-hint`} className={cn('text-xs', invalid ? 'text-destructive' : 'text-foreground-lighter')}>
          {invalid ? 'Unrecognised color. Use HEX, rgb(), hsl() or oklch().' : description}
        </p>
      )}
    </div>
  )
}
