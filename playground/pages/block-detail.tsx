import { ArrowLeft, ArrowRight, ArrowUpRight, Monitor, Smartphone } from 'lucide-react'
import { useState } from 'react'

import { Tabs, cn } from '../../src'
import { BlockCode, BlockFrame } from '../block-preview'
import { BLOCKS } from '../blocks/registry'
import { PAGE_TITLE } from '../design'
import { findComponent } from '../registry'
import { Link } from '../router'

const DEVICES = [
  { width: 1024, label: 'Desktop', Icon: Monitor },
  { width: 390, label: 'Mobile', Icon: Smartphone },
]

/** /blocks/<id>: one screen with its live preview, its code and the blocks around it. */
export default function BlockDetailPage({ id }: { id: string }) {
  const [width, setWidth] = useState(1024)
  const index = BLOCKS.findIndex((block) => block.id === id)
  const block = BLOCKS[index]

  if (!block) {
    return (
      <div className="py-16 text-center">
        <h1 className={PAGE_TITLE}>Block not found</h1>
        <p className="mt-3 text-foreground-light">There is no screen called “{id}”.</p>
        <Link to="/blocks" className="focus-ring mt-6 inline-flex rounded-md text-sm text-brand-600 underline underline-offset-4">
          Browse all blocks
        </Link>
      </div>
    )
  }

  const previous = BLOCKS[(index - 1 + BLOCKS.length) % BLOCKS.length]
  const next = BLOCKS[(index + 1) % BLOCKS.length]

  return (
    <div>
      <Link to="/blocks" className="focus-ring inline-flex items-center gap-1.5 rounded-md text-sm text-foreground-light transition-colors hover:text-foreground">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        All blocks
      </Link>

      <header className="mt-5">
        <p className="mb-2 text-xs font-medium text-foreground-lighter">{block.category}</p>
        <h1 className={PAGE_TITLE}>{block.title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-foreground-light">{block.description}</p>
      </header>

      <Tabs.Root defaultValue="preview" className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Tabs.List className="gap-5" aria-label="Block view">
            <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
            <Tabs.Trigger value="code">Code</Tabs.Trigger>
            <Tabs.Indicator />
          </Tabs.List>
          <div className="flex items-center gap-2">
            <div role="group" aria-label="Preview width" className="flex items-center gap-1 rounded-lg border bg-surface-75 p-1">
              {DEVICES.map((device) => (
                <button
                  key={device.width}
                  type="button"
                  aria-pressed={width === device.width}
                  onClick={() => setWidth(device.width)}
                  className={cn(
                    'focus-ring inline-flex h-8 cursor-pointer items-center gap-2 rounded-md px-3 text-xs transition-colors',
                    width === device.width ? 'bg-background text-foreground shadow-sm' : 'text-foreground-lighter hover:text-foreground'
                  )}
                >
                  <device.Icon aria-hidden="true" className="h-3.5 w-3.5" />
                  {device.label}
                </button>
              ))}
            </div>
            <a
              href={`/blocks?preview=${block.id}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Open preview in a new tab"
              title="Open preview in a new tab"
              className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border text-foreground-light transition-colors hover:bg-surface-100 hover:text-foreground"
            >
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
        </div>
        <Tabs.Content value="preview">
          {/* Keyed so switching blocks starts a fresh browsing context. */}
          <BlockFrame key={block.id} block={block} width={width} />
          <p className="mt-3 text-center text-xs tabular-nums text-foreground-lighter">{width} px · Live, interactive preview</p>
        </Tabs.Content>
        <Tabs.Content value="code">
          <BlockCode id={block.id} />
        </Tabs.Content>
      </Tabs.Root>

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t pt-5 text-xs">
        <span className="mr-1 text-foreground-lighter">Built with</span>
        {block.uses.map((use) => (
          <Link
            key={use}
            to={'/components/' + use}
            className="focus-ring rounded-md border bg-surface-75 px-2 py-1 text-foreground-light transition-colors hover:border-brand-500 hover:text-foreground"
          >
            {findComponent(use)?.title ?? use}
          </Link>
        ))}
      </div>

      <nav aria-label="More blocks" className="mt-10 grid gap-3 sm:grid-cols-2">
        <Link to={'/blocks/' + previous.id} className="focus-ring group flex flex-col gap-1 rounded-xl border p-4 transition-colors hover:border-brand-500">
          <span className="inline-flex items-center gap-1.5 text-xs text-foreground-lighter">
            <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
            Previous
          </span>
          <span className="font-medium text-foreground">{previous.title}</span>
        </Link>
        <Link to={'/blocks/' + next.id} className="focus-ring group flex flex-col items-end gap-1 rounded-xl border p-4 text-right transition-colors hover:border-brand-500">
          <span className="inline-flex items-center gap-1.5 text-xs text-foreground-lighter">
            Next
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </span>
          <span className="font-medium text-foreground">{next.title}</span>
        </Link>
      </nav>
    </div>
  )
}
