import {
  AlignLeft,
  AlertOctagon,
  AlertTriangle,
  AppWindow,
  BarChart3,
  BellRing,
  Box,
  Calendar,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ChevronsLeftRight,
  ChevronsUpDown,
  CircleDot,
  CircleUser,
  Compass,
  Clock,
  Code,
  Columns3,
  CreditCard,
  Eye,
  FileText,
  Frame,
  GalleryHorizontal,
  Hash,
  HelpCircle,
  Inbox,
  Info,
  Keyboard,
  KeyRound,
  LayoutGrid,
  LayoutPanelTop,
  Layers,
  Link as LinkIcon,
  ListChecks,
  ListFilter,
  ListOrdered,
  Loader,
  Loader2,
  Menu,
  MessageCircle,
  MessageSquare,
  Minus,
  MousePointer,
  MousePointerClick,
  MoveHorizontal,
  PanelLeft,
  PanelRight,
  PanelRightOpen,
  RectangleHorizontal,
  Rows,
  Rows3,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  SunMoon,
  Table as TableIcon,
  Tag,
  Terminal,
  TextCursorInput,
  ToggleLeft,
  TrendingUp,
  Type,
  Upload,
  type LucideIcon,
} from 'lucide-react'

import type { ComponentPreviewCodeVariant } from './component-preview'

/*
 * Single source of truth for the playground's component pages. Every entry is
 * addressable at /components/<id>; the sidebar nav in app.tsx is derived from
 * these groups, so adding an entry here is enough to get a page and a link.
 * `icon` is purely decorative (Overview grid scanning) — ui's own choice, not
 * an upstream fidelity concern.
 */

export interface ComponentPreviewSpec {
  /** Example file name (without extension) under playground/examples/<component>/. */
  name: string
  /** Section heading above the preview; also its anchor in the page's contents nav. */
  label?: string
  /** Extra code tabs, e.g. the props-driven / compound pair of a hybrid component. */
  codeVariants?: ComponentPreviewCodeVariant[]
}

export interface ComponentEntry {
  id: string
  title: string
  /** Decorative only — Overview grid card icon. */
  icon: LucideIcon
  description: string
  previews: ComponentPreviewSpec[]
}

export interface ComponentGroup {
  title: string
  entries: ComponentEntry[]
}

/* ui-specific additions — not part of the upstream Supabase design system. */
const layoutPrimitives: ComponentEntry[] = [
  {
    id: 'box',
    title: 'Box',
    icon: Box,
    description:
      'ui-specific primitive: one component that renders any element via `as`, merged through cn().',
    previews: [
      { name: 'box-demo' },
    ],
  },
  {
    id: 'container',
    title: 'Container',
    icon: Frame,
    description:
      'ui-specific primitive: centred, bounded page-width wrapper (sm/md/lg/full).',
    previews: [
      { name: 'container-demo' },
    ],
  },
  {
    id: 'flex',
    title: 'Flex',
    icon: Columns3,
    description:
      'ui-specific primitive: flex container with direction, align, justify, wrap and token gaps.',
    previews: [
      { name: 'flex-demo' },
    ],
  },
  {
    id: 'grid',
    title: 'Grid',
    icon: LayoutGrid,
    description:
      'ui-specific primitive: CSS grid with columns, rows, flow and independent axis gaps.',
    previews: [
      { name: 'grid-demo' },
    ],
  },
  {
    id: 'stack',
    title: 'Stack',
    icon: Rows3,
    description:
      'ui-specific primitive: the opinionated 1-dimensional preset of Flex — vertical by default, always gapped.',
    previews: [
      { name: 'stack-demo' },
    ],
  },
]

