import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'

import { ComponentPreview } from '../playground/component-preview'
import { COMPONENT_GROUPS } from '../playground/registry'
import { ThemeProvider } from '../src/providers'

const exampleNames = new Set(
  Object.keys(import.meta.glob('../playground/examples/**/*.tsx')).map((path) =>
    path.split('/').pop()!.replace(/\.tsx$/, '')
  )
)

const hybridPageIds = new Set([
  'accordion', 'alert', 'alert-dialog', 'avatar', 'breadcrumb', 'card',
  'collapsible', 'command', 'context-menu', 'dialog', 'drawer', 'dropdown-menu',
  'hover-card', 'input-otp', 'popover', 'radio-group', 'resizable', 'select',
  'sheet', 'table', 'tabs', 'tooltip', 'pagination', 'metric-card', 'multi-select', 'date-picker',
  // 'toggle-group' deliberately excluded: its "Segmented" preview is compound-only
  // (the tone/size demo-loop + controlled state can't be expressed through the
  // `items` props API without faking it).
])

test('every codeVariants preview has both source tabs and a props preview', () => {
  let pairedPreviews = 0
  for (const group of COMPONENT_GROUPS) {
    for (const entry of group.entries) {
      for (const preview of entry.previews) {
        if (hybridPageIds.has(entry.id)) {
          expect(preview.codeVariants, `${entry.id}/${preview.name}`).toBeDefined()
        }
        if (!preview.codeVariants) continue
        pairedPreviews++
        expect(preview.codeVariants.map((variant) => variant.id), preview.name).toEqual([
          'props',
          'compound',
        ])
        expect(preview.name, preview.name).toBe(preview.codeVariants[0].name)
        for (const variant of preview.codeVariants) {
          expect(exampleNames.has(variant.name), variant.name).toBe(true)
        }
      }
    }
  }
  expect(pairedPreviews).toBe(86)
})

test('Preview shows the props variant while source tabs stay separate', async () => {
  const user = userEvent.setup()
  render(
    <ThemeProvider>
      <ComponentPreview
        name="alert-dialog-props-demo"
        codeVariants={[
          { id: 'props', label: 'Props-driven', name: 'alert-dialog-props-demo' },
          { id: 'compound', label: 'Compound', name: 'alert-dialog-demo' },
        ]}
      />
    </ThemeProvider>
  )

  const previewTab = screen.getByRole('tab', { name: 'Preview' })
  const propsTab = screen.getByRole('tab', { name: 'Props-driven' })
  const compoundTab = screen.getByRole('tab', { name: 'Compound' })
  expect(previewTab.getAttribute('aria-selected')).toBe('true')
  // The demo component loads lazily (Suspense) now, so the first render still shows
  // the fallback — wait for the lazy chunk to resolve before asserting on it.
  await waitFor(() =>
    expect(within(screen.getByRole('tabpanel')).getAllByRole('button', { name: 'Show Alert Dialog' })).toHaveLength(1)
  )

  await user.click(propsTab)
  expect(propsTab.getAttribute('aria-selected')).toBe('true')
  await waitFor(() => expect(screen.getByRole('tabpanel').textContent).toContain('<AlertDialog'))
  await user.click(compoundTab)
  expect(compoundTab.getAttribute('aria-selected')).toBe('true')
  await waitFor(() => expect(screen.getByRole('tabpanel').textContent).toContain('<AlertDialog.Root'))
  await user.click(previewTab)
  await waitFor(() =>
    expect(within(screen.getByRole('tabpanel')).getAllByRole('button', { name: 'Show Alert Dialog' })).toHaveLength(1)
  )
})
