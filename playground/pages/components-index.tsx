import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { cn } from '../../src'
import { CATALOG, COMPONENT_COUNT } from '../catalog'
import { ComponentThumbnail } from '../component-thumbnail'
import { Link, useRouter } from '../router'

/*
 * All components, grouped by role, with a text filter (title + description) and role
 * chips. The chosen role lives in the URL (`?group=forms`) so a link can point at it.
 */

function groupFromPath(path: string) {
  const query = path.split('?')[1] ?? ''
  const group = new URLSearchParams(query).get('group')
  return CATALOG.some((g) => g.key === group) ? group : null
}

/** Examples that read better with a wider cell. */
const WIDE = new Set([
  'data-table',
  'table',
  'chart',
  'form-fields',
  'carousel',
  'resizable',
  'sidebar',
  'code-block',
  'descriptions',
  'virtual-list',
])

const chip =
  'focus-ring inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs transition-colors'

export default function ComponentsIndexPage() {
  const { path, navigate } = useRouter()
  const activeGroup = groupFromPath(path)
  const [query, setQuery] = useState('')
  const needle = query.trim().toLocaleLowerCase()

  const groups = useMemo(
    () =>
      CATALOG.filter((group) => !activeGroup || group.key === activeGroup)
        .map((group) => ({
          ...group,
          entries: group.entries.filter(
            (entry) =>
              !needle ||
              entry.title.toLocaleLowerCase().includes(needle) ||
              entry.description.toLocaleLowerCase().includes(needle)
          ),
        }))
        .filter((group) => group.entries.length > 0),
    [activeGroup, needle]
  )
  const shown = groups.reduce((sum, group) => sum + group.entries.length, 0)

  const selectGroup = (key: string | null) =>
    navigate(key ? `/components?group=${key}` : '/components', { replace: true })

  return (
    <div className="flex flex-col">
      <h1 className="scroll-m-20 text-3xl tracking-tight">Components</h1>
      <p className="mt-2 text-lg text-foreground-light">
        {COMPONENT_COUNT} components, grouped by role. Every page has live examples, code and a
        props table.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <div className="relative max-w-md">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by name or description…"
            aria-label="Filter components"
            className="h-9 w-full rounded-md border border-control bg-field pl-8 pr-8 text-sm text-foreground placeholder:text-foreground-muted focus-ring [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear filter"
              onClick={() => setQuery('')}
              className="focus-ring absolute right-1.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-foreground-lighter hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div role="group" aria-label="Role" className="flex flex-wrap gap-1.5">
          {[{ key: null, title: 'All', count: COMPONENT_COUNT }, ...CATALOG.map((g) => ({ key: g.key, title: g.title, count: g.entries.length }))].map(
            (item) => {
              const active = item.key === activeGroup
              return (
                <button
                  key={item.key ?? 'all'}
                  type="button"
                  aria-pressed={active}
                  onClick={() => selectGroup(item.key)}
                  className={cn(
                    chip,
                    active
                      ? 'border-foreground-lighter bg-surface-200 text-foreground'
                      : 'border-default text-foreground-light hover:border-foreground-muted hover:text-foreground'
                  )}
                >
                  {item.title}
                  <span className="font-mono text-[10px] text-foreground-muted">{item.count}</span>
                </button>
              )
            }
          )}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {shown} components shown
      </p>
      <div role="none" className="mt-6 mb-6 h-px w-full shrink-0 bg-border-muted" />

      {groups.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <p className="text-sm text-foreground">No results for “{query}”.</p>
          <button
            type="button"
            onClick={() => {
              setQuery('')
              selectGroup(null)
            }}
            className="focus-ring mt-2 rounded-xs text-sm text-foreground-light underline underline-offset-2 hover:text-foreground"
          >
            Clear filters
          </button>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.key} aria-labelledby={`group-${group.key}`} className="mb-12">
            <div className="flex items-baseline gap-2">
              <h2 id={`group-${group.key}`} className="text-base font-medium text-foreground">
                {group.title}
              </h2>
              <span aria-hidden="true" className="text-sm tabular-nums text-foreground-muted">
                {group.entries.length}
              </span>
            </div>
            <div className="mt-4 grid grid-flow-dense gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.entries.map((entry) => (
                // The card is not itself a link: the live example inside can contain links
                // (a breadcrumb, a text link), and an <a> cannot nest in an <a>. The title is
                // the link, and its ::after stretches over the whole card.
                <article
                  key={entry.id}
                  className={cn(
                    'group relative flex flex-col overflow-hidden rounded-lg border bg-studio transition-colors hover:border-foreground-lighter',
                    'has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-offset-2 has-[a:focus-visible]:ring-offset-background',
                    WIDE.has(entry.id) && 'lg:col-span-2'
                  )}
                >
                  <ComponentThumbnail id={entry.id} name={entry.previews[0].name} />
                  <div className="p-4">
                    <h3 className="text-sm font-medium">
                      <Link
                        to={`/components/${entry.id}`}
                        className="outline-hidden after:absolute after:inset-0 after:content-['']"
                      >
                        {entry.title}
                      </Link>
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-foreground-light">{entry.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
