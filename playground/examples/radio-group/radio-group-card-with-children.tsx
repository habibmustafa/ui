/*
 * Upstream's demo illustrates each option with a theme-preview SVG fetched from
 * the upstream docs' own static asset host (`${BASE_PATH}/img/themes/<value>.svg`, via
 * react-inlinesvg) — not available here, so this uses a lucide icon per option
 * instead. RadioGroupCardItem's `children` slot and markup are unchanged.
 */
import { Monitor, Moon, Sun } from 'lucide-react'

import { RadioGroupCard } from '../../../src'

const singleThemes = [
  { name: 'Dark', value: 'dark', icon: Moon },
  { name: 'Light', value: 'light', icon: Sun },
  { name: 'System', value: 'system', icon: Monitor },
] as const

export default function RadioGroupCardWithChildren() {
  return (
    <RadioGroupCard.Root defaultValue="dark" className="flex flex-wrap gap-3" aria-label="Theme">
      {singleThemes.map((theme) => {
        const Icon = theme.icon
        return (
          <RadioGroupCard.Item key={theme.value} value={theme.value} label={theme.name}>
            <Icon className="h-8 w-8 text-foreground-light" />
          </RadioGroupCard.Item>
        )
      })}
    </RadioGroupCard.Root>
  )
}
