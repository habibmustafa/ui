import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { cn } from '../../src'
import { CATALOG, COMPONENT_COUNT } from '../catalog'
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
      <h1 className="scroll-m-20 text-3xl tracking-tight">Komponentlər</h1>
      <p className="mt-2 text-lg text-foreground-light">
        {COMPONENT_COUNT} komponent, roluna görə qruplaşdırılıb. Hər səhifədə canlı nümunə, kod və
        props cədvəli var.
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
            placeholder="Ad və ya təsvirə görə süz…"
            aria-label="Komponentləri süz"
            className="h-9 w-full rounded-md border border-control bg-field pl-8 pr-8 text-sm text-foreground placeholder:text-foreground-muted focus-ring [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              aria-label="Süzgəci təmizlə"
              onClick={() => setQuery('')}
              className="focus-ring absolute right-1.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-foreground-lighter hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div role="group" aria-label="Rol" className="flex flex-wrap gap-1.5">
          {[{ key: null, title: 'Hamısı', count: COMPONENT_COUNT }, ...CATALOG.map((g) => ({ key: g.key, title: g.title, count: g.entries.length }))].map(
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
        {shown} komponent göstərilir
      </p>
      <div role="none" className="mt-6 mb-6 h-px w-full shrink-0 bg-border-muted" />

      {groups.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <p className="text-sm text-foreground">“{query}” üçün nəticə yoxdur.</p>
          <button
            type="button"
            onClick={() => {
              setQuery('')
              selectGroup(null)
            }}
            className="focus-ring mt-2 rounded-xs text-sm text-foreground-light underline underline-offset-2 hover:text-foreground"
          >
            Süzgəcləri təmizlə
          </button>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.key} aria-labelledby={`group-${group.key}`} className="mb-10">
            <h2 id={`group-${group.key}`} className="font-mono text-xs uppercase text-foreground-muted">
              {group.title}
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.entries.map((entry) => {
                const Icon = entry.icon
                return (
                  <Link
                    key={entry.id}
                    to={`/components/${entry.id}`}
                    className="focus-ring group flex gap-3 rounded-md border bg-studio p-4 transition-colors hover:border-foreground-lighter"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-surface-100 text-foreground-muted transition-colors group-hover:text-foreground">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{entry.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-foreground-light">
                        {entry.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
