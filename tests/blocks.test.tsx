// Blocks: every screen in playground/blocks renders, passes axe, and the main flows work.
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import type { ComponentType } from 'react'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { BLOCKS, BLOCK_CATEGORIES } from '../playground/blocks/registry'
import { findComponent } from '../playground/registry'
import { ThemeProvider } from '../src/providers'

const modules = import.meta.glob<{ default: ComponentType }>('../playground/blocks/*.tsx', { eager: true })
const byId = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => [path.split('/').pop()!.replace('.tsx', ''), mod.default])
)

// input-otp looks for a password-manager badge with this a moment after mount, and jsdom has no
// elementFromPoint. Stubbed for this file only: a global stub changes what axe decides about
// open overlays (aria-hidden-focus), so tests/setup.ts must not define it.
const nativeElementFromPoint = document.elementFromPoint
beforeAll(() => {
  document.elementFromPoint = () => null
})
afterAll(() => {
  document.elementFromPoint = nativeElementFromPoint
})

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

  test('every block sits in a known category, and every category has a block', () => {
    expect(BLOCKS.filter((block) => !BLOCK_CATEGORIES.includes(block.category))).toEqual([])
    expect(BLOCK_CATEGORIES.filter((name) => !BLOCKS.some((block) => block.category === name))).toEqual([])
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

  test('sign up: errors on an empty submit, and the meter follows the password', async () => {
    const user = userEvent.setup()
    renderBlock('sign-up')
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText('Enter your name.')).toBeTruthy()
    expect(screen.getByText('Accept the terms to continue.')).toBeTruthy()
    await user.type(screen.getByLabelText('Password'), 'abc')
    expect(screen.getByText('Too short')).toBeTruthy()
    await user.clear(screen.getByLabelText('Password'))
    await user.type(screen.getByLabelText('Password'), 'Str0ngPassw0rd!')
    expect(screen.getByText('Strong')).toBeTruthy()
  })

  test('forgot password: a bad address is refused, a good one says where the link went', async () => {
    const user = userEvent.setup()
    renderBlock('forgot-password')
    await user.type(screen.getByLabelText('Email'), 'nope')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))
    expect(await screen.findByText('Enter a valid email address.')).toBeTruthy()
    await user.clear(screen.getByLabelText('Email'))
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))
    expect(await screen.findByRole('heading', { name: 'Check your email' })).toBeTruthy()
    expect(screen.getByText('ada@example.com')).toBeTruthy()
  })

  test('two-factor: a wrong code is refused and cleared, the right one verifies', async () => {
    const user = userEvent.setup()
    renderBlock('two-factor')
    const input = screen.getByLabelText('One-time code')
    await user.type(input, '000000')
    expect((await screen.findByRole('alert')).textContent).toContain('That code is not right')
    await user.type(screen.getByLabelText('One-time code'), '123456')
    expect(await screen.findByRole('heading', { name: 'You are verified' })).toBeTruthy()
  })

  test('app shell: choosing a page changes the title and the breadcrumb', async () => {
    const user = userEvent.setup()
    renderBlock('app-shell')
    expect(screen.getByRole('heading', { name: 'Overview' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Team' }))
    expect(screen.getByRole('heading', { name: 'Team' })).toBeTruthy()
    expect(screen.getByText('Linus Torvalds')).toBeTruthy()
  })

  test('command palette: opens, filters, and runs the chosen command', async () => {
    const user = userEvent.setup()
    renderBlock('command-palette')
    expect(screen.getByText('Nothing picked yet')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /Search or jump to/ }))
    await user.type(await screen.findByPlaceholderText('Type a command or search'), 'invite')
    expect(screen.queryByText('Overview')).toBeNull()
    await user.click(screen.getByText('Invite a member'))
    expect(await screen.findByText('Started an invitation')).toBeTruthy()
  })

  test('members table: search narrows the rows, and a selection can be removed after a confirmation', async () => {
    const user = userEvent.setup()
    renderBlock('members-table')
    await user.type(screen.getByPlaceholderText('Search by name or email'), 'grace')
    expect(screen.getByText('Grace Hopper')).toBeTruthy()
    expect(screen.queryByText('Linus Torvalds')).toBeNull()
    await user.click(screen.getByRole('checkbox', { name: 'Select Grace Hopper' }))
    await user.click(screen.getByRole('button', { name: 'Remove 1 selected' }))
    await user.click(await screen.findByRole('button', { name: 'Remove' }))
    await waitFor(() => expect(screen.getByText('7 people can open this workspace.')).toBeTruthy())
  })

  test('checkout: the total follows the quantity, and shipping becomes free from $100', async () => {
    const user = userEvent.setup()
    renderBlock('checkout')
    expect(screen.getByText('$88.00')).toBeTruthy()
    const tee = screen.getByLabelText('Field tee quantity')
    await user.click(tee)
    await user.keyboard('{ArrowUp}')
    // Free shipping makes the subtotal and the total the same figure.
    expect(screen.getAllByText('$108.00')).toHaveLength(2)
    expect(screen.getByText('Free')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Place order' }))
    expect(await screen.findByText('Enter a valid email address.')).toBeTruthy()
  })

  test('analytics: the figures change with the period', async () => {
    const user = userEvent.setup()
    renderBlock('analytics')
    const before = screen.getByText('Visitors').parentElement!.textContent
    await user.click(screen.getByRole('button', { name: /Report period/ }))
    await user.click(await screen.findByRole('button', { name: 'Last 30 days' }))
    await waitFor(() => expect(screen.getByText('Visitors').parentElement!.textContent).not.toBe(before))
  })

  test('schedule a meeting: a booking needs a day and a free time, then confirms', async () => {
    const user = userEvent.setup()
    renderBlock('schedule-meeting')
    expect((screen.getByRole('button', { name: 'Confirm booking' }) as HTMLButtonElement).disabled).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Thursday, September 24, 2026' }))
    expect((screen.getByRole('radio', { name: '09:00' }) as HTMLButtonElement).disabled).toBe(true)
    await user.click(screen.getByRole('radio', { name: '09:30' }))
    await user.click(screen.getByRole('button', { name: 'Confirm booking' }))
    expect(await screen.findByRole('heading', { name: 'You are booked' })).toBeTruthy()
  })

  test('security: turning two-factor off warns, and a device can be signed out', async () => {
    const user = userEvent.setup()
    renderBlock('security-settings')
    await user.click(screen.getByRole('switch'))
    expect(screen.getByText('Two-factor sign-in is off')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Sign out iPhone 15, Safari' }))
    await user.click(await screen.findByRole('button', { name: 'Sign out' }))
    await waitFor(() => expect(screen.queryByText('iPhone 15, Safari')).toBeNull())
  })

  test('roles: a grant changes the count for that role', async () => {
    const user = userEvent.setup()
    renderBlock('roles-permissions')
    expect(screen.getByText(/Viewer: 1 of 5/)).toBeTruthy()
    await user.click(screen.getByRole('checkbox', { name: 'Viewer can edit content' }))
    expect(screen.getByText(/Viewer: 2 of 5/)).toBeTruthy()
  })

  test('request log: choosing a request shows its response', async () => {
    const user = userEvent.setup()
    renderBlock('request-log')
    await user.click(screen.getByRole('button', { name: /\/v1\/payments\/retry/ }))
    expect(screen.getByRole('heading', { name: '/v1/payments/retry' })).toBeTruthy()
    expect(screen.getByText(/upstream_timeout/)).toBeTruthy()
  })

  test('system status: an incident turns the banner and the API row red', async () => {
    const user = userEvent.setup()
    renderBlock('system-status')
    expect(screen.getByText('All systems operational')).toBeTruthy()
    await user.click(screen.getByRole('switch'))
    expect(screen.getByText('The API is not answering')).toBeTruthy()
    expect(screen.getByText('Down')).toBeTruthy()
  })

  test('feedback: sending needs a star rating', async () => {
    const user = userEvent.setup()
    renderBlock('feedback-survey')
    const send = () => screen.getByRole('button', { name: 'Send feedback' }) as HTMLButtonElement
    expect(send().disabled).toBe(true)
    await user.click(screen.getAllByRole('radio')[3])
    expect(send().disabled).toBe(false)
    await user.click(send())
    expect(await screen.findByRole('heading', { name: 'Thanks for telling us' })).toBeTruthy()
  })

  test('share: the dialog offers a link, access and a QR code, and Done records the choice', async () => {
    const user = userEvent.setup()
    renderBlock('share-dialog')
    expect(screen.getByText('Not shared yet.')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Share' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('button', { name: 'Copy link' })).toBeTruthy()
    expect(within(dialog).getByLabelText('QR code for the share link')).toBeTruthy()
    await user.click(within(dialog).getByRole('button', { name: 'Done' }))
    await waitFor(() => expect(screen.getByText('Shared with: Anyone at Acme Inc..')).toBeTruthy())
  })

  test('product page: adding to the cart is counted, and a section opens', async () => {
    const user = userEvent.setup()
    renderBlock('product-page')
    expect(screen.getByText('Your cart is empty.')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Add to cart' }))
    expect(screen.getByText('1 item in your cart.')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Shipping' }))
    expect(await screen.findByText(/Free from \$100/)).toBeTruthy()
  })

  test('help center: search narrows the answers, and no match says what to do', async () => {
    const user = userEvent.setup()
    renderBlock('help-center')
    const box = screen.getByRole('searchbox', { name: 'Search the help center' })
    await user.type(box, 'invoice')
    expect(screen.getByText('Where can I download an invoice?')).toBeTruthy()
    expect(screen.queryByText('How do I reset my password?')).toBeNull()
    await user.clear(box)
    await user.type(box, 'zzzz')
    expect(screen.getByText(/No answers for “zzzz”/)).toBeTruthy()
  })

  test('landing: renders the hero and the customer strip', () => {
    renderBlock('landing')
    expect(screen.getByRole('heading', { name: /Know what your customers do/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Start for free' })).toBeTruthy()
  })

  test('kanban: a card moves from its menu, and a new one lands in To do', async () => {
    const user = userEvent.setup()
    renderBlock('kanban-board')
    await user.click(screen.getByRole('button', { name: 'Move Fix the invoice rounding bug' }))
    await user.click(await screen.findByRole('menuitem', { name: 'In progress' }))
    expect(screen.getByLabelText('3 cards')).toBeTruthy()
    await user.type(screen.getByLabelText('New card title'), 'Plan the launch')
    await user.click(screen.getByRole('button', { name: 'Add card' }))
    expect(screen.getByText('Plan the launch')).toBeTruthy()
  })

  test('inbox: choosing a message opens it, and a reply is sent', async () => {
    const user = userEvent.setup()
    renderBlock('inbox')
    await user.click(screen.getAllByRole('button', { name: /Invoice question/ })[0])
    expect(screen.getByRole('heading', { name: 'Invoice question' })).toBeTruthy()
    // user.type would click first, and a click inside a resizable panel does not move focus in jsdom.
    screen.getByLabelText('Reply to Margaret Hamilton').focus()
    await user.keyboard('Thanks, looking now')
    await user.click(screen.getByRole('button', { name: 'Send reply' }))
    expect(await screen.findByText('Reply sent to Margaret Hamilton.')).toBeTruthy()
  })

  test('multi-step form: each step is checked before the next one opens', async () => {
    const user = userEvent.setup()
    renderBlock('multi-step-form')
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(await screen.findByText('Enter your name.')).toBeTruthy()
    expect(screen.getByText('Choose a company size.')).toBeTruthy()
    await user.type(screen.getByLabelText('Full name'), 'Ada Lovelace')
    await user.type(screen.getByLabelText('Work email'), 'ada@example.com')
    await user.click(screen.getByRole('combobox', { name: /Company size/ }))
    await user.click(await screen.findByRole('option', { name: 'Just me' }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(await screen.findByRole('heading', { name: 'Plan your day' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(await screen.findByText('Pick at least one topic.')).toBeTruthy()
  })

  test('create project: the price follows memory and environment, and a name is needed', async () => {
    const user = userEvent.setup()
    renderBlock('create-project')
    const create = () => screen.getByRole('button', { name: 'Create project' }) as HTMLButtonElement
    expect(create().disabled).toBe(true)
    expect(screen.getAllByText('$24').length).toBeGreaterThan(0)
    screen.getByRole('slider').focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getAllByText('$48').length).toBeGreaterThan(0)
    await user.click(screen.getByRole('radio', { name: /Production/ }))
    expect(screen.getByText('$58')).toBeTruthy()
    await user.type(screen.getByLabelText('Project name'), 'billing-api')
    await user.click(create())
    expect(await screen.findByRole('heading', { name: 'billing-api is being created' })).toBeTruthy()
  })

  test('notification settings: a change shows the unsaved bar, and saving clears it', async () => {
    const user = userEvent.setup()
    renderBlock('notification-settings')
    expect(screen.getByText('All changes saved.')).toBeTruthy()
    await user.click(screen.getByRole('switch', { name: 'Billing by push' }))
    expect(screen.getByText('You have unsaved changes.')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(screen.getByText('All changes saved.')).toBeTruthy()
  })

  test('audit log: an event opens its details in a sheet', async () => {
    const user = userEvent.setup()
    renderBlock('audit-log')
    await user.click(screen.getByText('Created an API key'))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/key_a41c/)).toBeTruthy()
  })

  test('profile: following toggles, and the tabs switch', async () => {
    const user = userEvent.setup()
    renderBlock('profile')
    await user.click(screen.getByRole('button', { name: 'Follow' }))
    expect(screen.getByRole('button', { name: 'Following' })).toBeTruthy()
    await user.click(screen.getByRole('tab', { name: 'Projects' }))
    expect(screen.getByText('Billing API')).toBeTruthy()
  })

  test('contact form: every missing part is named, and a full message is sent', async () => {
    const user = userEvent.setup()
    renderBlock('contact-form')
    await user.click(screen.getByRole('button', { name: 'Send message' }))
    expect(await screen.findByText('Enter your name.')).toBeTruthy()
    expect(screen.getByText('Choose what this is about.')).toBeTruthy()
    expect(screen.getByText('Write a short message.')).toBeTruthy()
    await user.type(screen.getByLabelText('Name'), 'Ada')
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Message'), 'Hello there')
    await user.click(screen.getByRole('combobox', { name: /What is this about/ }))
    await user.click(await screen.findByRole('option', { name: 'I need support' }))
    await user.click(screen.getByRole('button', { name: 'Send message' }))
    expect(await screen.findByRole('heading', { name: 'Message sent' })).toBeTruthy()
  })

  test('price editor: an edit is counted, and saving resets the count', async () => {
    const user = userEvent.setup()
    renderBlock('price-editor')
    expect(screen.getByText('No changes yet.')).toBeTruthy()
    await user.click(screen.getByLabelText('Field tee price'))
    await user.keyboard('{ArrowUp}')
    expect(screen.getByText('1 product changed.')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(screen.getByText('No changes yet.')).toBeTruthy()
  })

  test('onboarding tour: the tips advance, and skipping ends the tour', async () => {
    const user = userEvent.setup()
    renderBlock('onboarding-tour')
    expect(await screen.findByRole('dialog', { name: 'Tour step 1 of 3' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByRole('dialog', { name: 'Tour step 2 of 3' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Skip' }))
    expect(await screen.findByText('You are all set.')).toBeTruthy()
  })
})
