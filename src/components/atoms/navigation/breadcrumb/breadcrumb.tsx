/*
 * Hybrid API layer (docs/hybrid-api-migration.md) for Breadcrumb — Strategy A, discriminator
 * `items`. Not present upstream; follows the same shape as DropdownMenu/Select's flat
 * `items`/`options` props.
 */
import { ChevronDown } from 'lucide-react'
import * as React from 'react'

import {
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbRoot,
  BreadcrumbSeparator,
} from './breadcrumb-parts'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '../../overlay/dropdown-menu'
import {
  Drawer,
} from '../../overlay/drawer'
import { Button } from '../../actions/button'
import { useIsMobile } from '../sidebar/use-mobile'
import { useLabels } from '../../../../providers/locale-provider'

type RootProps = React.ComponentPropsWithoutRef<typeof BreadcrumbRoot>

export interface BreadcrumbItemData {
  label: React.ReactNode
  /** Omit on the current page — it renders as non-interactive text. */
  href?: string
  /** Renders a static, non-interactive BreadcrumbEllipsis instead of `label`/`href`. */
  ellipsis?: boolean
  /** Renders `label` as a DropdownMenu trigger instead of a link; each entry is a menu item. */
  menuItems?: { label: React.ReactNode; onSelect?: () => void }[]
}

type BreadcrumbItemsModeProps = Omit<RootProps, 'children'> & {
  items: BreadcrumbItemData[]
  /** Overrides the default chevron between items, e.g. `<Slash />`. */
  separator?: React.ReactNode
  /**
   * Collapses the middle items behind an ellipsis trigger once `items.length` exceeds this —
   * keeps the first item and the last `maxItems - 2`. Omit to never collapse.
   */
  maxItems?: number
  /**
   * How the collapsed items open. `"dropdown"` always uses a DropdownMenu; `"responsive"`
   * switches to a bottom Drawer under 768px, matching upstream's own breadcrumb-responsive.
   * @default "dropdown"
   */
  overflow?: 'dropdown' | 'responsive'
  children?: never
}

type BreadcrumbCompoundProps = RootProps & { items?: never }

export type BreadcrumbProps = BreadcrumbItemsModeProps | BreadcrumbCompoundProps

function BreadcrumbItemContent({
  item,
  isLast,
}: {
  item: BreadcrumbItemData
  isLast: boolean
}) {
  if (item.ellipsis) return <BreadcrumbEllipsis />

  if (item.menuItems) {
    return (
      <DropdownMenuRoot>
        <DropdownMenuTrigger className="flex items-center gap-1 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5">
          {item.label}
          <ChevronDown />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {item.menuItems.map((menuItem, index) => (
            <DropdownMenuItem key={index} onSelect={menuItem.onSelect}>
              {menuItem.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenuRoot>
    )
  }

  return item.href && !isLast ? (
    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
  ) : (
    <BreadcrumbPage>{item.label}</BreadcrumbPage>
  )
}

/** The ellipsis trigger for collapsed items: a DropdownMenu, or a Drawer under 768px in "responsive" mode. */
function BreadcrumbOverflowTrigger({
  items,
  overflow,
}: {
  items: BreadcrumbItemData[]
  overflow: 'dropdown' | 'responsive'
}) {
  const isMobile = useIsMobile()
  const labels = useLabels()

  if (overflow === 'responsive' && isMobile) {
    return (
      <Drawer.Root>
        <Drawer.Trigger aria-label={labels.toggleMenu}>
          <BreadcrumbEllipsis className="h-4 w-4" />
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Header className="text-left">
            <Drawer.Title>{labels.breadcrumbNavigateTitle}</Drawer.Title>
            <Drawer.Description>{labels.breadcrumbNavigate}</Drawer.Description>
          </Drawer.Header>
          <div className="grid gap-1 px-4">
            {items.map((item, index) =>
              item.href ? (
                <a key={index} href={item.href} className="py-1 text-sm">
                  {item.label}
                </a>
              ) : (
                <span key={index} className="py-1 text-sm">
                  {item.label}
                </span>
              )
            )}
          </div>
          <Drawer.Footer className="pt-4">
            <Drawer.Close asChild>
              <Button variant="outline">{labels.close}</Button>
            </Drawer.Close>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer.Root>
    )
  }

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger className="flex items-center gap-1" aria-label={labels.toggleMenu}>
        <BreadcrumbEllipsis className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {items.map((item, index) =>
          item.href ? (
            <DropdownMenuItem key={index} asChild>
              <a href={item.href}>{item.label}</a>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem key={index}>{item.label}</DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  )
}

export function BreadcrumbHybrid(props: BreadcrumbProps) {
  if (props.items === undefined) {
    return <BreadcrumbRoot {...props} />
  }

  const { items, separator, maxItems, overflow = 'dropdown', ...rootProps } = props

  const collapse = maxItems !== undefined && items.length > maxItems && maxItems >= 3
  const tailCount = Math.max(maxItems ? maxItems - 2 : 0, 1)
  const overflowItems = collapse ? items.slice(1, items.length - tailCount) : []
  const visibleItems = collapse
    ? [items[0], { ellipsis: true as const, label: null }, ...items.slice(-tailCount)]
    : items

  return (
    <BreadcrumbRoot {...rootProps}>
      <BreadcrumbList>
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1

          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {item.ellipsis ? (
                  <BreadcrumbOverflowTrigger items={overflowItems} overflow={overflow} />
                ) : (
                  <BreadcrumbItemContent item={item} isLast={isLast} />
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </BreadcrumbRoot>
  )
}

// Re-exported so consumers building a custom row (e.g. inserting a BreadcrumbEllipsis) can
// still reach for it without dropping into the fully compound API.
export { BreadcrumbEllipsis }
