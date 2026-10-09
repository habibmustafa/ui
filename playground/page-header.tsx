import { cn } from '../src'
import { PAGE_TITLE } from './design'

/* Shared page anatomy: every route gets the same title and comfortable reading width. */
export function PageHeader({ title, description, eyebrow, divider = true }: {
  title: string
  description: string
  eyebrow?: string
  divider?: boolean
}) {
  return (
    <header className={divider ? 'mb-6 border-b pb-7' : undefined}>
      {eyebrow && <p className="mb-3 text-xs font-medium uppercase tracking-widest text-foreground-lighter">{eyebrow}</p>}
      <h1 className={cn('max-w-3xl scroll-m-28', PAGE_TITLE)}>{title}</h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-foreground-light sm:text-lg">{description}</p>
    </header>
  )
}
