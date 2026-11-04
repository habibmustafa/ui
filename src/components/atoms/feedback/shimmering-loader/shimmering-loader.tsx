import { forwardRef, type CSSProperties } from 'react'

import { cn } from '../../../../lib/utils'
import { Card } from '../../layout/card'
import {
  Table,
} from '../../data-display/table'

export interface ShimmeringLoaderProps {
  className?: string
  style?: CSSProperties
  delayIndex?: number
  animationDelay?: number
}

export const ShimmeringLoader = forwardRef<HTMLDivElement, ShimmeringLoaderProps>(
  ({ className, style, delayIndex = 0, animationDelay = 150 }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('shimmering-loader rounded-sm py-3', className)}
        style={{
          ...style,
          animationFillMode: 'backwards',
          animationDelay: `${delayIndex * animationDelay}ms`,
        }}
      />
    )
  }
)
ShimmeringLoader.displayName = 'ShimmeringLoader'

interface GenericSkeletonLoaderProps {
  className?: string
}

export const GenericSkeletonLoader = ({ className }: GenericSkeletonLoaderProps) => (
  <div className={cn(className, 'space-y-2')}>
    <ShimmeringLoader />
    <ShimmeringLoader className="w-3/4" />
    <ShimmeringLoader className="w-1/2" />
  </div>
)

interface GenericSelectionSkeletonLoaderProps extends GenericSkeletonLoaderProps {
  // Selection primitives have different row indicators: command lists have none, Select uses
  // radio circles, and MultiSelector uses checkboxes.
  variant?: 'command' | 'multi-select' | 'select'
}

export const GenericSelectionSkeletonLoader = ({
  className,
  variant = 'multi-select',
}: GenericSelectionSkeletonLoaderProps) => {
  const hasIndicator = variant !== 'command'
  const isSelect = variant === 'select'

  return (
    <div className={cn(className, 'flex flex-col')} aria-hidden="true">
      {['w-2/3', 'w-1/2', 'w-3/4'].map((width, index) => (
        <div
          key={width}
          className={cn('flex items-center px-2', isSelect ? 'h-8 gap-2.5' : 'h-7 gap-2')}
        >
          {hasIndicator && (
            <ShimmeringLoader
              className={cn(
                'shrink-0 py-0',
                isSelect ? 'h-3.5 w-3.5 rounded-full' : 'h-4 w-4 rounded-sm'
              )}
              delayIndex={index}
            />
          )}
          <ShimmeringLoader className={cn('h-3 py-0', width)} delayIndex={index} />
        </div>
      ))}
    </div>
  )
}

export const GenericTableLoader = ({
  headers = [],
  numRows = 3,
}: {
  headers?: (string | null)[]
  numRows?: number
}) => {
  return (
    <Card.Root>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            {headers.length === 0 ? (
              <Table.Head />
            ) : (
              headers.map((h, i) => <Table.Head key={`${h}_${i}`}>{h}</Table.Head>)
            )}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {new Array(numRows).fill(0).map((_, i) => (
            <Table.Row key={`row_${i}`}>
              <Table.Cell colSpan={headers.length}>
                <ShimmeringLoader />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Card.Root>
  )
}
