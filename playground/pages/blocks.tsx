import { ArrowUpRight, Search, X } from 'lucide-react'
import { useCallback, useEffect } from 'react'

import { cn } from '../../src'
import { BlockThumbnail } from '../block-preview'
import { BLOCKS, BLOCK_CATEGORIES } from '../blocks/registry'
import { FILTER_ACTIVE, FILTER_CHIP, FILTER_IDLE, PANEL } from '../design'
import { PageHeader } from '../page-header'
import { Link, useRouter } from '../router'

export default function BlocksPage() {
  const { path, navigate } = useRouter()
  const params = new URLSearchParams(path.split('?')[1])
  const rawCategory = params.get('category')
  const category = BLOCK_CATEGORIES.find((name) => name === rawCategory) ?? 'All'
  const query = params.get('q') ?? ''
  const needle = query.trim().toLowerCase()
  const shown = BLOCKS.filter((block) => (category === 'All' || block.category === category) && (!needle || (block.title + ' ' + block.description).toLowerCase().includes(needle)))

  const updateQuery = useCallback((updates: Record<string, string | null>, replace = false) => {
    const next = new URLSearchParams(path.split('?')[1])
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    const search = next.toString()
    navigate('/blocks' + (search ? '?' + search : ''), { replace })
  }, [path, navigate])

  // Keep previously shared /blocks#dashboard and /blocks?block=dashboard links working
  // now that every block has its own page.
  useEffect(() => {
    const legacy = () => {
      const id = new URLSearchParams(window.location.search).get('block') ?? window.location.hash.slice(1)
      if (BLOCKS.some((block) => block.id === id)) navigate('/blocks/' + id, { replace: true })
    }
    legacy()
    window.addEventListener('hashchange', legacy)
    return () => window.removeEventListener('hashchange', legacy)
  }, [navigate])

  return (
    <div>
      <PageHeader title="A head start for every screen." eyebrow="The block collection" description={BLOCKS.length + ' ready-to-use screens. Find your starting point, try it on desktop or mobile, and make it your own.'} divider={false} />
      <div className="mt-8 flex flex-col gap-4 rounded-xl border bg-surface-75 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-lighter" />
            <input id="blocks-search" type="search" aria-label="Search blocks" placeholder="Find a screen…" value={query} onChange={(event) => updateQuery({ q: event.target.value }, true)} className="focus-ring h-10 w-full rounded-lg border border-control bg-field pl-9 pr-9 text-sm placeholder:text-foreground-muted [&::-webkit-search-cancel-button]:hidden" />
            {query && <button type="button" aria-label="Clear search" onClick={() => updateQuery({ q: null }, true)} className="focus-ring absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-foreground-light"><X className="h-3.5 w-3.5" /></button>}
          </div>
          <p aria-live="polite" className="text-xs text-foreground-lighter">{shown.length} of {BLOCKS.length} screens</p>
        </div>
        <div role="group" aria-label="Filter by kind" className="flex flex-wrap gap-1.5">
          {(['All', ...BLOCK_CATEGORIES] as const).map((name) => (
            <button key={name} type="button" aria-pressed={category === name} onClick={() => updateQuery({ category: name === 'All' ? null : name }, true)} className={cn(FILTER_CHIP, category === name ? FILTER_ACTIVE : FILTER_IDLE)}>
              {name}<span className="text-[10px] tabular-nums text-foreground-lighter">{name === 'All' ? BLOCKS.length : BLOCKS.filter((block) => block.category === name).length}</span>
            </button>
          ))}
        </div>
      </div>

      {shown.length ? <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((block, index) => {
          return (
            <article key={block.id} className={cn(PANEL, 'group relative flex min-w-0 flex-col overflow-hidden transition-colors hover:border-brand-500 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring')}>
              <BlockThumbnail block={block} eager={index < 3} />
              <div className="flex flex-1 flex-col p-5">
                <span className="mb-2 text-[10px] font-medium uppercase tracking-widest text-foreground-lighter">{block.category}</span>
                <h2 className="flex items-center justify-between gap-2 text-base font-semibold">
                  <Link id={'block-' + block.id} to={'/blocks/' + block.id} aria-label={`${block.title} — open preview`} className="outline-hidden after:absolute after:inset-0">
                    {block.title}
                  </Link>
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-foreground-lighter transition-colors group-hover:text-brand-600" />
                </h2>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground-light">{block.description}</p>
                <span className="mt-4 text-xs text-foreground-lighter">{block.uses.length} components</span>
              </div>
            </article>
          )
        })}
      </div> : <div className="mt-7 rounded-xl border border-dashed px-6 py-16 text-center">
        <p className="text-base font-medium">No screens found</p>
        <p className="mt-2 text-sm text-foreground-light">Try another name or browse all categories.</p>
        <button type="button" onClick={() => updateQuery({ q: null, category: null }, true)} className="focus-ring mt-4 cursor-pointer rounded-md px-3 py-2 text-sm text-brand-600 underline underline-offset-4">Clear filters</button>
      </div>}

    </div>
  )
}
