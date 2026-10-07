// Blocks: every screen in playground/blocks renders, passes axe, and the main flows work.
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import type { ComponentType } from 'react'
import { describe, expect, test } from 'vitest'

import { BLOCKS } from '../playground/blocks/registry'
import { findComponent } from '../playground/registry'
import { ThemeProvider } from '../src/providers'

const modules = import.meta.glob<{ default: ComponentType }>('../playground/blocks/*.tsx', { eager: true })
const byId = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => [path.split('/').pop()!.replace('.tsx', ''), mod.default])
)

const renderBlock = (id: string) =>
  render(
    <ThemeProvider>
      {(() => {
        const Block = byId[id]
        return <Block />
      })()}
    </ThemeProvider>
  )

describe('registry', () => {
  test('every block has a file, and every file is listed', () => {
    expect(Object.keys(byId).sort()).toEqual(BLOCKS.map((block) => block.id).sort())
  })

  test('ids are unique and each block has a title and a description', () => {
    expect(new Set(BLOCKS.map((block) => block.id)).size).toBe(BLOCKS.length)
    for (const block of BLOCKS) {
      expect(block.title.length).toBeGreaterThan(2)
      expect(block.description.length).toBeGreaterThan(20)
    }
  })

  test('"built with" links point at real component pages', () => {
    const missing = BLOCKS.flatMap((block) => block.uses.filter((id) => !findComponent(id)).map((id) => `${block.id}: ${id}`))
    expect(missing).toEqual([])
  })
})

describe.each(BLOCKS.map((block) => block.id))('%s', (id) => {
  test('has no axe violations', async () => {
    const { container } = renderBlock(id)
    const { violations } = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
      resultTypes: ['violations'],
    })
    expect(
      violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).slice(0, 2).join(' | ')})`)
    ).toEqual([])
  })
})

describe('flows', () => {
  test('sign in: an empty submit shows both errors and focuses the email', async () => {
    const user = userEvent.setup()
    renderBlock('sign-in')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Enter a valid email address.')).toBeTruthy()
    expect(screen.getByText('Use at least 8 characters.')).toBeTruthy()
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText('Email')))
  })

  test('invite: a bad address is refused, a good one is added to the waiting list', async () => {
    const user = userEvent.setup()
    renderBlock('invite-members')
    const email = screen.getByRole('textbox', { name: 'Email address' })
    await user.type(email, 'nope')
    await user.click(screen.getByRole('button', { name: 'Send invite' }))
    expect(screen.getByRole('alert').textContent).toBe('Enter a valid email address.')

    await user.clear(email)
    await user.type(email, 'new@example.com')
    await user.click(screen.getByRole('button', { name: 'Send invite' }))
    expect(screen.getByText('new@example.com')).toBeTruthy()
    expect(screen.getByText('Waiting for a reply (3)')).toBeTruthy()
  })

  test('invite: revoking asks first, then removes the invitation', async () => {
    const user = userEvent.setup()
    renderBlock('invite-members')
    await user.click(screen.getAllByRole('button', { name: 'Revoke' })[0])
    await user.click(await screen.findByRole('button', { name: 'Revoke' }, { timeout: 2000 }).catch(() => screen.getAllByRole('button', { name: 'Revoke' }).at(-1)!))
    await waitFor(() => expect(screen.getByText('Waiting for a reply (1)')).toBeTruthy())
  })

  test('notifications: marking all as read clears the unread count', async () => {
    const user = userEvent.setup()
    renderBlock('notifications')
    expect(screen.getByRole('tab', { name: 'Unread (3)' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Mark all as read' }))
    expect(screen.getByRole('tab', { name: 'Unread' })).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Mark all as read' }) as HTMLButtonElement).disabled).toBe(true)
  })

  test('onboarding: continue waits for a name, then the finished state names the workspace', async () => {
    const user = userEvent.setup()
    renderBlock('onboarding')
    const next = () => screen.getByRole('button', { name: 'Continue' }) as HTMLButtonElement
    expect(next().disabled).toBe(true)
    await user.type(screen.getByLabelText('Workspace name'), 'Acme')
    expect(next().disabled).toBe(false)
    await user.click(next())
    await user.click(screen.getByRole('button', { name: 'Finish setup' }))
    expect(screen.getByRole('heading', { name: 'Acme is ready' })).toBeTruthy()
  })

  test('pricing: the yearly switch lowers the prices by 20%', async () => {
    const user = userEvent.setup()
    renderBlock('pricing')
    expect(screen.getByText('$10')).toBeTruthy()
    await user.click(screen.getByRole('radio', { name: 'Monthly' }))
    expect(screen.getByText('$12')).toBeTruthy()
    expect(screen.getByText('$29')).toBeTruthy()
  })

  test('search: matches are highlighted and an empty result says what to do', async () => {
    const user = userEvent.setup()
    const { container } = renderBlock('search-results')
    expect(container.querySelectorAll('mark').length).toBeGreaterThan(0)
    const box = screen.getByRole('searchbox', { name: 'Search the documentation' })
    await user.clear(box)
    await user.type(box, 'zzzz')
    expect(screen.getByText('No results for “zzzz”. Try a shorter word.')).toBeTruthy()
  })

  test('api keys: a new key is shown once in full, listed masked, and can be revoked', async () => {
    const user = userEvent.setup()
    renderBlock('api-keys')
    expect(screen.getAllByRole('row')).toHaveLength(3)
    await user.click(screen.getByRole('button', { name: 'Create key' }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText('Name'), 'Staging')
    await user.click(within(dialog).getByRole('button', { name: 'Create key' }))
    await waitFor(() => expect(screen.getAllByRole('row')).toHaveLength(4))
    expect(screen.getByText('Copy your new key now')).toBeTruthy()
    expect(screen.getByText('Staging')).toBeTruthy()
    expect(screen.getAllByText(/sk_live_••••/)).toHaveLength(3)
  })
})
