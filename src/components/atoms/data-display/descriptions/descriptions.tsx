import * as React from 'react'

import { cn } from '../../../../lib/utils'

/*
 * Label/value pairs as a definition list (<dl>): profile fields, order details, resource
 * metadata. Items flow into a grid of `columns`; an item can `span` several columns.
 * `layout="vertical"` stacks each label over its value, `bordered` draws a table-like
 * grid. Empty values show `emptyValue` rather than a blank cell.
 */

export interface DescriptionsItem {
  /** Optional stable key; defaults to the index. */
  key?: React.Key
  label: React.ReactNode
  value?: React.ReactNode
  /** Columns this item occupies. @default 1 */
  span?: number
}

export interface DescriptionsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  items: readonly DescriptionsItem[]
  title?: React.ReactNode
  /** Rendered at the right of the title row. */
  extra?: React.ReactNode
  /** @default 3 */
  columns?: 1 | 2 | 3 | 4
  /** @default "horizontal" */
  layout?: 'horizontal' | 'vertical'
  /** Draws borders around every cell. @default false */
  bordered?: boolean
  /** Shown for a missing value. @default "—" */
  emptyValue?: React.ReactNode
  /** Heading level of the title. @default 3 */
  level?: 2 | 3 | 4
  classNames?: { title?: string; item?: string; label?: string; value?: string }
}

const colsClass = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
} as const

// `span` is capped at the column count; a literal map keeps the classes visible to Tailwind.
const spanClass = {
  1: '',
  2: 'sm:col-span-2',
  3: 'sm:col-span-2 lg:col-span-3',
  4: 'sm:col-span-2 lg:col-span-4',
} as const

const isEmpty = (value: React.ReactNode) => value === undefined || value === null || value === ''

const Descriptions = React.forwardRef<HTMLDivElement, DescriptionsProps>(
  (
    {
      items,
      title,
      extra,
      columns = 3,
      layout = 'horizontal',
      bordered = false,
      emptyValue = '—',
      level = 3,
      className,
      classNames,
      ...props
    },
    ref
  ) => {
    const Heading = `h${level}` as const
    const vertical = layout === 'vertical'

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {(title != null || extra != null) && (
          <div className="mb-3 flex items-center justify-between gap-4">
            {title != null && (
              <Heading className={cn('text-sm font-medium text-foreground', classNames?.title)}>
                {title}
              </Heading>
            )}
            {extra != null && <div className="ml-auto">{extra}</div>}
          </div>
        )}
        <dl
          className={cn(
            'grid',
            colsClass[columns],
            bordered ? 'gap-px overflow-hidden rounded-md border bg-border' : 'gap-x-6 gap-y-4'
          )}
        >
          {items.map((item, index) => {
            const span = Math.min(columns, Math.max(1, Math.floor(item.span ?? 1))) as 1 | 2 | 3 | 4
            return (
              <div
                key={item.key ?? index}
                className={cn(
                  'flex min-w-0 text-sm',
                  vertical ? 'flex-col gap-1' : 'items-baseline gap-3',
                  bordered && 'bg-background px-4 py-3',
                  spanClass[span],
                  classNames?.item
                )}
              >
                <dt
                  className={cn(
                    'shrink-0 text-foreground-lighter',
                    !vertical && 'min-w-24',
                    classNames?.label
                  )}
                >
                  {item.label}
                </dt>
                <dd className={cn('min-w-0 break-words text-foreground', classNames?.value)}>
                  {isEmpty(item.value) ? (
                    <span className="text-foreground-muted">{emptyValue}</span>
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            )
          })}
        </dl>
      </div>
    )
  }
)
Descriptions.displayName = 'Descriptions'

export { Descriptions }
