import { useState } from 'react'

import { TableOfContents } from '../../../src'

const sections = [
  { id: 'toc-intro', label: 'Introduction', level: 1 },
  { id: 'toc-install', label: 'Installation', level: 1 },
  { id: 'toc-usage', label: 'Usage', level: 1 },
  { id: 'toc-props', label: 'Props', level: 2 },
  { id: 'toc-faq', label: 'FAQ', level: 1 },
] as const

export default function TableOfContentsDemo() {
  const [root, setRoot] = useState<HTMLDivElement | null>(null)
  return (
    <div className="flex w-full max-w-2xl gap-8">
      <div
        ref={setRoot}
        tabIndex={0}
        aria-label="Document"
        className="relative h-64 flex-1 overflow-y-auto rounded-md border p-4 focus-ring"
      >
        {sections.map((s) => (
          <section key={s.id} className="mb-6">
            <h3 id={s.id} className="mb-1 font-medium text-foreground">
              {s.label}
            </h3>
            <p className="h-32 text-sm text-foreground-light">Content for {s.label}.</p>
          </section>
        ))}
      </div>
      <TableOfContents items={sections} scrollRoot={root} className="w-40 shrink-0" title="On this page" />
    </div>
  )
}
