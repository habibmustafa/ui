// Menubar and NavigationMenu (props modes).
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'

import { Menubar } from '../src/components/atoms/navigation/menubar'
import { NavigationMenu } from '../src/components/atoms/navigation/navigation-menu'

function renderMenubar(handlers: { onNew?: () => void; onStatusBar?: (v: boolean) => void } = {}) {
  return render(
    <Menubar
      menus={[
        {
          key: 'file',
          label: 'File',
          items: [
            { key: 'new', label: 'New tab', shortcut: '⌘T', onSelect: handlers.onNew },
            { key: 'locked', label: 'Locked', disabled: true },
          ],
        },
        {
          key: 'view',
          label: 'View',
          items: [
            {
              type: 'checkbox',
              key: 'status',
              label: 'Status bar',
              checked: false,
              onCheckedChange: handlers.onStatusBar ?? (() => {}),
            },
          ],
        },
      ]}
    />
  )
}

test('Menubar renders a menubar of triggers and opens a menu', async () => {
  const user = userEvent.setup()
  const onNew = vi.fn()
  renderMenubar({ onNew })

  const bar = screen.getByRole('menubar')
  expect(bar).toBeTruthy()
  await user.click(screen.getByRole('menuitem', { name: 'File' }))
  expect(await screen.findByRole('menu')).toBeTruthy()
  expect(screen.getByText('⌘T')).toBeTruthy()
  expect(screen.getByRole('menuitem', { name: 'Locked' }).getAttribute('data-disabled')).not.toBeNull()

  await user.click(screen.getByRole('menuitem', { name: /New tab/ }))
  expect(onNew).toHaveBeenCalledTimes(1)
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
})

test('Menubar arrow keys move between top-level menus', async () => {
  const user = userEvent.setup()
  const onStatusBar = vi.fn()
  renderMenubar({ onStatusBar })

  await user.click(screen.getByRole('menuitem', { name: 'File' }))
  await screen.findByRole('menu')
  await user.keyboard('{ArrowRight}')
  const checkbox = await screen.findByRole('menuitemcheckbox', { name: 'Status bar' })
  await user.click(checkbox)
  expect(onStatusBar).toHaveBeenCalledWith(true)
})

test('NavigationMenu renders plain links and opens link panels', async () => {
  const user = userEvent.setup()
  render(
    <NavigationMenu
      items={[
        {
          key: 'product',
          label: 'Product',
          links: [
            { title: 'Database', href: '#db', description: 'Postgres' },
            { title: 'Auth', href: '#auth', active: true },
          ],
        },
        { key: 'pricing', label: 'Pricing', href: '/pricing', active: true },
      ]}
    />
  )

  const nav = screen.getByRole('navigation')
  expect(nav).toBeTruthy()
  const pricing = screen.getByRole('link', { name: 'Pricing' })
  expect(pricing.getAttribute('href')).toBe('/pricing')
  expect(pricing.getAttribute('aria-current')).toBe('page')

  const trigger = screen.getByRole('button', { name: 'Product' })
  expect(trigger.getAttribute('aria-expanded')).toBe('false')
  await user.click(trigger)
  expect(trigger.getAttribute('aria-expanded')).toBe('true')
  const database = await screen.findByRole('link', { name: /Database/ })
  expect(database.getAttribute('href')).toBe('#db')
  expect(screen.getByRole('link', { name: 'Auth' }).getAttribute('aria-current')).toBe('page')

  await user.keyboard('{Escape}')
  await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('false'))
})
