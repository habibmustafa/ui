/* Shared page anatomy: every route gets an h1 title, a lede and a divider. */
export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <>
      <h1 className="scroll-m-20 text-3xl tracking-tight">{title}</h1>
      <p className="mt-2 text-lg text-foreground-light">{description}</p>
      <div role="none" className="mt-6 mb-6 h-px w-full shrink-0 bg-border-muted" />
    </>
  )
}
