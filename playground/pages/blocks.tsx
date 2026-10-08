import { Suspense, lazy, useEffect, useState, type ComponentType, type LazyExoticComponent } from 'react'

import { Skeleton, Tabs, cn } from '../../src'
import { BLOCKS, BLOCK_CATEGORIES, type BlockCategory, type BlockMeta } from '../blocks/registry'
import { CodeSnippet } from '../code-snippet'
import { useNearViewport } from '../component-preview'
import { findComponent } from '../registry'
import { Link } from '../router'
import { DISPLAY } from './home-hero'

/*
 * /blocks: every block as a live screen and as the code that makes it. Blocks mount only
 * when they are near the screen, like the previews on a component page, and take the
 * current theme, so a colour picked on the landing page or in the theme builder shows up
 * here too.
 */

const loaders = import.meta.glob<{ default: ComponentType }>('../blocks/*.tsx')
const sources = import.meta.glob<string>('../blocks/*.tsx', { query: '?raw', import: 'default' })

const lazyBlocks = new Map<string, LazyExoticComponent<ComponentType>>()
function getBlock(id: string) {
  let Block = lazyBlocks.get(id)
  if (!Block) {
    Block = lazy(loaders[`../blocks/${id}.tsx`] as () => Promise<{ default: ComponentType }>)
    lazyBlocks.set(id, Block)
  }
  return Block
}

// The blocks import from the library source; show the package name instead so the code
// reads the way a consumer would write it.
const presentSource = (source: string) =>
  source.replace(/(['"])(?:\.\.\/)+src\1/g, "'@habibmustafa/ui'").trim()

function BlockCode({ id }: { id: string }) {
  const [source, setSource] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    sources[`../blocks/${id}.tsx`]?.().then((raw) => {
      if (active) setSource(presentSource(raw))
    })
    return () => {
      active = false
    }
  }, [id])

  return <CodeSnippet code={source ?? ''} maxHeight={560} />
}

function Stage({ Block, near }: { Block: ComponentType; near: boolean }) {
  return (
    <div className="relative flex min-h-80 w-full items-center justify-center overflow-hidden rounded-lg border bg-studio p-4 sm:p-10">
      {/* A faint dot grid so each screen reads as a surface lifted off a canvas. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(oklch(from_var(--foreground-default)_l_c_h_/_0.09)_1px,transparent_1px)] bg-size-[18px_18px] mask-[radial-gradient(ellipse_90%_90%_at_50%_50%,#000_45%,transparent_100%)]"
      />
      {near ? (
        <Suspense fallback={<Skeleton className="h-64 w-full max-w-md" />}>
          {/* min-w-0: a flex item never shrinks below its content (a table) otherwise. */}
          <div className="relative flex min-w-0 flex-1 justify-center">
            <Block />
          </div>
        </Suspense>
      ) : null}
    </div>
  )
}

function BlockSection({ block }: { block: BlockMeta }) {
  const [ref, near] = useNearViewport()
  const Block = getBlock(block.id)

  return (
    <section id={block.id} aria-labelledby={`${block.id}-title`} className="scroll-mt-20 py-10" ref={ref}>
      <div className="mb-5 flex flex-col gap-2">
        <h2 id={`${block.id}-title`} className={cn('text-2xl font-semibold text-foreground', DISPLAY)}>
          {block.title}
        </h2>
        <p className="max-w-2xl text-foreground-light">{block.description}</p>
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-foreground-lighter">
          <span>Built with</span>
          {block.uses.map((id, index) => (
            <span key={id} className="inline-flex items-center gap-1.5">
              <Link
                to={`/components/${id}`}
                className="focus-ring rounded-xs text-foreground-light underline decoration-border-stronger underline-offset-2 transition-colors hover:text-foreground"
              >
                {findComponent(id)?.title ?? id}
              </Link>
              {index < block.uses.length - 1 && <span aria-hidden="true">,</span>}
            </span>
          ))}
        </p>
      </div>
      <Tabs
        classNames={{ list: 'w-fit gap-6', trigger: 'flex-none px-0' }}
        items={[
          { value: 'preview', label: 'Preview', content: <Stage Block={Block} near={near} /> },
          { value: 'code', label: 'Code', content: <BlockCode id={block.id} /> },
        ]}
      />
    </section>
  )
}

export default function BlocksPage() {
  const [category, setCategory] = useState<BlockCategory | 'All'>('All')
  const shown = category === 'All' ? BLOCKS : BLOCKS.filter((block) => block.category === category)
  const countOf = (name: BlockCategory | 'All') =>
    name === 'All' ? BLOCKS.length : BLOCKS.filter((block) => block.category === name).length

  return (
    <div>
      <h1 className={cn('max-w-2xl text-balance text-4xl font-bold leading-[1.05] text-foreground sm:text-5xl', DISPLAY)}>
        Whole screens, ready to copy
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-foreground-light">
        {BLOCKS.length} screens built only from the library. Each one is real code that follows your theme, in light
        and dark.
      </p>

      <div role="group" aria-label="Filter by kind" className="mt-6 flex flex-wrap gap-1.5">
        {(['All', ...BLOCK_CATEGORIES] as const).map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={category === name}
            onClick={() => setCategory(name)}
            className={cn(
              'focus-ring inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors',
              category === name
                ? 'border-foreground bg-foreground text-background'
                : 'border-default text-foreground-light hover:border-foreground-muted hover:text-foreground'
            )}
          >
            {name}
            <span className="text-xs tabular-nums opacity-70">{countOf(name)}</span>
          </button>
        ))}
      </div>

      <nav aria-label="Blocks" className="mt-4 flex flex-wrap gap-1.5">
        {shown.map((block) => (
          <a
            key={block.id}
            href={`#${block.id}`}
            className="focus-ring inline-flex h-7 items-center rounded-full border border-default px-3 text-xs text-foreground-light transition-colors hover:border-foreground-muted hover:text-foreground"
          >
            {block.title}
          </a>
        ))}
      </nav>
      <div className="mt-4 divide-y">
        {shown.map((block) => (
          <BlockSection key={block.id} block={block} />
        ))}
      </div>
    </div>
  )
}
