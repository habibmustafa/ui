/*
 * Hybrid API layer (docs/hybrid-api-migration.md) for Pagination — Strategy A,
 * discriminator `totalPages`. Not present upstream: the props mode computes the page
 * range (first, last, current ± siblingCount, ellipses between) and composes the parts.
 */
import type * as React from 'react'

import {
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationRoot,
} from './pagination-parts'
import { useControllableState } from '../../../../lib/use-controllable-state'

export type PaginationRangeItem = number | 'ellipsis-start' | 'ellipsis-end'

/**
 * Pages to show for `page` of `totalPages`: always the first and last page, `siblingCount`
 * pages either side of the current one, and an ellipsis wherever pages are skipped. The
 * result has a constant length (`siblingCount * 2 + 5`, or every page when that's fewer),
 * so the control doesn't change width while paging.
 */
export function getPaginationRange(
  page: number,
  totalPages: number,
  siblingCount = 1
): PaginationRangeItem[] {
  const total = Math.max(0, Math.floor(totalPages))
  const slots = siblingCount * 2 + 5
  if (total <= slots) return Array.from({ length: total }, (_, i) => i + 1)

  const current = Math.min(Math.max(1, page), total)
  const left = Math.max(current - siblingCount, 2)
  const right = Math.min(current + siblingCount, total - 1)
  const showStart = left > 3
  const showEnd = right < total - 2
  const edge = siblingCount * 2 + 3

  if (!showStart) {
    return [...Array.from({ length: edge }, (_, i) => i + 1), 'ellipsis-end', total]
  }
  if (!showEnd) {
    return [1, 'ellipsis-start', ...Array.from({ length: edge }, (_, i) => total - edge + 1 + i)]
  }
  return [
    1,
    'ellipsis-start',
    ...Array.from({ length: right - left + 1 }, (_, i) => left + i),
    'ellipsis-end',
    total,
  ]
}

export interface PaginationClassNames {
  content?: string
  item?: string
  link?: string
}

type RootProps = React.ComponentProps<typeof PaginationRoot>

type PaginationPagesProps = Omit<RootProps, 'children' | 'onChange'> & {
  totalPages: number
  /** Current page (1-based), controlled. */
  page?: number
  /** Initial page when uncontrolled. @default 1 */
  defaultPage?: number
  onPageChange?: (page: number) => void
  /** Pages shown either side of the current one. @default 1 */
  siblingCount?: number
  /**
   * Build a URL per page to render real links (crawlable, open-in-new-tab). Omit it to
   * render buttons that only call `onPageChange`.
   */
  getHref?: (page: number) => string
  /** Hide the Previous/Next controls with `false`. @default true */
  showControls?: boolean
  /** Text next to the arrows; `null` for arrow-only controls. */
  previousLabel?: React.ReactNode
  nextLabel?: React.ReactNode
  /** @default "tiny" */
  size?: 'tiny' | 'small' | 'medium'
  classNames?: PaginationClassNames
  children?: never
}

type PaginationCompoundProps = RootProps & { totalPages?: never }

export type PaginationProps = PaginationPagesProps | PaginationCompoundProps

export function PaginationHybrid(props: PaginationProps) {
  const isPagesMode = props.totalPages !== undefined

  // Called unconditionally — rules-of-hooks. Unused in compound mode.
  const [page, setPage] = useControllableState({
    value: isPagesMode ? props.page : undefined,
    defaultValue: isPagesMode ? (props.defaultPage ?? 1) : 1,
    onChange: isPagesMode ? props.onPageChange : undefined,
  })

  if (!isPagesMode) {
    return <PaginationRoot {...props} />
  }

  const {
    totalPages,
    page: _page,
    defaultPage: _defaultPage,
    onPageChange: _onPageChange,
    siblingCount = 1,
    getHref,
    showControls = true,
    previousLabel,
    nextLabel,
    size = 'tiny',
    classNames,
    ...rootProps
  } = props

  const total = Math.max(0, Math.floor(totalPages))
  const current = Math.min(Math.max(1, page), Math.max(1, total))
  const range = getPaginationRange(current, total, siblingCount)

  const linkProps = (target: number, disabled = false) =>
    getHref
      ? {
          href: disabled ? undefined : getHref(target),
          disabled,
          onClick: disabled ? undefined : () => setPage(target),
        }
      : { as: 'button' as const, disabled, onClick: () => setPage(target) }

  return (
    <PaginationRoot {...rootProps}>
      <PaginationContent className={classNames?.content}>
        {showControls && (
          <PaginationItem className={classNames?.item}>
            <PaginationPrevious
              size={size}
              label={previousLabel}
              className={classNames?.link}
              {...linkProps(current - 1, current <= 1)}
            />
          </PaginationItem>
        )}
        {range.map((item) =>
          typeof item === 'number' ? (
            <PaginationItem key={item} className={classNames?.item}>
              <PaginationLink
                size={size}
                isActive={item === current}
                aria-label={`Page ${item}`}
                className={classNames?.link}
                {...linkProps(item)}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ) : (
            <PaginationItem key={item} className={classNames?.item}>
              <PaginationEllipsis />
            </PaginationItem>
          )
        )}
        {showControls && (
          <PaginationItem className={classNames?.item}>
            <PaginationNext
              size={size}
              label={nextLabel}
              className={classNames?.link}
              {...linkProps(current + 1, current >= total)}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </PaginationRoot>
  )
}