const atoms: ComponentEntry[] = [
  {
    id: 'accordion',
    title: 'Accordion',
    icon: ChevronsUpDown,
    description: 'Disclosure list with animated height transitions.',
    previews: [
      {
        name: 'accordion-props-demo',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'accordion-props-demo' },
          { id: 'compound', label: 'Compound', name: 'accordion-demo' },
        ],
      },
    ],
  },
  {
    id: 'alert',
    title: 'Alert',
    icon: AlertTriangle,
    description: 'Tinted container with an optional icon, title and description.',
    previews: [
      {
        name: 'alert-props-demo',
        label: 'Default',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'alert-props-demo' },
          { id: 'compound', label: 'Compound', name: 'alert-variants' },
        ],
      },
      {
        name: 'alert-basic-props-demo',
        label: 'Basic',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'alert-basic-props-demo' },
          { id: 'compound', label: 'Compound', name: 'alert-demo' },
        ],
      },
    ],
  },
  {
    id: 'alert-dialog',
    title: 'Alert Dialog',
    icon: ShieldAlert,
    description:
      'Modal confirmation for a destructive or otherwise interruptive action — built-in loading state for async confirm handlers.',
    previews: [
      { name: 'alert-dialog-props-demo', label: 'Default', codeVariants: [
        { id: 'props', label: 'Props-driven', name: 'alert-dialog-props-demo' },
        { id: 'compound', label: 'Compound', name: 'alert-dialog-demo' },
      ] },
      { name: 'alert-dialog-destructive-props-demo', label: 'Destructive', codeVariants: [
        { id: 'props', label: 'Props-driven', name: 'alert-dialog-destructive-props-demo' },
        { id: 'compound', label: 'Compound', name: 'alert-dialog-destructive' },
      ] },
      { name: 'alert-dialog-warning-props-demo', label: 'Warning', codeVariants: [
        { id: 'props', label: 'Props-driven', name: 'alert-dialog-warning-props-demo' },
        { id: 'compound', label: 'Compound', name: 'alert-dialog-warning' },
      ] },
      { name: 'alert-dialog-close-only-props-demo', label: 'Close only', codeVariants: [
        { id: 'props', label: 'Props-driven', name: 'alert-dialog-close-only-props-demo' },
        { id: 'compound', label: 'Compound', name: 'alert-dialog-close-only' },
      ] },
      { name: 'alert-dialog-async-props-demo', label: 'Async', codeVariants: [
        { id: 'props', label: 'Props-driven', name: 'alert-dialog-async-props-demo' },
        { id: 'compound', label: 'Compound', name: 'alert-dialog-async' },
      ] },
      { name: 'alert-dialog-async-error-props-demo', label: 'Async error', codeVariants: [
        { id: 'props', label: 'Props-driven', name: 'alert-dialog-async-error-props-demo' },
        { id: 'compound', label: 'Compound', name: 'alert-dialog-async-error' },
      ] },
    ],
  },
  {
    id: 'aspect-ratio',
    title: 'Aspect Ratio',
    icon: RectangleHorizontal,
    description: 'Keeps embedded content at a fixed ratio.',
    previews: [
      { name: 'aspect-ratio-demo' },
    ],
  },
  {
    id: 'avatar',
    title: 'Avatar',
    icon: CircleUser,
    description: 'Image with a fallback shown while it loads or when it fails.',
    previews: [
      {
        name: 'avatar-props-demo',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'avatar-props-demo' },
          { id: 'compound', label: 'Compound', name: 'avatar-demo' },
        ],
      },
    ],
  },
  {
    id: 'badge',
    title: 'Badge',
    icon: Tag,
    description: 'Uppercase pill used for status; five variants.',
    previews: [
      { name: 'badge-variants', label: 'Variants' },
      { name: 'badge-demo', label: 'Default' },
      { name: 'badge-secondary', label: 'Secondary' },
      { name: 'badge-state', label: 'State' },
    ],
  },
  {
    id: 'breadcrumb',
    title: 'Breadcrumb',
    icon: ChevronRight,
    description:
      'Ancestor trail with a chevron separator; the last item renders as static text.',
    previews: [
      {
        name: 'breadcrumb-props-demo',
        label: 'Default',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'breadcrumb-props-demo' },
          { id: 'compound', label: 'Compound', name: 'breadcrumb-demo' },
        ],
      },
      {
        name: 'breadcrumb-dropdown-props-demo',
        label: 'Dropdown',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'breadcrumb-dropdown-props-demo' },
          { id: 'compound', label: 'Compound', name: 'breadcrumb-dropdown' },
        ],
      },
      {
        name: 'breadcrumb-ellipsis-props-demo',
        label: 'Ellipsis',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'breadcrumb-ellipsis-props-demo' },
          { id: 'compound', label: 'Compound', name: 'breadcrumb-ellipsis' },
        ],
      },
      {
        name: 'breadcrumb-link-props-demo',
        label: 'Link',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'breadcrumb-link-props-demo' },
          { id: 'compound', label: 'Compound', name: 'breadcrumb-link' },
        ],
      },
      {
        name: 'breadcrumb-responsive-props-demo',
        label: 'Responsive',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'breadcrumb-responsive-props-demo' },
          { id: 'compound', label: 'Compound', name: 'breadcrumb-responsive' },
        ],
      },
      {
        name: 'breadcrumb-separator-props-demo',
        label: 'Separator',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'breadcrumb-separator-props-demo' },
          { id: 'compound', label: 'Compound', name: 'breadcrumb-separator' },
        ],
      },
    ],
  },
  {
    id: 'button',
    title: 'Button',
    icon: MousePointerClick,
    description:
      'Nine variants, five sizes, icons on either side, loading and block states.',
    previews: [
      { name: 'button-variants', label: 'Variants' },
      { name: 'button-sizes', label: 'Sizes' },
      { name: 'button-icons', label: 'With icons' },
      { name: 'button-states', label: 'States' },
      { name: 'button-block', label: 'Block' },
      { name: 'button-as-child', label: 'As child' },
      { name: 'button-floating-plate', label: 'Floating plate' },
    ],
  },
  {
    id: 'calendar',
    title: 'Calendar',
    icon: Calendar,
    description: 'Single and range date selection built on React DayPicker.',
    previews: [
      { name: 'calendar-demo', label: 'Default' },
      { name: 'calendar-disabled-days-demo', label: 'Disabled days' },
      { name: 'calendar-form', label: 'Form' },
    ],
  },
  {
    id: 'card',
    title: 'Card',
    icon: CreditCard,
    description: 'Panel with border-separated header, content and footer sections.',
    previews: [
      {
        name: 'card-props-demo',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'card-props-demo' },
          { id: 'compound', label: 'Compound', name: 'card-demo' },
        ],
      },
    ],
  },
  {
    id: 'chart',
    title: 'Chart',
    icon: BarChart3,
    description:
      'Responsive Recharts wrapper with theme-aware colour configuration, tooltips and legends.',
    previews: [
      {
        name: 'chart-props-demo',
        label: 'Default',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'chart-props-demo' },
          { id: 'compound', label: 'Compound', name: 'chart-bar-demo' },
        ],
      },
      { name: 'chart-bar-demo-axis', label: 'Axis' },
      { name: 'chart-bar-demo-grid', label: 'Grid' },
      { name: 'chart-bar-demo-legend', label: 'Legend' },
      { name: 'chart-bar-demo-tooltip', label: 'Tooltip' },
    ],
  },
  {
    id: 'checkbox',
    title: 'Checkbox',
    icon: CheckSquare,
    description:
      'Sunk control surface that inverts to the foreground colour when checked.',
    previews: [
      { name: 'checkbox-demo', label: 'Default' },
      { name: 'checkbox-disabled', label: 'Disabled' },
      { name: 'checkbox-form-multiple', label: 'Form multiple' },
      { name: 'checkbox-form-single', label: 'Form single' },
      { name: 'checkbox-with-text', label: 'With text' },
    ],
  },
  {
    id: 'collapsible',
    title: 'Collapsible',
    icon: ChevronDown,
    description: 'Single disclosure region without the list chrome.',
    previews: [
      {
        name: 'collapsible-props-demo',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'collapsible-props-demo' },
          { id: 'compound', label: 'Compound', name: 'collapsible-demo' },
        ],
      },
    ],
  },
  {
    id: 'command',
    title: 'Command',
    icon: Terminal,
    description:
      'Searchable command menu with grouped items, shortcuts and dialog composition.',
    previews: [
      {
        name: 'command-props-demo',
        label: 'Inline',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'command-props-demo' },
          { id: 'compound', label: 'Compound', name: 'command-demo' },
        ],
      },
      {
        name: 'command-dialog-props-demo',
        label: 'Dialog',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'command-dialog-props-demo' },
          { id: 'compound', label: 'Compound', name: 'command-dialog' },
        ],
      },
    ],
  },
  {
    id: 'context-menu',
    title: 'Context Menu',
    icon: MousePointerClick,
    description: 'Right-click menu with sub-menus, checkbox and radio items.',
    previews: [
      {
        name: 'context-menu-props-demo',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'context-menu-props-demo' },
          { id: 'compound', label: 'Compound', name: 'context-menu-demo' },
        ],
      },
    ],
  },
  {
    id: 'date-field',
    title: 'Date Field',
    icon: CalendarDays,
    description:
      "ui-specific: a single typeable date input with MUI-style segments (day/month/year), not a port. Type digits, use arrow up/down to step a segment, arrow left/right to move between segments, backspace to clear, or paste a full date; optional minDate/maxDate mark aria-invalid without blocking typing. Standalone here — DatePicker composes it with a calendar popover.",
    previews: [{ name: 'date-field-demo' }],
  },
  {
    id: 'dialog',
    title: 'Dialog',
    icon: AppWindow,
    description: 'Modal built on Radix, with header, section and footer slots.',
    previews: [
      {
        name: 'dialog-props-demo',
        label: 'Default',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'dialog-props-demo' },
          { id: 'compound', label: 'Compound', name: 'dialog-demo' },
        ],
      },
      {
        name: 'dialog-centered-off-props-demo',
        label: 'Centered off',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'dialog-centered-off-props-demo' },
          { id: 'compound', label: 'Compound', name: 'dialog-centered-off' },
        ],
      },
      {
        name: 'dialog-close-button-props-demo',
        label: 'Close button',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'dialog-close-button-props-demo' },
          { id: 'compound', label: 'Compound', name: 'dialog-close-button' },
        ],
      },
    ],
  },
  {
    id: 'drawer',
    title: 'Drawer',
    icon: PanelRightOpen,
    description:
      'Touch-friendly sliding panel with directional layouts and drag gestures.',
    previews: [
      {
        name: 'drawer-props-demo',
        label: 'Default',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'drawer-props-demo' },
          { id: 'compound', label: 'Compound', name: 'drawer-demo' },
        ],
      },
      {
        name: 'drawer-dialog-props-demo',
        label: 'Responsive',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'drawer-dialog-props-demo' },
          { id: 'compound', label: 'Compound', name: 'drawer-dialog' },
        ],
      },
    ],
  },
  {
    id: 'dropdown-menu',
    title: 'Dropdown Menu',
    icon: Menu,
    description: 'Menu with labels, separators, shortcuts and submenus.',
    previews: [
      {
        name: 'dropdown-menu-props-demo',
        label: 'Default',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'dropdown-menu-props-demo' },
          { id: 'compound', label: 'Compound', name: 'dropdown-menu-demo' },
        ],
      },
      {
        name: 'dropdown-menu-checkboxes-props-demo',
        label: 'Checkboxes',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'dropdown-menu-checkboxes-props-demo' },
          { id: 'compound', label: 'Compound', name: 'dropdown-menu-checkboxes-demo' },
        ],
      },
      {
        name: 'dropdown-menu-radio-group-props-demo',
        label: 'Radio group',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'dropdown-menu-radio-group-props-demo' },
          { id: 'compound', label: 'Compound', name: 'dropdown-menu-radio-group-demo' },
        ],
      },
    ],
  },
  {
    id: 'floating-plate',
    title: 'Floating Plate',
    icon: Layers,
    description:
      'Opaque backing plate for a default Button floating over busy content (code, tables, gradients).',
    previews: [
      { name: 'floating-plate-demo' },
    ],
  },
  {
    id: 'form',
    title: 'Form',
    icon: FileText,
    description:
      'React Hook Form composition with accessible labels, descriptions and animated validation messages.',
    previews: [
      { name: 'input-form' },
    ],
  },
  {
    id: 'hover-card',
    title: 'Hover Card',
    icon: MousePointer,
    description: 'Richer preview surface shown after a hover delay.',
    previews: [
      {
        name: 'hover-card-props-demo',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'hover-card-props-demo' },
          { id: 'compound', label: 'Compound', name: 'hover-card-demo' },
        ],
      },
    ],
  },
  {
    id: 'input',
    title: 'Input',
    icon: TextCursorInput,
    description:
      'Sunk field surface with the shared size scale and an aria-invalid state; optional prefix/suffix (ui-specific) glue an icon or short label inside the same border.',
    previews: [
      { name: 'input-sizes', label: 'Sizes' },
      { name: 'input-states', label: 'States' },
      { name: 'input-demo', label: 'Default' },
      { name: 'input-disabled', label: 'Disabled' },
      { name: 'input-file', label: 'File' },
      { name: 'input-with-button', label: 'With button' },
      { name: 'input-with-label', label: 'With label' },
      { name: 'input-with-text', label: 'With text' },
      { name: 'input-with-prefix-suffix', label: 'With prefix/suffix' },
    ],
  },
  {
    id: 'input-otp',
    title: 'Input OTP',
    icon: KeyRound,
    description:
      'One-time-password field split into per-character slots, built on input-otp.',
    previews: [
      {
        name: 'input-otp-props-demo',
        label: 'Default',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'input-otp-props-demo' },
          { id: 'compound', label: 'Compound', name: 'input-otp-demo' },
        ],
      },
      {
        name: 'input-otp-controlled-props-demo',
        label: 'Controlled',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'input-otp-controlled-props-demo' },
          { id: 'compound', label: 'Compound', name: 'input-otp-controlled' },
        ],
      },
      {
        name: 'input-otp-form-props-demo',
        label: 'Form',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'input-otp-form-props-demo' },
          { id: 'compound', label: 'Compound', name: 'input-otp-form' },
        ],
      },
      {
        name: 'input-otp-separator-props-demo',
        label: 'Separator',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'input-otp-separator-props-demo' },
          { id: 'compound', label: 'Compound', name: 'input-otp-separator' },
        ],
      },
    ],
  },
  {
    id: 'kbd',
    title: 'Kbd',
    icon: Keyboard,
    description: 'Keyboard key hint; KbdGroup lays out a multi-key shortcut.',
    previews: [
      { name: 'kbd-demo' },
    ],
  },
  {
    id: 'label',
    title: 'Label',
    icon: Type,
    description: 'Radix label bound to a control; dims when its peer is disabled.',
    previews: [
      { name: 'label-demo' },
    ],
  },
  {
    id: 'menubar',
    title: 'Menubar',
    icon: Menu,
    description:
      'Desktop-app style menu bar (Radix Menubar) with DropdownMenu styling; `menus` takes the same MenuItem[] as DropdownMenu.',
    previews: [
      {
        name: 'menubar-props-demo',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'menubar-props-demo' },
          { id: 'compound', label: 'Compound', name: 'menubar-demo' },
        ],
      },
    ],
  },
  {
    id: 'navigation-menu',
    title: 'Navigation Menu',
    icon: Compass,
    description:
      'Site navigation (Radix NavigationMenu): links and panels of links sharing one resizing viewport.',
    previews: [
      {
        name: 'navigation-menu-props-demo',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'navigation-menu-props-demo' },
          { id: 'compound', label: 'Compound', name: 'navigation-menu-demo' },
        ],
      },
    ],
  },
  {
    id: 'number-input',
    title: 'Number Input',
    icon: Hash,
    description:
      'Numeric spinbutton with − / + buttons, min/max/step clamping, ↑/↓, PageUp/PageDown and Home/End.',
    previews: [
      { name: 'number-input-demo', label: 'Default' },
      { name: 'number-input-formatted', label: 'Formatting & states' },
    ],
  },
  {
    id: 'pagination',
    title: 'Pagination',
    icon: ChevronsLeftRight,
    description:
      'Page navigation with first/last, current ± siblings and ellipses — links via getHref, or buttons for client-side paging.',
    previews: [
      {
        name: 'pagination-props-demo',
        label: 'Default',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'pagination-props-demo' },
          { id: 'compound', label: 'Compound', name: 'pagination-demo' },
        ],
      },
      {
        name: 'pagination-links-props-demo',
        label: 'Links',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'pagination-links-props-demo' },
          { id: 'compound', label: 'Compound', name: 'pagination-links' },
        ],
      },
    ],
  },
  {
    id: 'popover',
    title: 'Popover',
    icon: MessageSquare,
    description: 'Anchored surface for small forms and controls.',
    previews: [
      {
        name: 'popover-props-demo',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'popover-props-demo' },
          { id: 'compound', label: 'Compound', name: 'popover-demo' },
        ],
      },
    ],
  },
  {
    id: 'progress',
    title: 'Progress',
    icon: Loader,
    description: 'Determinate bar filled with the foreground colour.',
    previews: [
      { name: 'progress-demo' },
    ],
  },
  {
    id: 'radio-group',
    title: 'Radio Group',
    icon: CircleDot,
    description:
      'Standard items, plus large card-style, grid-card and stacked-list variants for pickers.',
    previews: [
      {
        name: 'radio-group-props-demo',
        label: 'Items',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'radio-group-props-demo' },
          { id: 'compound', label: 'Compound', name: 'radio-group-demo' },
        ],
      },
      {
        name: 'radio-group-large-props-demo',
        label: 'Large items',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'radio-group-large-props-demo' },
          { id: 'compound', label: 'Compound', name: 'radio-group-large' },
        ],
      },
      {
        name: 'radio-group-form-props-demo',
        label: 'Form',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'radio-group-form-props-demo' },
          { id: 'compound', label: 'Compound', name: 'radio-group-form' },
        ],
      },
      { name: 'radio-group-card-props-demo', label: 'Card', codeVariants: [
        { id: 'props', label: 'Props-driven', name: 'radio-group-card-props-demo' },
        { id: 'compound', label: 'Compound', name: 'radio-group-card-demo' },
      ] },
      { name: 'radio-group-card-form-props-demo', label: 'Card form', codeVariants: [
        { id: 'props', label: 'Props-driven', name: 'radio-group-card-form-props-demo' },
        { id: 'compound', label: 'Compound', name: 'radio-group-card-form' },
      ] },
      { name: 'radio-group-card-with-children-props-demo', label: 'Card with icon', codeVariants: [
        { id: 'props', label: 'Props-driven', name: 'radio-group-card-with-children-props-demo' },
        { id: 'compound', label: 'Compound', name: 'radio-group-card-with-children' },
      ] },
      { name: 'radio-group-stacked-props-demo', label: 'Stacked', codeVariants: [
        { id: 'props', label: 'Props-driven', name: 'radio-group-stacked-props-demo' },
        { id: 'compound', label: 'Compound', name: 'radio-group-stacked-demo' },
      ] },
      { name: 'radio-group-stacked-form-props-demo', label: 'Stacked form', codeVariants: [
        { id: 'props', label: 'Props-driven', name: 'radio-group-stacked-form-props-demo' },
        { id: 'compound', label: 'Compound', name: 'radio-group-stacked-form' },
      ] },
    ],
  },
  {
    id: 'resizable',
    title: 'Resizable',
    icon: MoveHorizontal,
    description:
      'Drag-resizable panel group (react-resizable-panels), with optional layout persistence.',
    previews: [
      {
        name: 'resizable-props-demo',
        label: 'Default',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'resizable-props-demo' },
          { id: 'compound', label: 'Compound', name: 'resizable-demo' },
        ],
      },
      {
        name: 'resizable-handle-props-demo',
        label: 'Handle',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'resizable-handle-props-demo' },
          { id: 'compound', label: 'Compound', name: 'resizable-handle' },
        ],
      },
      {
        name: 'resizable-vertical-props-demo',
        label: 'Vertical',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'resizable-vertical-props-demo' },
          { id: 'compound', label: 'Compound', name: 'resizable-vertical' },
        ],
      },
    ],
  },
  {
    id: 'select',
    title: 'Select',
    icon: ListFilter,
    description:
      'Radix select on the raised control surface, with grouped items and a separator.',
    previews: [
      {
        name: 'select-props-demo',
        label: 'Default',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'select-props-demo' },
          { id: 'compound', label: 'Compound', name: 'select-demo' },
        ],
      },
      {
        name: 'select-sizes-props-demo',
        label: 'Sizes',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'select-sizes-props-demo' },
          { id: 'compound', label: 'Compound', name: 'select-sizes' },
        ],
      },
      {
        name: 'select-groups-props-demo',
        label: 'Groups',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'select-groups-props-demo' },
          { id: 'compound', label: 'Compound', name: 'select-groups' },
        ],
      },
      {
        name: 'select-form-props-demo',
        label: 'Form',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'select-form-props-demo' },
          { id: 'compound', label: 'Compound', name: 'select-form' },
        ],
      },
      {
        name: 'select-scrollable-props-demo',
        label: 'Scrollable',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'select-scrollable-props-demo' },
          { id: 'compound', label: 'Compound', name: 'select-scrollable' },
        ],
      },
    ],
  },
  {
    id: 'separator',
    title: 'Separator',
    icon: Minus,
    description: 'One-pixel divider in either orientation.',
    previews: [
      { name: 'separator-demo' },
    ],
  },
  {
    id: 'sheet',
    title: 'Sheet',
    icon: PanelRight,
    description: 'Same primitive as Dialog, anchored to an edge of the viewport.',
    previews: [
      {
        name: 'sheet-props-demo',
        label: 'Default',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'sheet-props-demo' },
          { id: 'compound', label: 'Compound', name: 'sheet-demo' },
        ],
      },
      {
        name: 'sheet-nonmodal-props-demo',
        label: 'Nonmodal',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'sheet-nonmodal-props-demo' },
          { id: 'compound', label: 'Compound', name: 'sheet-nonmodal' },
        ],
      },
      {
        name: 'sheet-side-props-demo',
        label: 'Side',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'sheet-side-props-demo' },
          { id: 'compound', label: 'Compound', name: 'sheet-side' },
        ],
      },
      {
        name: 'sheet-confirm-on-close-props-demo',
        label: 'Confirm on close',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'sheet-confirm-on-close-props-demo' },
          { id: 'compound', label: 'Compound', name: 'sheet-confirm-on-close-demo' },
        ],
      },
    ],
  },
  {
    id: 'sidebar',
    title: 'Sidebar',
    icon: PanelLeft,
    description:
      'Responsive navigation shell with collapsible icon mode, mobile sheet and tooltip support.',
    previews: [
      { name: 'sidebar-demo' },
    ],
  },
  {
    id: 'skeleton',
    title: 'Skeleton',
    icon: Loader2,
    description: 'Pulsing placeholder for content that is still loading.',
    previews: [
      { name: 'skeleton-demo', label: 'Default' },
      { name: 'skeleton-card', label: 'Card' },
    ],
  },
  {
    id: 'slider',
    title: 'Slider',
    icon: SlidersHorizontal,
    description: 'Radix slider; pass two values for a range, with a label per thumb.',
    previews: [
      { name: 'slider-demo', label: 'Default' },
      { name: 'slider-range', label: 'Range' },
      { name: 'slider-sizes', label: 'Sizes' },
    ],
  },
  {
    id: 'sonner',
    title: 'Sonner',
    icon: BellRing,
    description: 'Theme-aware toast stack with status icons and button variants.',
    previews: [
      { name: 'sonner-demo', label: 'Default' },
      { name: 'sonner-types', label: 'Types' },
      { name: 'sonner-upload', label: 'Upload' },
    ],
  },
  {
    id: 'stepper',
    title: 'Stepper',
    icon: ListOrdered,
    description: 'Progress through a fixed sequence of steps; completed steps can be made clickable.',
    previews: [
      { name: 'stepper-demo', label: 'Horizontal' },
      { name: 'stepper-vertical', label: 'Vertical' },
    ],
  },
  {
    id: 'switch',
    title: 'Switch',
    icon: ToggleLeft,
    description: 'Three sizes; the checked track uses the brand fill.',
    previews: [
      { name: 'switch-sizes', label: 'Sizes' },
      { name: 'switch-states', label: 'States' },
      { name: 'switch-demo', label: 'Default' },
      { name: 'switch-form', label: 'Form' },
    ],
  },
  {
    id: 'table',
    title: 'Table',
    icon: TableIcon,
    description:
      'Responsive data table with scroll shadows, sortable headers and an optional sticky last column.',
    previews: [
      {
        name: 'table-props-demo',
        label: 'Default',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'table-props-demo' },
          { id: 'compound', label: 'Compound', name: 'table-demo' },
        ],
      },
      {
        name: 'table-sort-props-demo',
        label: 'Sortable',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'table-sort-props-demo' },
          { id: 'compound', label: 'Compound', name: 'table-sort-demo' },
        ],
      },
      {
        name: 'table-actions-props-demo',
        label: 'Actions',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'table-actions-props-demo' },
          { id: 'compound', label: 'Compound', name: 'table-actions' },
        ],
      },
      {
        name: 'table-cross-link-props-demo',
        label: 'Cross link',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'table-cross-link-props-demo' },
          { id: 'compound', label: 'Compound', name: 'table-cross-link' },
        ],
      },
      {
        name: 'table-icons-props-demo',
        label: 'Icons',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'table-icons-props-demo' },
          { id: 'compound', label: 'Compound', name: 'table-icons' },
        ],
      },
      {
        name: 'table-row-link-props-demo',
        label: 'Row link',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'table-row-link-props-demo' },
          { id: 'compound', label: 'Compound', name: 'table-row-link' },
        ],
      },
      {
        name: 'table-row-link-actions-props-demo',
        label: 'Row link actions',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'table-row-link-actions-props-demo' },
          { id: 'compound', label: 'Compound', name: 'table-row-link-actions' },
        ],
      },
    ],
  },
  {
    id: 'tabs',
    title: 'Tabs',
    icon: LayoutPanelTop,
    description: 'Tab list with an animated indicator driven by useTabIndicator.',
    previews: [
      {
        name: 'tabs-props-demo',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'tabs-props-demo' },
          { id: 'compound', label: 'Compound', name: 'tabs-demo' },
        ],
      },
    ],
  },
  {
    id: 'textarea',
    title: 'Textarea',
    icon: AlignLeft,
    description: 'Multi-line field sharing the Input surface, with an aria-invalid state.',
    previews: [
      { name: 'textarea-states', label: 'States' },
      { name: 'textarea-demo', label: 'Default' },
      { name: 'textarea-disabled', label: 'Disabled' },
      { name: 'textarea-form', label: 'Form' },
      { name: 'textarea-with-button', label: 'With button' },
      { name: 'textarea-with-label', label: 'With label' },
      { name: 'textarea-with-text', label: 'With text' },
    ],
  },
  {
    id: 'toggle',
    title: 'Toggle',
    icon: ToggleLeft,
    description: 'Single pressed/not-pressed button — for a toolbar-style on/off action.',
    previews: [
      { name: 'toggle-demo', label: 'Default' },
      { name: 'toggle-outline', label: 'Outline' },
      { name: 'toggle-with-text', label: 'With text' },
    ],
  },
  {
    id: 'toggle-group',
    title: 'Toggle Group',
    icon: Rows3,
    description: 'A row of Toggles sharing single/multiple selection state.',
    previews: [
      {
        name: 'toggle-group-props-demo',
        label: 'Default',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'toggle-group-props-demo' },
          { id: 'compound', label: 'Compound', name: 'toggle-group-demo' },
        ],
      },
      { name: 'toggle-group-segmented', label: 'Segmented' },
    ],
  },
  {
    id: 'tooltip',
    title: 'Tooltip',
    icon: MessageCircle,
    description: 'Short hint on hover or focus; requires a TooltipProvider.',
    previews: [
      {
        name: 'tooltip-props-demo',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'tooltip-props-demo' },
          { id: 'compound', label: 'Compound', name: 'tooltip-demo' },
        ],
      },
    ],
  },
]

