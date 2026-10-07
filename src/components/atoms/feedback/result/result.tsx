import { cva } from 'class-variance-authority'
import {
  AlertTriangle,
  CheckCircle2,
  FileQuestion,
  Info,
  Lock,
  ServerCrash,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import * as React from 'react'

import { cn } from '../../../../lib/utils'

/*
 * A full-section outcome: an icon, a title, a line of explanation and the next actions.
 * The four status values cover the result of an operation; 403 / 404 / 500 are the usual
 * error pages. The title is a heading (`level` sets which), and the icon is decorative
 * unless the status text itself is what the user needs to hear.
 */

const STATUS = {
  success: { icon: CheckCircle2, tone: 'text-brand-600' },
  error: { icon: XCircle, tone: 'text-destructive' },
  warning: { icon: AlertTriangle, tone: 'text-warning' },
  info: { icon: Info, tone: 'text-foreground-light' },
  '403': { icon: Lock, tone: 'text-warning' },
  '404': { icon: FileQuestion, tone: 'text-foreground-light' },
  '500': { icon: ServerCrash, tone: 'text-destructive' },
} as const satisfies Record<string, { icon: LucideIcon; tone: string }>

export type ResultStatus = keyof typeof STATUS

const resultVariants = cva('flex flex-col items-center text-center', {
  variants: {
    size: {
      small: 'gap-1.5 py-6',
      medium: 'gap-2 py-10',
      large: 'gap-3 py-16',
    },
  },
  defaultVariants: { size: 'medium' },
})

const iconSize = { small: 'h-10 w-10', medium: 'h-14 w-14', large: 'h-20 w-20' } as const
const titleSize = { small: 'text-base', medium: 'text-xl', large: 'text-2xl' } as const

export interface ResultProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** @default "info" */
  status?: ResultStatus
  title: React.ReactNode
  description?: React.ReactNode
  /** Replaces the status icon. */
  icon?: React.ReactNode
  /** Actions under the text, e.g. buttons. */
  extra?: React.ReactNode
  /** @default "medium" */
  size?: 'small' | 'medium' | 'large'
  /** Heading level of the title. @default 2 */
  level?: 1 | 2 | 3 | 4
  classNames?: { icon?: string; title?: string; description?: string; extra?: string }
}

const Result = React.forwardRef<HTMLDivElement, ResultProps>(
  (
    {
      status = 'info',
      title,
      description,
      icon,
      extra,
      size = 'medium',
      level = 2,
      className,
      classNames,
      children,
      ...props
    },
    ref
  ) => {
    const { icon: Icon, tone } = STATUS[status]
    const Heading = `h${level}` as const

    return (
      <div
        ref={ref}
        data-status={status}
        className={cn(resultVariants({ size }), className)}
        {...props}
      >
        <span className={cn('mb-1 inline-flex', tone, classNames?.icon)} aria-hidden="true">
          {icon ?? <Icon className={iconSize[size ?? 'medium']} strokeWidth={1.5} />}
        </span>
        <Heading
          className={cn('font-medium text-foreground', titleSize[size ?? 'medium'], classNames?.title)}
        >
          {title}
        </Heading>
        {description != null && (
          <p className={cn('max-w-md text-sm text-foreground-light', classNames?.description)}>
            {description}
          </p>
        )}
        {children}
        {extra != null && (
          <div className={cn('mt-4 flex flex-wrap items-center justify-center gap-2', classNames?.extra)}>
            {extra}
          </div>
        )}
      </div>
    )
  }
)
Result.displayName = 'Result'

export { Result }
