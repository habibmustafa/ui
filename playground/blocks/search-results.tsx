import { Search } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'

import { Badge, Input, Kbd, Pagination, Tabs } from '../../src'

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
    <div className="flex w-full max-w-2xl flex-col gap-5">
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
        size="medium"
      />

      <Tabs
        value={kind}
        onValueChange={(value: string) => {
          setKind(value as Kind | 'All')
          setPage(1)
        }}
        items={TABS.map((tab) => ({ value: tab, label: tab, content: null }))}
      />

      <p className="text-sm text-foreground-light" aria-live="polite">
        {matches.length === 0
          ? `No results for “${query}”. Try a shorter word.`
          : `${matches.length} ${matches.length === 1 ? 'result' : 'results'}${query.trim() ? ` for “${query.trim()}”` : ''}`}
      </p>

      <ul className="flex flex-col divide-y">
        {visible.map((result) => (
          <li key={result.title} className="flex flex-col gap-1 py-4 first:pt-0">
            <div className="flex items-center gap-2">
              <a href="#search-results" className="focus-ring rounded-xs font-medium text-foreground underline-offset-2 hover:underline">
                <Highlight text={result.title} query={query} />
              </a>
              <Badge variant="default" className="normal-case">
                {result.kind}
              </Badge>
            </div>
            <p className="text-sm text-foreground-light">
              <Highlight text={result.excerpt} query={query} />
            </p>
          </li>
        ))}
      </ul>

      {pages > 1 && <Pagination totalPages={pages} page={current} onPageChange={setPage} />}
    </div>
  )
}