const fragments: ComponentEntry[] = [
  {
    id: 'admonition',
    title: 'Admonition',
    icon: Info,
    description:
      'Callout built on Alert, with a type-driven icon/variant, optional actions and a horizontal/vertical/responsive layout.',
    previews: [
      { name: 'admonition-demo', label: 'Default' },
      { name: 'admonition-button', label: 'Button' },
      { name: 'admonition-button-split', label: 'Button split' },
      { name: 'admonition-description-only', label: 'Description only' },
      { name: 'admonition-destructive', label: 'Destructive' },
      { name: 'admonition-responsive', label: 'Responsive' },
      { name: 'admonition-sandwiched', label: 'Sandwiched' },
      { name: 'admonition-success', label: 'Success' },
      { name: 'admonition-warning', label: 'Warning' },
    ],
  },
  {
    id: 'form-item-layout',
    title: 'Form Item Layout',
    icon: Rows,
    description:
      'Label/description/error wrapper around a form field, sharing layout with FormField.',
    previews: [
      { name: 'form-item-layout-demo', label: 'Default' },
      { name: 'form-item-layout-after-label', label: 'After label' },
      { name: 'form-item-layout-before-label', label: 'Before label' },
      { name: 'form-item-layout-with-checkbox', label: 'With checkbox' },
      { name: 'form-item-layout-with-checkbox-list', label: 'With checkbox list' },
      { name: 'form-item-layout-with-horizontal', label: 'With horizontal' },
      { name: 'form-item-layout-with-select', label: 'With select' },
      { name: 'form-item-layout-with-switch', label: 'With switch' },
    ],
  },
  {
    id: 'form-fields',
    title: 'Form Fields',
    icon: FileText,
    description:
      "ui-specific: terser react-hook-form + zod fields (FormInput/FormSelect/FormCheckbox/FormSwitch/FormRadioGroup/FormTextarea/FormDatePicker) — each wraps the FormField/FormItem/FormLabel/FormControl/FormMessage ceremony behind a single `name`, so a field is one line instead of a whole render-prop tree.",
    previews: [{ name: 'form-fields-demo' }],
  },
  {
    id: 'info-tooltip',
    title: 'Info Tooltip',
    icon: HelpCircle,
    description:
      'Info-glyph trigger with a self-contained TooltipProvider, for inline hints.',
    previews: [
      { name: 'info-tooltip-demo' },
    ],
  },
  {
    id: 'empty-state',
    title: 'Empty State',
    icon: Inbox,
    description:
      'Dashed-border placeholder for a first-run feature state, with an icon, title and action slot.',
    previews: [
      { name: 'empty-state-presentational-demo', label: 'Presentational' },
      { name: 'empty-state-presentational-icon', label: 'Presentational icon' },
    ],
  },
  {
    id: 'error-display',
    title: 'Error Display',
    icon: AlertOctagon,
    description:
      'Card-based error panel with a monospace error message and a support-link footer.',
    previews: [
      { name: 'error-display-demo', label: 'Default' },
      { name: 'error-display-with-children', label: 'With children' },
    ],
  },
  {
    id: 'shimmering-loader',
    title: 'Shimmering Loader',
    icon: Sparkles,
    description:
      'Animated skeleton bar and its generic list/table loading compositions.',
    previews: [
      { name: 'shimmering-loader-demo' },
    ],
  },
  {
    id: 'metric-card',
    title: 'Metric Card',
    icon: TrendingUp,
    description:
      'Dashboard tile with a label/link header, value/differential and a Recharts sparkline.',
    previews: [
      {
        name: 'metric-card-props-demo',
        label: 'Default',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'metric-card-props-demo' },
          { id: 'compound', label: 'Compound', name: 'metric-card-demo' },
        ],
      },
      {
        name: 'metric-card-minimal-props-demo',
        label: 'Minimal',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'metric-card-minimal-props-demo' },
          { id: 'compound', label: 'Compound', name: 'metric-card-minimal' },
        ],
      },
      {
        name: 'metric-card-minimal-horizontal-props-demo',
        label: 'Minimal horizontal',
        codeVariants: [
          {
            id: 'props',
            label: 'Props-driven',
            name: 'metric-card-minimal-horizontal-props-demo',
          },
          { id: 'compound', label: 'Compound', name: 'metric-card-minimal-horizontal' },
        ],
      },
      {
        name: 'metric-card-with-icon-link-tooltip-props-demo',
        label: 'With icon link tooltip',
        codeVariants: [
          {
            id: 'props',
            label: 'Props-driven',
            name: 'metric-card-with-icon-link-tooltip-props-demo',
          },
          { id: 'compound', label: 'Compound', name: 'metric-card-with-icon-link-tooltip' },
        ],
      },
    ],
  },
  {
    id: 'multi-select',
    title: 'Multi Select',
    icon: ListChecks,
    description:
      'Command-driven combobox for picking several values, with badges, a creatable mode and an inline-search variant.',
    previews: [
      {
        name: 'multi-select-props-demo',
        label: 'Default',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'multi-select-props-demo' },
          { id: 'compound', label: 'Compound', name: 'multi-select-demo' },
        ],
      },
      {
        name: 'multi-select-badge-limit-props-demo',
        label: 'Badge limit',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'multi-select-badge-limit-props-demo' },
          { id: 'compound', label: 'Compound', name: 'multi-select-badge-limit' },
        ],
      },
      {
        name: 'multi-select-badge-limit-wrap-props-demo',
        label: 'Badge limit wrap',
        codeVariants: [
          {
            id: 'props',
            label: 'Props-driven',
            name: 'multi-select-badge-limit-wrap-props-demo',
          },
          { id: 'compound', label: 'Compound', name: 'multi-select-badge-limit-wrap' },
        ],
      },
      {
        name: 'multi-select-combobox-props-demo',
        label: 'Combobox',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'multi-select-combobox-props-demo' },
          { id: 'compound', label: 'Compound', name: 'multi-select-combobox' },
        ],
      },
      {
        name: 'multi-select-combobox-creatable-props-demo',
        label: 'Combobox creatable',
        codeVariants: [
          {
            id: 'props',
            label: 'Props-driven',
            name: 'multi-select-combobox-creatable-props-demo',
          },
          { id: 'compound', label: 'Compound', name: 'multi-select-combobox-creatable' },
        ],
      },
      {
        name: 'multi-select-deletable-badge-props-demo',
        label: 'Deletable badge',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'multi-select-deletable-badge-props-demo' },
          { id: 'compound', label: 'Compound', name: 'multi-select-deletable-badge' },
        ],
      },
      {
        name: 'multi-select-disabled-props-demo',
        label: 'Disabled',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'multi-select-disabled-props-demo' },
          { id: 'compound', label: 'Compound', name: 'multi-select-disabled' },
        ],
      },
      {
        name: 'multi-select-in-dialog-props-demo',
        label: 'In dialog',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'multi-select-in-dialog-props-demo' },
          { id: 'compound', label: 'Compound', name: 'multi-select-in-dialog' },
        ],
      },
      {
        name: 'multi-select-inline-search-input-props-demo',
        label: 'Inline search input',
        codeVariants: [
          {
            id: 'props',
            label: 'Props-driven',
            name: 'multi-select-inline-search-input-props-demo',
          },
          { id: 'compound', label: 'Compound', name: 'multi-select-inline-search-input' },
        ],
      },
      {
        name: 'multi-select-without-icon-props-demo',
        label: 'Without icon',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'multi-select-without-icon-props-demo' },
          { id: 'compound', label: 'Compound', name: 'multi-select-without-icon' },
        ],
      },
    ],
  },
  {
    id: 'combobox',
    title: 'Combobox',
    icon: ChevronsUpDown,
    description:
      'Searchable single-value select: Select-styled trigger, Popover + Command list, options or groups.',
    previews: [
      { name: 'combobox-demo', label: 'Default' },
      { name: 'combobox-groups', label: 'Groups' },
    ],
  },
  {
    id: 'file-upload',
    title: 'File Upload',
    icon: Upload,
    description:
      'Drop zone + Browse button with accept / maxSize / maxFiles validation, a removable file list, and a real file input for forms.',
    previews: [
      { name: 'file-upload-demo', label: 'Multiple' },
      { name: 'file-upload-single', label: 'Single file in a form' },
    ],
  },
  {
    id: 'date-picker',
    title: 'Date Picker',
    icon: CalendarDays,
    description:
      'Typeable segmented field (day/month/year) with a calendar-icon button that opens a Popover-wrapped Calendar; range/multiple modes fall back to a text-label trigger button.',
    previews: [
      {
        name: 'date-picker-props-demo',
        label: 'Default',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'date-picker-props-demo' },
          { id: 'compound', label: 'Compound', name: 'date-picker-demo' },
        ],
      },
      {
        name: 'date-picker-form-props-demo',
        label: 'Form',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'date-picker-form-props-demo' },
          { id: 'compound', label: 'Compound', name: 'date-picker-form' },
        ],
      },
      {
        name: 'date-picker-with-presets-props-demo',
        label: 'With presets',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'date-picker-with-presets-props-demo' },
          { id: 'compound', label: 'Compound', name: 'date-picker-with-presets' },
        ],
      },
      {
        name: 'date-picker-with-range-props-demo',
        label: 'With range',
        codeVariants: [
          { id: 'props', label: 'Props-driven', name: 'date-picker-with-range-props-demo' },
          { id: 'compound', label: 'Compound', name: 'date-picker-with-range' },
        ],
      },
    ],
  },
  {
    id: 'code-block',
    title: 'Code Block',
    icon: Code,
    description:
      'Syntax-highlighted code (react-syntax-highlighter, Monokai theme) with a hover-reveal copy button.',
    previews: [
      { name: 'code-block-demo' },
    ],
  },
  {
    id: 'data-input',
    title: 'Data Input',
    icon: Eye,
    description:
      'Input wrapped in an InputGroup with optional copy, password-style reveal and action slots.',
    previews: [
      { name: 'data-input-demo', label: 'Default' },
      { name: 'data-input-with-copy', label: 'With copy' },
      { name: 'data-input-with-copy-secret', label: 'With copy secret' },
      { name: 'data-input-with-reveal-copy-editable', label: 'With reveal copy editable' },
      { name: 'data-input-with-reveal-copy-editable-empty', label: 'With reveal copy editable empty' },
    ],
  },
  {
    id: 'timestamp-info',
    title: 'Timestamp Info',
    icon: Clock,
    description:
      'Formatted timestamp whose tooltip lists UTC, local, relative and raw values — each row copies on click.',
    previews: [
      { name: 'timestamp-info-demo' },
    ],
  },
  {
    id: 'status-code',
    title: 'Status Code',
    icon: Hash,
    description: 'HTTP method + status pill, coloured by the response class (2xx/4xx/5xx).',
    previews: [
      { name: 'status-code-demo' },
    ],
  },
  {
    id: 'text-link',
    title: 'Text Link',
    icon: LinkIcon,
    description: 'Inline link with an optional counter and an animated chevron.',
    previews: [
      { name: 'text-link-demo' },
    ],
  },
  {
    id: 'theme-toggle',
    title: 'Theme Toggle',
    icon: SunMoon,
    description:
      "Sun/moon icon button opening a System/Dark/Light dropdown, wired to this package's own ThemeProvider.",
    previews: [
      { name: 'theme-toggle-demo' },
    ],
  },
  {
    id: 'glass-panel',
    title: 'Glass Panel',
    icon: Layers,
    description:
      'Bordered feature card with an icon/logo header, used for marketing-style grids.',
    previews: [
      { name: 'glass-panel-demo' },
    ],
  },
  {
    id: 'row',
    title: 'Row',
    icon: GalleryHorizontal,
    description:
      'Horizontally scrollable row of equal-width items with edge-fade arrow navigation.',
    previews: [
      { name: 'row-demo' },
    ],
  },
]

export const COMPONENT_GROUPS: ComponentGroup[] = [
  { title: 'Layout primitives', entries: layoutPrimitives },
  { title: 'Atom components', entries: atoms },
  { title: 'Fragment components', entries: fragments },
]

const ENTRIES_BY_ID = new Map(
  COMPONENT_GROUPS.flatMap((group) => group.entries).map((entry) => [entry.id, entry])
)

export function findComponent(id: string): ComponentEntry | undefined {
  return ENTRIES_BY_ID.get(id)
}
