'use client'

import { X } from 'lucide-react'

import { cn } from '../../../../lib/utils'
import { fieldIconClass, fieldIconStrokeWidth } from '../../../../lib/field-icon-button'
import { useLabels } from '../../../../providers/locale-provider'

/*
 * The × at the end of a Select / Combobox / MultiSelect trigger. The trigger is itself a
 * <button>, so this can't be one: it is a pointer affordance, hidden from assistive tech.
 * Keyboard users clear with Backspace/Delete on the focused trigger (Select, Combobox)
 * or by removing chips (MultiSelect), the same way the MultiSelect chips' × works.
 * Pointer events stop here so the trigger doesn't open, and focus stays where it was.
 * It sits right before the trailing icon (`ml-auto` pulls it out of the value/icon spread),
 * 24px centre to centre: the × box touches the icon, like DatePicker's ×.
 */
export function FieldClear({ onClear, className }: { onClear: () => void; className?: string }) {
  const labels = useLabels()
  return (
    <span
      aria-hidden="true"
      title={labels.clearSelection}
      onPointerDown={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onClear()
      }}
      className={cn(
        '-mr-1 ml-auto flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-sm text-foreground-lighter transition-colors hover:bg-accent hover:text-foreground',
        className
      )}
    >
      <X className={cn(fieldIconClass, 'h-4! w-4!')} strokeWidth={fieldIconStrokeWidth} />
    </span>
  )
}
