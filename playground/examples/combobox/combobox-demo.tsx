import { useState } from 'react'

import { Combobox } from '../../../src'

const frameworks = [
  { value: 'next', label: 'Next.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'gatsby', label: 'Gatsby', disabled: true },
]

export default function ComboboxDemo() {
  const [value, setValue] = useState<string | null>(null)

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Combobox
        aria-label="Framework"
        options={frameworks}
        value={value}
        onValueChange={setValue}
        placeholder="Select a framework…"
        searchPlaceholder="Search frameworks…"
        clearable
      />
      <p className="text-xs text-foreground-lighter">Selected: {value ?? 'none'}</p>
    </div>
  )
}
