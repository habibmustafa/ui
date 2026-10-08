/*
 * Blocks: whole screens, not single components, built only from the library. Each block
 * is a file in this folder whose default export is the screen; the same file is shown as
 * the code, so what the page renders and what you copy never drift apart. `uses` are
 * component page ids, linked under each block.
 */

export interface BlockMeta {
  /** File name in this folder and the anchor on the page. */
  id: string
  title: string
  description: string
  uses: string[]
}

export const BLOCKS: BlockMeta[] = [
  {
    id: 'sign-in',
    title: 'Sign in',
    description: 'Email and password with validation, a remembered-device option and a clear error path.',
    uses: ['form-fields', 'password-input', 'checkbox', 'button', 'sonner'],
  },
  {
    id: 'account-settings',
    title: 'Account settings',
    description: 'A profile form with a photo, a short bio and notification switches that save together.',
    uses: ['form-fields', 'avatar', 'textarea', 'switch', 'sonner'],
  },
  {
    id: 'billing',
    title: 'Billing and plan',
    description: 'Pick a plan, see what is used, and download past invoices.',
    uses: ['radio-group', 'progress', 'table', 'badge', 'button'],
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Key numbers with trends, a chart that follows the theme and the latest activity.',
    uses: ['metric-card', 'chart', 'badge', 'avatar'],
  },
  {
    id: 'invite-members',
    title: 'Invite members',
    description: 'Invite by email with a role, and manage the invitations that are still waiting.',
    uses: ['input', 'select', 'badge', 'confirm-popover', 'sonner'],
  },
  {
    id: 'onboarding',
    title: 'Onboarding',
    description: 'A short setup in steps, with the way back always available and a finished state.',
    uses: ['stepper', 'input', 'radio-group', 'button'],
  },
  {
    id: 'empty-states',
    title: 'Empty and error states',
    description: 'Nothing yet, nothing found and something broke: each one says what to do next.',
    uses: ['empty-state', 'error-display', 'button'],
  },
  {
    id: 'pricing',
    title: 'Pricing',
    description: 'Three plans with a monthly and yearly switch and one clearly recommended option.',
    uses: ['toggle-group', 'card', 'badge', 'button'],
  },
  {
    id: 'search-results',
    title: 'Search results',
    description: 'A search field, result types as tabs, highlighted matches and paging.',
    uses: ['input', 'tabs', 'pagination', 'kbd', 'badge'],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'All and unread, one tap to mark as read, and a quiet state when there is nothing new.',
    uses: ['tabs', 'scroll-area', 'badge', 'button', 'empty-state'],
  },
  {
    id: 'api-keys',
    title: 'API keys',
    description: 'Create a key, copy it once, and revoke it behind a confirmation.',
    uses: ['table', 'copy-button', 'dialog', 'confirm-popover', 'input'],
  },
  {
    id: 'file-uploads',
    title: 'File uploads',
    description: 'Drop files, watch each one upload, and remove any of them.',
    uses: ['file-upload', 'progress', 'dropdown-menu', 'badge'],
  },
]
