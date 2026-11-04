/*
 * Hybrid API layer (docs/hybrid-api-migration.md) for ToggleGroup — Strategy A,
 * discriminator `items`. Not present upstream; the compound parts are already a thin
 * styled re-export of Radix, so this mode just maps `items` onto `ToggleGroupItem`s.
 */
import type { ComponentProps, ReactNode } from 'react'

import { ToggleGroupItem, ToggleGroupRoot } from './toggle-group-parts'

type RootProps = ComponentProps<typeof ToggleGroupRoot>

export interface ToggleGroupItemData {
  value: string
  label?: ReactNode
  icon?: ReactNode
  disabled?: boolean
  'aria-label'?: string
  className?: string
}

type ToggleGroupItemsProps = Omit<RootProps, 'children'> & {
  items: readonly ToggleGroupItemData[]
  children?: never
}

type ToggleGroupCompoundProps = RootProps & { items?: never }

export type ToggleGroupProps = ToggleGroupItemsProps | ToggleGroupCompoundProps

export function ToggleGroupHybrid(props: ToggleGroupProps) {
  if (props.items === undefined) {
    return <ToggleGroupRoot {...props} />
  }

  const { items, ...rootProps } = props

  return (
    // `type: 'single' | 'multiple'` discriminates Radix's own props union (different
    // value/onValueChange shapes per branch); `rootProps` here is a plain spread of
    // whichever branch the caller passed, so it's already valid at runtime — TS just
    // can't narrow it back out through the destructure.
    <ToggleGroupRoot {...(rootProps as RootProps)}>
      {items.map((item) => (
        <ToggleGroupItem
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          aria-label={item['aria-label']}
          className={item.className}
        >
          {item.icon}
          {item.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroupRoot>
  )
}
