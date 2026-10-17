// Shared by every hybrid atom's props-driven component (docs/hybrid-api-migration.md §4.2).
import { useCallback, useLayoutEffect, useRef, useState } from 'react'

export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T
  defaultValue: T
  onChange?: (value: T) => void
}) {
  const [internal, setInternal] = useState<T>(defaultValue)
  const isControlled = value !== undefined
  const current = isControlled ? value : internal

  const onChangeRef = useRef(onChange)
  useLayoutEffect(() => {
    onChangeRef.current = onChange
  })

  const setValue = useCallback(
    (next: T) => {
      // Always track the last value, even while controlled: if the parent later passes
      // `undefined` (e.g. a form field reset), we fall back to this, not to a stale one.
      setInternal(next)
      onChangeRef.current?.(next)
    },
    []
  )

  return [current, setValue] as const
}
