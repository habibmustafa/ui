import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { Slot as SlotPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '../../../../lib/utils'
import { buttonVariants } from '../../actions/button'

/*
 * Compound parts follow shadcn/ui's Pagination anatomy (nav > ul > li > a), styled with
 * this library's Button variants: `text` for idle pages, `default` (bordered) for the
 * current one. Links render <a> by default; pass `asChild` to use a router link, or
 * `as="button"` for client-side paging without URLs.
 */

// Square-ish page buttons at every size: min width = the Button height for that size.
const MIN_WIDTH = {
  tiny: 'min-w-[26px] px-2',
  small: 'min-w-[34px] px-2.5',
  medium: 'min-w-[38px] px-3',
} as const

export type PaginationRootProps = React.ComponentPropsWithoutRef<'nav'>

const PaginationRoot = React.forwardRef<HTMLElement, PaginationRootProps>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  )
)
PaginationRoot.displayName = 'PaginationRoot'

export type PaginationContentProps = React.ComponentPropsWithoutRef<'ul'>

const PaginationContent = React.forwardRef<HTMLUListElement, PaginationContentProps>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn('flex flex-row items-center gap-1', className)} {...props} />
  )
)
PaginationContent.displayName = 'PaginationContent'

export type PaginationItemProps = React.ComponentPropsWithoutRef<'li'>

const PaginationItem = React.forwardRef<HTMLLIElement, PaginationItemProps>((props, ref) => (
  <li ref={ref} {...props} />
))
PaginationItem.displayName = 'PaginationItem'

type PaginationLinkOwnProps = {
  /** Marks the current page: bordered style and `aria-current="page"`. */
  isActive?: boolean
  /** Merge onto a child element (e.g. a router `<Link>`) instead of rendering `<a>`. */
  asChild?: boolean
  /** Render a `<button>` instead of `<a>` — for paging without URLs. @default "a" */
  as?: 'a' | 'button'
  /** @default "tiny" */
  size?: 'tiny' | 'small' | 'medium'
}

export type PaginationLinkProps = PaginationLinkOwnProps &
  Omit<React.ComponentPropsWithoutRef<'a'>, 'type'> &
  Pick<React.ComponentPropsWithoutRef<'button'>, 'type' | 'disabled'>

const PaginationLink = React.forwardRef<HTMLAnchorElement & HTMLButtonElement, PaginationLinkProps>(
  ({ className, isActive, asChild, as = 'a', size = 'tiny', disabled, type, ...props }, ref) => {
    // Polymorphic <a>/<button>/Slot; the shared props are valid on each.
    const Comp: React.ElementType = asChild ? SlotPrimitive.Slot : as
    return (
      <Comp
        ref={ref}
        // An <a> without href (a disabled Previous/Next) has no implicit link role.
        role={Comp === 'a' && props.href === undefined ? 'link' : undefined}
        aria-current={isActive ? 'page' : undefined}
        data-active={isActive ? '' : undefined}
        // A disabled <a> isn't a thing; aria-disabled + no pointer events stands in for it.
        aria-disabled={disabled && Comp !== 'button' ? true : undefined}
        disabled={Comp === 'button' ? disabled : undefined}
        type={Comp === 'button' ? (type ?? 'button') : undefined}
        className={cn(
          buttonVariants({ variant: isActive ? 'default' : 'text', size }),
          MIN_WIDTH[size],
          'justify-center tabular-nums',
          disabled && 'pointer-events-none opacity-50',
          className
        )}
        {...props}
      />
    )
  }
)
PaginationLink.displayName = 'PaginationLink'

export type PaginationPreviousProps = PaginationLinkProps & { label?: React.ReactNode }

const PaginationPrevious = React.forwardRef<
  HTMLAnchorElement & HTMLButtonElement,
  PaginationPreviousProps
>(({ className, label = 'Previous', ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to previous page"
    className={cn('gap-1 px-2', className)}
    {...props}
  >
    <ChevronLeft aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
    {label != null && <span>{label}</span>}
  </PaginationLink>
))
PaginationPrevious.displayName = 'PaginationPrevious'

export type PaginationNextProps = PaginationLinkProps & { label?: React.ReactNode }

const PaginationNext = React.forwardRef<HTMLAnchorElement & HTMLButtonElement, PaginationNextProps>(
  ({ className, label = 'Next', ...props }, ref) => (
    <PaginationLink
      ref={ref}
      aria-label="Go to next page"
      className={cn('gap-1 px-2', className)}
      {...props}
    >
      {label != null && <span>{label}</span>}
      <ChevronRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
    </PaginationLink>
  )
)
PaginationNext.displayName = 'PaginationNext'

export type PaginationEllipsisProps = React.ComponentPropsWithoutRef<'span'>

const PaginationEllipsis = ({ className, ...props }: PaginationEllipsisProps) => (
  <span
    aria-hidden="true"
    className={cn('flex h-[26px] w-[26px] items-center justify-center text-foreground-lighter', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
  </span>
)
PaginationEllipsis.displayName = 'PaginationEllipsis'

export {
  PaginationRoot,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
