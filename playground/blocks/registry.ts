/*
 * Blocks: whole screens, not single components, built only from the library. Each block
 * is a file in this folder whose default export is the screen; the same file is shown as
 * the code, so what the page renders and what you copy never drift apart. `uses` are
 * component page ids, linked under each block.
 */

export const BLOCK_CATEGORIES = ['Authentication', 'Application', 'Data', 'Commerce', 'Marketing'] as const
export type BlockCategory = (typeof BLOCK_CATEGORIES)[number]

export interface BlockMeta {
  /** File name in this folder and the anchor on the page. */
  id: string
  title: string
  category: BlockCategory
  description: string
  uses: string[]
}

export const BLOCKS: BlockMeta[] = [
  {
    id: 'sign-in',
    category: 'Authentication',
    title: 'Sign in',
    description: 'Email and password with validation, a remembered-device option and a clear error path.',
    uses: ['form-fields', 'password-input', 'checkbox', 'button', 'sonner'],
  },
  {
    id: 'account-settings',
    category: 'Application',
    title: 'Account settings',
    description: 'A profile form with a photo, a short bio and notification switches that save together.',
    uses: ['form-fields', 'avatar', 'textarea', 'switch', 'sonner'],
  },
  {
    id: 'billing',
    category: 'Commerce',
    title: 'Billing and plan',
    description: 'Pick a plan, see what is used, and download past invoices.',
    uses: ['radio-group', 'progress', 'table', 'badge', 'button'],
  },
  {
    id: 'dashboard',
    category: 'Data',
    title: 'Dashboard',
    description: 'Key numbers with trends, a chart that follows the theme and the latest activity.',
    uses: ['metric-card', 'chart', 'badge', 'avatar', 'button'],
  },
  {
    id: 'invite-members',
    category: 'Application',
    title: 'Invite members',
    description: 'Invite by email with a role, and manage the invitations that are still waiting.',
    uses: ['input', 'select', 'avatar', 'badge', 'confirm-popover', 'sonner'],
  },
  {
    id: 'onboarding',
    category: 'Application',
    title: 'Onboarding',
    description: 'A short setup in steps, with the way back always available and a finished state.',
    uses: ['stepper', 'input', 'radio-group', 'result', 'button'],
  },
  {
    id: 'empty-states',
    category: 'Data',
    title: 'Empty and error states',
    description: 'Nothing yet, nothing found and something broke: each one says what to do next.',
    uses: ['empty-state', 'error-display', 'input', 'button'],
  },
  {
    id: 'pricing',
    category: 'Commerce',
    title: 'Pricing',
    description: 'Three plans with a monthly and yearly switch and one clearly recommended option.',
    uses: ['toggle-group', 'badge', 'button'],
  },
  {
    id: 'search-results',
    category: 'Application',
    title: 'Search results',
    description: 'A search field, result types as tabs, highlighted matches and paging.',
    uses: ['input', 'tabs', 'pagination', 'kbd'],
  },
  {
    id: 'notifications',
    category: 'Application',
    title: 'Notifications',
    description: 'All and unread, one tap to mark as read, and a quiet state when there is nothing new.',
    uses: ['tabs', 'scroll-area', 'button', 'empty-state'],
  },
  {
    id: 'api-keys',
    category: 'Application',
    title: 'API keys',
    description: 'Create a key, copy it once, and revoke it behind a confirmation.',
    uses: ['table', 'copy-button', 'banner', 'dialog', 'confirm-popover', 'input'],
  },
  {
    id: 'file-uploads',
    category: 'Data',
    title: 'File uploads',
    description: 'Drop files, watch each one upload, and remove any of them.',
    uses: ['file-upload', 'progress', 'dropdown-menu'],
  },
  {
    id: 'sign-up',
    category: 'Authentication',
    title: 'Sign up',
    description: 'Create an account with a password strength meter and terms that must be accepted.',
    uses: ['form-fields', 'password-input', 'progress', 'checkbox', 'button', 'sonner'],
  },
  {
    id: 'forgot-password',
    category: 'Authentication',
    title: 'Forgot password',
    description: 'Ask for an email address, then confirm where the reset link went.',
    uses: ['form-fields', 'button', 'result'],
  },
  {
    id: 'two-factor',
    category: 'Authentication',
    title: 'Two-factor code',
    description: 'A six-digit code that checks itself, with a wait before it can be sent again.',
    uses: ['input-otp', 'countdown', 'button', 'result'],
  },
  {
    id: 'app-shell',
    category: 'Application',
    title: 'App shell',
    description: 'A collapsible sidebar, breadcrumb and account menu around the page you are on.',
    uses: ['sidebar', 'breadcrumb', 'dropdown-menu', 'avatar', 'badge', 'button'],
  },
  {
    id: 'command-palette',
    category: 'Application',
    title: 'Command palette',
    description: 'Jump to a page or run an action from the keyboard with Ctrl or Cmd and K.',
    uses: ['command', 'dialog', 'kbd', 'button'],
  },
  {
    id: 'members-table',
    category: 'Data',
    title: 'Members table',
    description: 'Search, filter by role, select rows and act on one or many people at once.',
    uses: ['data-table', 'select', 'dropdown-menu', 'confirm-popover', 'avatar', 'badge', 'button'],
  },
  {
    id: 'analytics',
    category: 'Data',
    title: 'Analytics',
    description: 'Pick a period and every number, the chart and the top pages follow it.',
    uses: ['date-range-picker', 'chart', 'statistic', 'gauge', 'table'],
  },
  {
    id: 'checkout',
    category: 'Commerce',
    title: 'Checkout',
    description: 'Contact and delivery details, a payment choice and an order summary that updates live.',
    uses: ['form-fields', 'radio-group', 'number-input', 'descriptions', 'result', 'button'],
  },
  {
    id: 'schedule-meeting',
    category: 'Application',
    title: 'Schedule a meeting',
    description: 'Pick a weekday, a free time and a time zone, then confirm the booking.',
    uses: ['calendar', 'toggle-group', 'select', 'avatar', 'result', 'button'],
  },
  {
    id: 'security-settings',
    category: 'Application',
    title: 'Security settings',
    description: 'Two-factor sign-in, the devices you are signed in on, and a guarded way to delete the account.',
    uses: ['switch', 'alert', 'alert-dialog', 'confirm-popover', 'badge', 'button'],
  },
  {
    id: 'roles-permissions',
    category: 'Application',
    title: 'Roles and permissions',
    description: 'A grid of what each role may do, with the owner locked to everything.',
    uses: ['table', 'checkbox'],
  },
  {
    id: 'request-log',
    category: 'Data',
    title: 'Request log',
    description: 'A list of API calls beside the response of the one you picked, in panes you can resize.',
    uses: ['resizable', 'status-code', 'code-block', 'copy-button', 'timestamp-info'],
  },
  {
    id: 'system-status',
    category: 'Data',
    title: 'System status',
    description: 'Overall health, response time and a 30-day history for every service.',
    uses: ['alert', 'circular-progress', 'gauge', 'badge', 'switch'],
  },
  {
    id: 'feedback-survey',
    category: 'Application',
    title: 'Feedback survey',
    description: 'A 0 to 10 slider, a star rating and an optional comment that sends once.',
    uses: ['slider', 'rating', 'textarea', 'result', 'button'],
  },
  {
    id: 'share-dialog',
    category: 'Application',
    title: 'Share dialog',
    description: 'Copy a link, choose who can open it and hand it to a phone with a QR code.',
    uses: ['dialog', 'copy-button', 'select', 'qr-code', 'input', 'button'],
  },
  {
    id: 'product-page',
    category: 'Commerce',
    title: 'Product page',
    description: 'A photo carousel, rating, size choice, quantity and the details folded away.',
    uses: ['carousel', 'rating', 'toggle-group', 'number-input', 'accordion', 'button', 'sonner'],
  },
  {
    id: 'help-center',
    category: 'Marketing',
    title: 'Help center',
    description: 'Search the answers, open one, and write to support when none fits.',
    uses: ['input', 'accordion', 'select', 'textarea', 'button'],
  },
  {
    id: 'landing',
    category: 'Marketing',
    title: 'Landing page',
    description: 'A header, a hero, a strip of customers, three numbers and the main features.',
    uses: ['button', 'marquee', 'statistic'],
  },
  {
    id: 'kanban-board',
    category: 'Application',
    title: 'Kanban board',
    description: 'Three columns of cards, each moved to another column from its own menu.',
    uses: ['dropdown-menu', 'avatar', 'badge', 'input', 'button'],
  },
  {
    id: 'inbox',
    category: 'Application',
    title: 'Inbox',
    description: 'Folders, a long message list and a reading pane, in panels you can resize.',
    uses: ['resizable', 'virtual-list', 'mentions', 'avatar', 'button'],
  },
  {
    id: 'multi-step-form',
    category: 'Application',
    title: 'Multi-step form',
    description: 'A registration in three steps, each one checked before you can move on.',
    uses: ['stepper', 'form-fields', 'combobox', 'multi-select', 'date-picker', 'descriptions', 'result'],
  },
  {
    id: 'create-project',
    category: 'Application',
    title: 'Create a project',
    description: 'Name, region, environment and memory, with the monthly price updating as you choose.',
    uses: ['input', 'combobox', 'radio-group', 'slider', 'descriptions', 'result', 'button'],
  },
  {
    id: 'notification-settings',
    category: 'Application',
    title: 'Notification settings',
    description: 'Which events reach you by email, push or Slack, plus quiet hours with start and end times.',
    uses: ['table', 'switch', 'time-picker', 'button', 'sonner'],
  },
  {
    id: 'audit-log',
    category: 'Data',
    title: 'Audit log',
    description: 'Filter and search who did what, and open any event to see its details in a side sheet.',
    uses: ['data-table', 'multi-select', 'sheet', 'code-block', 'timestamp-info', 'badge'],
  },
  {
    id: 'profile',
    category: 'Application',
    title: 'Profile',
    description: 'A cover, a follow button, three numbers and tabs for activity, projects and details.',
    uses: ['avatar', 'statistic', 'tabs', 'badge', 'button'],
  },
  {
    id: 'contact-form',
    category: 'Marketing',
    title: 'Contact form',
    description: 'A message that can mention a teammate, with an attachment and a clear sent state.',
    uses: ['form-fields', 'mentions', 'file-upload', 'select', 'button'],
  },
  {
    id: 'price-editor',
    category: 'Data',
    title: 'Price editor',
    description: 'Edit prices and stock in the table itself, see what changed and save everything at once.',
    uses: ['table', 'number-input', 'switch', 'checkbox', 'badge', 'button', 'sonner'],
  },
  {
    id: 'onboarding-tour',
    category: 'Application',
    title: 'Onboarding tour',
    description: 'A guided walk through the menu, one tip at a time, that can be skipped or repeated.',
    uses: ['popover', 'button'],
  },
]
