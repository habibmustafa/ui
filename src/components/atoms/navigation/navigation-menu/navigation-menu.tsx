/*
 * Hybrid API layer (docs/hybrid-api-migration.md) for NavigationMenu — Strategy A,
 * discriminator `items`. An item is a plain link, a panel of links (title + optional
 * description, in one or two columns), or a panel with arbitrary content.
 */
import * as React from 'react'

import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuRoot,
  NavigationMenuTrigger,
  navigationMenuTriggerClasses,
} from './navigation-menu-parts'
import { cn } from '../../../../lib/utils'

export interface NavigationMenuLinkData {
  title: React.ReactNode
  href: string
  description?: React.ReactNode
  active?: boolean
}

export type NavigationMenuItemData =
  | { key: string; label: React.ReactNode; href: string; active?: boolean }
  | {
      key: string
      label: React.ReactNode
      links: readonly NavigationMenuLinkData[]
      /** @default 1, or 2 when there are more than 3 links */
      columns?: 1 | 2
    }
  | { key: string; label: React.ReactNode; content: React.ReactNode }

export interface NavigationMenuClassNames {
  list?: string
  trigger?: string
  content?: string
  link?: string
}

type RootProps = React.ComponentProps<typeof NavigationMenuRoot>

type NavigationMenuItemsProps = Omit<RootProps, 'children'> & {
  items: readonly NavigationMenuItemData[]
  classNames?: NavigationMenuClassNames
  children?: never
}

type NavigationMenuCompoundProps = RootProps & { items?: never }

export type NavigationMenuProps = NavigationMenuItemsProps | NavigationMenuCompoundProps

const COLUMNS = { 1: 'w-72 grid-cols-1', 2: 'w-[30rem] grid-cols-2' } as const

export function NavigationMenuHybrid(props: NavigationMenuProps) {
  if (props.items === undefined) {
    return <NavigationMenuRoot {...props} />
  }

  const { items, classNames, ...rootProps } = props

  return (
    <NavigationMenuRoot {...rootProps}>
      <NavigationMenuList className={classNames?.list}>
        {items.map((item) => {
          if ('href' in item) {
            return (
              <NavigationMenuItem key={item.key}>
                <NavigationMenuLink
                  href={item.href}
                  active={item.active}
                  aria-current={item.active ? 'page' : undefined}
                  className={cn(navigationMenuTriggerClasses, 'flex-row', classNames?.trigger)}
                >
                  {item.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            )
          }
          return (
            <NavigationMenuItem key={item.key}>
              <NavigationMenuTrigger className={classNames?.trigger}>{item.label}</NavigationMenuTrigger>
              <NavigationMenuContent className={classNames?.content}>
                {'links' in item ? (
                  <ul
                    className={cn(
                      'grid max-w-[calc(100vw-2rem)] gap-1',
                      COLUMNS[item.columns ?? (item.links.length > 3 ? 2 : 1)]
                    )}
                  >
                    {item.links.map((link) => (
                      <li key={link.href}>
                        <NavigationMenuLink
                          href={link.href}
                          active={link.active}
                          aria-current={link.active ? 'page' : undefined}
                          className={classNames?.link}
                        >
                          <span className="text-sm text-foreground">{link.title}</span>
                          {link.description != null && (
                            <span className="line-clamp-2 text-xs text-foreground-lighter">
                              {link.description}
                            </span>
                          )}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                ) : (
                  item.content
                )}
              </NavigationMenuContent>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenuRoot>
  )
}
