import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useControllableState } from '../../../../lib/use-controllable-state'

dayjs.extend(customParseFormat)

export type DateFieldSegmentType = 'day' | 'month' | 'year'

interface NumericFormatSegment {
  type: DateFieldSegmentType
  width: number
  charStart: number
}

interface LiteralFormatSegment {
  type: 'literal'
  text: string
  charStart: number
}

type FormatSegment = NumericFormatSegment | LiteralFormatSegment

/**
 * Empty (or partially-typed) segments show their own format letter repeated — `DD`,
 * `MM`, `YYYY` — instead of a generic `_` filler, so the placeholder always reflects
 * the segment's actual token regardless of format/order.
 */
const PLACEHOLDER_BY_TYPE: Record<DateFieldSegmentType, string> = { day: 'D', month: 'M', year: 'Y' }
/** Day/month get value-based auto-advance and clamping; year only advances on width (4 digits). */
const MAX_BY_TYPE: Record<DateFieldSegmentType, number> = { day: 31, month: 12, year: 9999 }

/**
 * The day segment is typed before month/year in `DD.MM.YYYY`, so its real upper bound
 * (28–31) isn't knowable until both are filled in — 31 is the permissive placeholder
 * until then. Once month+year are both complete, `commit()` uses this to clamp the day
 * back down (e.g. typing `31` then changing the month to February corrects it to `28`).
 */
function getDaysInMonth(monthBuffer: string, yearBuffer: string): number {
  if (monthBuffer.length < 2 || yearBuffer.length < 4) return MAX_BY_TYPE.day
  return dayjs(`${yearBuffer}-${monthBuffer}-01`, 'YYYY-MM-DD', true).daysInMonth()
}

/**
 * Only the fixed-width tokens (`YYYY`, `MM`, `DD`) are supported — variable-width tokens
 * (`M`, `D`, `YY`) would make segment char offsets depend on the typed value, which the
 * single-input `setSelectionRange` approach below can't express. Covers the common formats;
 * revisit if a consumer needs `YY`/`M`/`D`.
 */
function parseFormat(format: string): FormatSegment[] {
  const segments: FormatSegment[] = []
  let i = 0
  let charStart = 0
  while (i < format.length) {
    const ch = format[i]
    if (ch === 'Y' || ch === 'M' || ch === 'D') {
      let j = i
      while (j < format.length && format[j] === ch) j++
      const width = j - i
      const type: DateFieldSegmentType = ch === 'Y' ? 'year' : ch === 'M' ? 'month' : 'day'
      segments.push({ type, width, charStart })
      charStart += width
      i = j
    } else {
      let j = i
      while (j < format.length && format[j] !== 'Y' && format[j] !== 'M' && format[j] !== 'D') j++
      const text = format.slice(i, j)
      segments.push({ type: 'literal', text, charStart })
      charStart += text.length
      i = j
    }
  }
  return segments
}

type Buffers = Record<DateFieldSegmentType, string>
const EMPTY_BUFFERS: Buffers = { day: '', month: '', year: '' }

