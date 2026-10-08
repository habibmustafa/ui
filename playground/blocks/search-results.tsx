import { BookOpen, Compass, Newspaper, Search } from 'lucide-react'
import { Fragment, useMemo, useState, type ReactNode } from 'react'

import { Input, Kbd, Pagination, Tabs } from '../../src'

type Kind = 'Docs' | 'Guides' | 'Changelog'

interface Result {
  title: string
  kind: Kind
  excerpt: string
}

const RESULTS: Result[] = [
  { title: 'Validate a form with react-hook-form', kind: 'Guides', excerpt: 'Connect any form field to a schema and show the error under the right control.' },
  { title: 'Form fields', kind: 'Docs', excerpt: 'One line per field: label, control, description and message wired together.' },
  { title: 'Theme a form to your brand', kind: 'Guides', excerpt: 'Pick one colour and every form control, focus ring and error state follows it.' },
  { title: 'Date range picker', kind: 'Docs', excerpt: 'Choose a start and an end date in one field, with presets and limits.' },
  { title: '0.4.0: sixteen new components', kind: 'Changelog', excerpt: 'Carousel, rating, gauge, mentions, QR code and more, plus translatable labels.' },
  { title: 'Make a form accessible', kind: 'Guides', excerpt: 'Labels, descriptions and focus after a failed submit, without extra code.' },
  { title: 'File upload', kind: 'Docs', excerpt: 'Drop zone with type and size limits and a form-ready value.' },
  { title: '0.3.0: forms for every control', kind: 'Changelog', excerpt: 'A form wrapper for every remaining control, so no field needs a render prop.' },
  { title: 'Input OTP', kind: 'Docs', excerpt: 'A one-time code split into slots, ready for a form.' },
]

const KIND_ICON: Record<Kind, ReactNode> = {
  Docs: <BookOpen />,
  Guides: <Compass />,
  Changelog: <Newspaper />,
}

const PAGE_SIZE = 3
const TABS: (Kind | 'All')[] = ['All', 'Docs', 'Guides', 'Changelog']

/** Wraps each occurrence of the query in <mark>, so the match is visible without reading twice. */
function Highlight({ text, query }: { text: string; query: string }) {
  const needle = query.trim()
  if (!needle) return <>{text}</>
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'ig'))
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <mark key={index} className="rounded-xs bg-brand-300 px-0.5 text-foreground">
            {part}
          </mark>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        )
      )}
    </>
  )
}

export default function SearchResults() {
  const [query, setQuery] = useState('form')
  const [kind, setKind] = useState<Kind | 'All'>('All')
  const [page, setPage] = useState(1)

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return RESULTS.filter(
      (result) =>
        (kind === 'All' || result.kind === kind) &&
        (!needle || `${result.title} ${result.excerpt}`.toLowerCase().includes(needle))
    )
  }, [query, kind])

  const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE))
  const current = Math.min(page, pages)
  const visible = matches.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div className="border-b p-4">
        <Input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setPage(1)
          }}
          prefix={<Search className="h-4 w-4 text-foreground-muted" aria-hidden="true" />}
          suffix={<Kbd>/</Kbd>}
          placeholder="Search the documentation"
          aria-label="Search the documentation"
          size="large"
        />
      </div>

      <div className="px-4">
        <Tabs
          value={kind}
          onValueChange={(value: string) => {
            setKind(value as Kind | 'All')
            setPage(1)
          }}
          classNames={{ list: 'w-fit gap-6', trigger: 'flex-none px-0' }}
          items={TABS.map((tab) => ({ value: tab, label: tab, content: null }))}
        />
      </div>

      <p className="border-t bg-surface-75 px-4 py-2 text-xs text-foreground-light" aria-live="polite">
        {matches.length === 0
          ? `No results for “${query}”. Try a shorter word.`
          : `${matches.length} ${matches.length === 1 ? 'result' : 'results'}${query.trim() ? ` for “${query.trim()}”` : ''}`}
      </p>

      <ul className="flex flex-col divide-y">
        {visible.map((result) => (
          <li key={result.title} className="flex items-start gap-3 px-4 py-4">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-surface-75 text-foreground-light [&_svg]:h-4 [&_svg]:w-4"
            >
              {KIND_ICON[result.kind]}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <a href="#search-results" className="focus-ring rounded-xs font-medium text-foreground underline-offset-2 hover:underline">
                  <Highlight text={result.title} query={query} />
                </a>
                <span className="text-xs text-foreground-lighter">{result.kind}</span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-foreground-light">
                <Highlight text={result.excerpt} query={query} />
              </p>
            </div>
          </li>
        ))}
      </ul>

      {pages > 1 && (
        <div className="border-t bg-surface-75 px-4 py-3">
          <Pagination totalPages={pages} page={current} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
