'use client'

import * as React from 'react'

import { cn } from '../../../../lib/utils'
import { useLabels } from '../../../../providers/locale-provider'
import { encodeQR, qrCapacity, type QRLevel } from './qr-encoder'

/*
 * Renders `value` as a QR code in an SVG: one <path> for all dark modules, so it stays
 * crisp at any size and prints well. Colors default to black on white on purpose: scanners
 * need dark-on-light contrast, so the code does not follow the theme. Input that does not
 * fit (see `qrCapacity`) renders `fallback` and calls `onError` instead of throwing.
 */

export type { QRLevel }
export { qrCapacity }

export interface QRCodeProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'children' | 'values' | 'onError'> {
  /** The text to encode, UTF-8. A URL is the common case. */
  value: string
  /** Width and height in px. @default 160 */
  size?: number
  /** Error correction: L ~7%, M ~15%, Q ~25%, H ~30% of the code can be damaged. @default "M" */
  level?: QRLevel
  /** Quiet zone around the code, in modules. Scanners want 4. @default 4 */
  margin?: number
  /** Dark module color. @default "#000" */
  color?: string
  /** Background (and quiet zone) color. @default "#fff" */
  background?: string
  /** Accessible name. @default "QR code" */
  label?: string
  /** Rendered when `value` is too long to encode. */
  fallback?: React.ReactNode
  onError?: (error: Error) => void
}

const QRCode = React.forwardRef<SVGSVGElement, QRCodeProps>(
  (
    {
      value,
      size = 160,
      level = 'M',
      margin = 4,
      color = '#000',
      background = '#fff',
      label,
      fallback,
      onError,
      className,
      ...props
    },
    ref
  ) => {
    const labels = useLabels()
    const result = React.useMemo(() => {
      try {
        return { matrix: encodeQR(value, level), error: null }
      } catch (error) {
        return { matrix: null, error: error as Error }
      }
    }, [value, level])

    const onErrorRef = React.useRef(onError)
    React.useLayoutEffect(() => {
      onErrorRef.current = onError
    })
    React.useEffect(() => {
      if (result.error) onErrorRef.current?.(result.error)
    }, [result.error])

    if (!result.matrix) return <>{fallback ?? null}</>

    const { matrix } = result
    const n = matrix.length
    const total = n + margin * 2

    // One rectangle per horizontal run of dark modules.
    let d = ''
    for (let y = 0; y < n; y++) {
      let x = 0
      while (x < n) {
        if (!matrix[y][x]) {
          x++
          continue
        }
        const start = x
        while (x < n && matrix[y][x]) x++
        d += `M${start + margin} ${y + margin}h${x - start}v1h-${x - start}z`
      }
    }

    return (
      <svg
        ref={ref}
        role="img"
        aria-label={label ?? labels.qrCode}
        viewBox={`0 0 ${total} ${total}`}
        width={size}
        height={size}
        shapeRendering="crispEdges"
        className={cn('shrink-0', className)}
        {...props}
      >
        <rect width={total} height={total} fill={background} />
        <path d={d} fill={color} />
      </svg>
    )
  }
)
QRCode.displayName = 'QRCode'

export { QRCode }