export function useDateFieldState({
  value,
  defaultValue = null,
  onChange,
  format,
  minDate,
  maxDate,
  isDateInvalid,
}: {
  value?: Date | null
  defaultValue?: Date | null
  onChange?: (date: Date | null) => void
  format: string
  minDate?: Date
  maxDate?: Date
  isDateInvalid?: (date: Date) => boolean
}) {
  const segments = useMemo(() => parseFormat(format), [format])
  const numericSegments = useMemo(
    () => segments.filter((s): s is NumericFormatSegment => s.type !== 'literal'),
    [segments]
  )
  const numericRanges = useMemo(
    () => numericSegments.map((s) => ({ start: s.charStart, end: s.charStart + s.width })),
    [numericSegments]
  )

  const [date, setDate] = useControllableState<Date | null>({ value, defaultValue, onChange })
  const [buffers, setBuffers] = useState<Buffers>(EMPTY_BUFFERS)
  const [invalid, setInvalid] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const freshEntryRef = useRef(true)
  const inputRef = useRef<HTMLInputElement>(null)
  // The last date this hook emitted itself, and the date seen on the previous render.
  const [lastEmitted, setLastEmitted] = useState<Date | null>(null)
  const [prevDate, setPrevDate] = useState<Date | null>(null)

  // Re-derive segment buffers whenever the controlled/uncontrolled date changes from
  // outside a keystroke we just committed ourselves (guarded by `lastEmitted`). Done
  // during render (React's "adjust state when a prop changes" pattern) rather than in
  // an effect, so the field never paints one frame with stale segments.
  if (date !== prevDate) {
    setPrevDate(date)
    if (date !== lastEmitted) {
      setLastEmitted(date)
      if (date) {
        const d = dayjs(date)
        setBuffers({
          day: String(d.date()).padStart(2, '0'),
          month: String(d.month() + 1).padStart(2, '0'),
          year: String(d.year()).padStart(4, '0'),
        })
        setInvalid(
          (minDate !== undefined && date < minDate) ||
            (maxDate !== undefined && date > maxDate) ||
            (isDateInvalid?.(date) ?? false)
        )
      } else {
        setBuffers(EMPTY_BUFFERS)
        setInvalid(false)
      }
    }
  }

  const commit = useCallback(
    (rawNext: Buffers) => {
      let next = rawNext
      if (next.day.length === 2 && next.month.length === 2 && next.year.length === 4) {
        const maxDay = getDaysInMonth(next.month, next.year)
        if (parseInt(next.day, 10) > maxDay) {
          next = { ...next, day: String(maxDay).padStart(2, '0') }
        }
      }
      setBuffers(next)
      const allFilled = numericSegments.every((s) => next[s.type].length === s.width)
      const nextDate = allFilled
        ? (() => {
            const raw = segments.map((s) => (s.type === 'literal' ? s.text : next[s.type])).join('')
            const parsed = dayjs(raw, format, true)
            return parsed.isValid() ? parsed.toDate() : null
          })()
        : null
      setLastEmitted(nextDate)
      setDate(nextDate)
      // A date can be well-formed but still outside the allowed range — flagged for
      // display (aria-invalid), never blocked at typing time (matches MUI's own
      // DateField, which lets you type freely and shows the error after the fact).
      setInvalid(
        nextDate !== null &&
          ((minDate !== undefined && nextDate < minDate) ||
            (maxDate !== undefined && nextDate > maxDate) ||
            (isDateInvalid?.(nextDate) ?? false))
      )
    },
    [numericSegments, segments, format, setDate, minDate, maxDate, isDateInvalid]
  )

  const moveToIndex = useCallback(
    (idx: number) => {
      setActiveIndex(Math.max(0, Math.min(numericSegments.length - 1, idx)))
      freshEntryRef.current = true
    },
    [numericSegments.length]
  )

  const handleDigit = useCallback(
    (digit: string) => {
      const seg = numericSegments[activeIndex]
      if (!seg) return
      const existing = freshEntryRef.current ? '' : buffers[seg.type]
      // Segment's already full (typically the last segment, since every other one
      // auto-advances away on completion) and the user hasn't re-navigated into it —
      // ignore further digits instead of growing the buffer past its fixed width.
      if (!freshEntryRef.current && existing.length >= seg.width) return
      const next = existing + digit
      // Deliberately the static 31, not `getDaysInMonth` — while actively typing, month/year
      // may still hold a stale value from a previous complete date the user is in the middle
      // of overwriting (e.g. re-typing from Home after a full date already stood there), which
      // would otherwise clamp/advance the day early against the wrong month. `commit()` below
      // is the single source of truth for the real month-aware clamp, applied once day+month
      // +year all agree on a fully re-typed value.
      const max = MAX_BY_TYPE[seg.type]

      const finalizeAndAdvance = (raw: string) => {
        let num = parseInt(raw, 10)
        if (seg.type !== 'year') num = Math.min(Math.max(num, 1), max)
        const padded = String(num).padStart(seg.width, '0')
        commit({ ...buffers, [seg.type]: padded })
        freshEntryRef.current = false
        if (activeIndex < numericSegments.length - 1) moveToIndex(activeIndex + 1)
      }

      if (next.length >= seg.width) {
        finalizeAndAdvance(next)
        return
      }
      const asNum = parseInt(next, 10)
      if (seg.type !== 'year' && asNum * 10 > max) {
        finalizeAndAdvance(next)
        return
      }
      commit({ ...buffers, [seg.type]: next })
      freshEntryRef.current = false
    },
    [activeIndex, buffers, numericSegments, commit, moveToIndex]
  )

  const step = useCallback(
    (delta: number) => {
      const seg = numericSegments[activeIndex]
      if (!seg) return
      const today = new Date()
      const currentRaw = buffers[seg.type]
      const current = currentRaw
        ? parseInt(currentRaw, 10)
        : seg.type === 'day'
          ? today.getDate()
          : seg.type === 'month'
            ? today.getMonth() + 1
            : today.getFullYear()
      const max = seg.type === 'day' ? getDaysInMonth(buffers.month, buffers.year) : MAX_BY_TYPE[seg.type]
      let next = current + delta
      if (next > max) next = 1
      if (next < 1) next = max
      commit({ ...buffers, [seg.type]: String(next).padStart(seg.width, '0') })
      freshEntryRef.current = true
    },
    [activeIndex, buffers, numericSegments, commit]
  )

  const handleBackspace = useCallback(() => {
    const seg = numericSegments[activeIndex]
    if (!seg) return
    if (buffers[seg.type]) {
      commit({ ...buffers, [seg.type]: '' })
      freshEntryRef.current = true
      return
    }
    if (activeIndex > 0) {
      const prevSeg = numericSegments[activeIndex - 1]
      commit({ ...buffers, [prevSeg.type]: '' })
      moveToIndex(activeIndex - 1)
    }
  }, [activeIndex, buffers, numericSegments, commit, moveToIndex])

  const handlePaste = useCallback(
    (text: string) => {
      const parsed = dayjs(text.trim(), format, true)
      if (!parsed.isValid()) return
      commit({
        day: String(parsed.date()).padStart(2, '0'),
        month: String(parsed.month() + 1).padStart(2, '0'),
        year: String(parsed.year()).padStart(4, '0'),
      })
      moveToIndex(numericSegments.length - 1)
    },
    [format, commit, moveToIndex, numericSegments.length]
  )

  const indexAtChar = useCallback(
    (charIndex: number) => {
      for (let i = 0; i < numericRanges.length; i++) {
        if (charIndex >= numericRanges[i].start && charIndex <= numericRanges[i].end) return i
      }
      return charIndex < (numericRanges[0]?.start ?? 0) ? 0 : numericRanges.length - 1
    },
    [numericRanges]
  )

  // Empty-and-unfocused shows nothing at all (the native `placeholder` below carries the
  // hint instead) — once focused, or once anything's typed, segments render for real:
  // an untouched segment shows its own letters (`DD`), a partially-typed one right-aligns
  // what's typed so far with a leading zero (`1` → `01`, matching a typical odometer-style
  // entry) rather than a trailing letter, which read oddly mid-type (`1D`).
  const allEmpty = numericSegments.every((s) => buffers[s.type] === '')
  const displayValue = useMemo(() => {
    if (allEmpty && !isFocused) return ''
    return segments
      .map((s) => {
        if (s.type === 'literal') return s.text
        const buf = buffers[s.type]
        return buf === '' ? PLACEHOLDER_BY_TYPE[s.type].repeat(s.width) : buf.padStart(s.width, '0')
      })
      .join('')
  }, [segments, buffers, allEmpty, isFocused])

  const placeholderValue = useMemo(
    () =>
      segments
        .map((s) => (s.type === 'literal' ? s.text : PLACEHOLDER_BY_TYPE[s.type].repeat(s.width)))
        .join(''),
    [segments]
  )

  const handleFocus = useCallback(() => setIsFocused(true), [])
  const handleBlur = useCallback(() => setIsFocused(false), [])

  // Keep the native selection pinned to the active segment's character range so the
  // browser's own text-selection highlight doubles as the "active segment" indicator.
  useEffect(() => {
    const el = inputRef.current
    if (!el || document.activeElement !== el) return
    const range = numericRanges[activeIndex]
    if (!range) return
    el.setSelectionRange(range.start, range.end)
  }, [activeIndex, displayValue, numericRanges])

  return {
    displayValue,
    placeholderValue,
    invalid,
    activeIndex,
    numericSegmentCount: numericSegments.length,
    inputRef,
    moveToIndex,
    step,
    handleDigit,
    handleBackspace,
    handlePaste,
    handleFocus,
    handleBlur,
    indexAtChar,
  }
}
