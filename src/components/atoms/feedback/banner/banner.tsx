'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import * as React from 'react'

import { useControllableState } from '../../../../lib/use-controllable-state'
import { cn } from '../../../../lib/utils'

/*
 * Full-width announcement strip (maintenance windows, new features, billing notices).
 * Text is always `foreground` on a tinted background — warning/destructive text tokens
 * can't reach 4.5:1 on their light tints — and the tint carries the meaning. It's a
 * labelled region, not role="alert": banners are usually present on load, and an alert
 * would interrupt the screen reader every time the page opens.
 */

const bannerVariants = cva('relative flex w-full items-center gap-3 border-b px-4 py-2.5 text-sm text-foreground', {
  variants: {
    variant: {
      default: 'bg-surface-200 border-default',
      brand: 'bg-brand-200 border-brand-500',
      warning: 'bg-warning-200 border-warning-500',
      destructive: 'bg-destructive-200 border-destructive-500',
    },
  },
  defaultVariants: { variant: 'default' },
})

export interface BannerProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'title'>,
    VariantProps<typeof bannerVariants> {
  icon?: React.ReactNode
  title?: React.ReactNode
  /** Buttons/links shown at the end (e.g. "Learn more"). */
  action?: React.ReactNode
  /** Show a close button. */
  dismissible?: boolean
  open?: boolean
  /** @default true */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Accessible name of the region. Defaults to the `title` (or "Announcement" without
   *  one), so several banners on a page stay distinguishable landmarks. */
  'aria-label'?: string
  /** Accessible name of the close button. @default "Dismiss" */
  dismissLabel?: string
}

const Banner = React.forwardRef<HTMLElement, BannerProps>(
  (
    {
      className,
      variant,
      icon,
      title,
      action,
      dismissible = false,
      open: openProp,
      defaultOpen = true,
      onOpenChange,
      'aria-label': ariaLabel,
      dismissLabel = 'Dismiss',
      children,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = useControllableState({
      value: openProp,
      defaultValue: defaultOpen,
      onChange: onOpenChange,
    })
    const titleId = React.useId()
    if (!open) return null

    return (
      <section
        ref={ref}
        aria-label={ariaLabel ?? (title == null ? 'Announcement' : undefined)}
        aria-labelledby={ariaLabel == null && title != null ? titleId : undefined}
        className={cn(bannerVariants({ variant }), dismissible && 'pr-12', className)}
        {...props}
      >
        {icon != null && (
          <span aria-hidden="true" className="flex shrink-0 items-center text-foreground-light [&_svg]:h-4 [&_svg]:w-4">
            {icon}
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          {title != null && (
            <p id={titleId} className="font-medium">
              {title}
            </p>
          )}
          {children != null && <div className="text-foreground-light">{children}</div>}
        </div>
        {action != null && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        {dismissible && (
          <button
            type="button"
            aria-label={dismissLabel}
            onClick={() => setOpen(false)}
            className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-foreground-light transition-colors hover:bg-black/5 hover:text-foreground focus-ring dark:hover:bg-white/10"
          >
            <X aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
      </section>
    )
  }
)
Banner.displayName = 'Banner'

export { Banner, bannerVariants }
