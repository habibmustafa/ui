'use client'

import * as React from 'react'

import { cn } from '../../../../lib/utils'

/*
 * Analog clock face in the style of MUI's TimeClock: numbers around a dial, a hand that
 * points at the current value, click or drag anywhere on the face to pick. In 24-hour
 * mode hours use two rings (1–12 outside, 13–23 and 00 inside), as MUI does.
 *
 * Accessibility: the face is a role="slider" (it is a dial over a range), focusable and
 * driven by arrow keys / PageUp / PageDown / Home / End, with the value announced via
 * aria-valuetext. Enter confirms the current view, like releasing the pointer.
 */

export type ClockView = 'hours' | 'minutes' | 'seconds'

// Compact dial (MUI's is 220px): fits a small popover next to a form field.
const SIZE = 200
const CENTER = SIZE / 2
const OUTER_RADIUS = 80
const INNER_RADIUS = 52
const LABEL_SIZE = 28
// The 24-hour inner ring is tighter (12 labels on a smaller circle).
const INNER_LABEL_SIZE = 24

const pad = (n: number) => String(n).padStart(2, '0')

interface ClockFaceProps {
  view: ClockView
  /** Shown value: 1–12 (12-hour) or 0–23 (24-hour) for hours, 0–59 otherwise. */
  value: number | null
  ampm: boolean
  /** Arrow-key step and pointer snapping for minutes. */
  step: number
  /** Called while dragging/stepping (`final` false) and on release / Enter (`final` true). */
  onChange: (value: number, final: boolean) => void
  disabled?: boolean
}

/** Position of a number on the dial: 0° is 12 o'clock, clockwise. */
function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CENTER + radius * Math.sin(rad), y: CENTER - radius * Math.cos(rad) }
}

export function ClockFace({ view, value, ampm, step, onChange, disabled }: ClockFaceProps) {
  const faceRef = React.useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = React.useState(false)

  const isHours = view === 'hours'
  const twoRings = isHours && !ampm

  // Value <-> geometry
  const angleOf = (v: number) => (isHours ? (v % 12) * 30 : v * 6)
  const radiusOf = (v: number) => (twoRings && (v === 0 || v > 12) ? INNER_RADIUS : OUTER_RADIUS)

  const min = isHours ? (ampm ? 1 : 0) : 0
  const max = isHours ? (ampm ? 12 : 23) : 59
  const keyStep = isHours ? 1 : step

  const valueFromPoint = (clientX: number, clientY: number) => {
    const rect = faceRef.current!.getBoundingClientRect()
    const dx = clientX - rect.left - (rect.width / SIZE) * CENTER
    const dy = clientY - rect.top - (rect.height / SIZE) * CENTER
    let angle = (Math.atan2(dx, -dy) * 180) / Math.PI
    if (angle < 0) angle += 360
    if (isHours) {
      const slot = Math.round(angle / 30) % 12 // 0 = top
      if (ampm) return slot === 0 ? 12 : slot
      const distance = Math.hypot(dx, dy) / (rect.width / SIZE)
      const inner = distance < (OUTER_RADIUS + INNER_RADIUS) / 2
      if (inner) return slot === 0 ? 0 : slot + 12
      return slot === 0 ? 12 : slot
    }
    const minute = Math.round(angle / 6) % 60
    return (Math.round(minute / step) * step) % 60
  }

  const handlePointer = (event: React.PointerEvent, final: boolean) => {
    if (disabled) return
    onChange(valueFromPoint(event.clientX, event.clientY), final)
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return
    const current = value ?? min
    const wrap = (n: number) => (n > max ? min + (n - max - 1) : n < min ? max - (min - n - 1) : n)
    let next: number | null = null
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        next = wrap(current + keyStep)
        break
      case 'ArrowDown':
      case 'ArrowLeft':
        next = wrap(current - keyStep)
        break
      case 'PageUp':
        next = wrap(current + (isHours ? 3 : 5))
        break
      case 'PageDown':
        next = wrap(current - (isHours ? 3 : 5))
        break
      case 'Home':
        next = min
        break
      case 'End':
        next = isHours ? max : Math.floor(max / keyStep) * keyStep
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        onChange(current, true)
        return
    }
    if (next !== null) {
      event.preventDefault()
      onChange(next, false)
    }
  }

  // Labels: hours 1–12 (+ 13–23, 00 on the inner ring in 24h); minutes every 5.
  const labels: { v: number; text: string }[] = isHours
    ? [
        ...Array.from({ length: 12 }, (_, i) => ({
          v: i === 0 ? 12 : i,
          text: String(i === 0 ? 12 : i),
        })),
        ...(twoRings
          ? Array.from({ length: 12 }, (_, i) => ({
              v: i === 0 ? 0 : i + 12,
              text: i === 0 ? '00' : String(i + 12),
            }))
          : []),
      ]
    : Array.from({ length: 12 }, (_, i) => ({ v: i * 5, text: pad(i * 5) }))

  const handAngle = value === null ? 0 : angleOf(value)
  const handLength = value === null ? OUTER_RADIUS : radiusOf(value)
  // A minute that isn't on a label gets a small dot at the hand's tip instead.
  const onLabel = value !== null && labels.some((label) => label.v === value)

  const unit = view === 'hours' ? 'hours' : view === 'minutes' ? 'minutes' : 'seconds'

  return (
    <div
      ref={faceRef}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={`Select ${unit}`}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value ?? undefined}
      aria-valuetext={value === null ? 'Not set' : `${pad(value)} ${unit}`}
      aria-disabled={disabled || undefined}
      onKeyDown={onKeyDown}
      onPointerDown={(event) => {
        if (disabled) return
        event.currentTarget.setPointerCapture?.(event.pointerId)
        setDragging(true)
        handlePointer(event, false)
      }}
      onPointerMove={(event) => {
        if (dragging) handlePointer(event, false)
      }}
      onPointerUp={(event) => {
        if (!dragging) return
        setDragging(false)
        handlePointer(event, true)
      }}
      onPointerCancel={() => setDragging(false)}
      className="relative mx-auto touch-none select-none rounded-full bg-surface-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      style={{ width: SIZE, height: SIZE }}
    >
      {/* Centre pin */}
      <span
        aria-hidden="true"
        className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-default"
        style={{ left: CENTER, top: CENTER }}
      />
      {/* Hand: rotates around the centre; eases between values except while dragging. */}
      {value !== null && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute w-0.5 origin-bottom bg-brand-default',
            !dragging && 'transition-[transform,height,top] duration-300 ease-soft-out'
          )}
          style={{
            left: CENTER,
            top: CENTER - handLength,
            height: handLength,
            transform: `translateX(-50%) rotate(${handAngle}deg)`,
          }}
        >
          {!onLabel && (
            <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border-2 border-brand-default bg-surface-200" />
          )}
        </span>
      )}
      {labels.map(({ v, text }) => {
        const { x, y } = polar(angleOf(v), radiusOf(v))
        const selected = v === value
        const inner = radiusOf(v) === INNER_RADIUS
        const size = inner ? INNER_LABEL_SIZE : LABEL_SIZE
        return (
          <span
            key={v}
            aria-hidden="true"
            className={cn(
              'absolute flex items-center justify-center rounded-full tabular-nums transition-colors duration-200',
              inner ? 'text-[11px] text-foreground-light' : 'text-[13px] text-foreground',
              selected && 'bg-primary-solid font-medium text-white'
            )}
            style={{
              width: size,
              height: size,
              left: x - size / 2,
              top: y - size / 2,
            }}
          >
            {text}
          </span>
        )
      })}
    </div>
  )
}
