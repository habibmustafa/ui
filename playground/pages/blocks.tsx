import { Suspense, lazy, useEffect, useState, type ComponentType, type LazyExoticComponent } from 'react'

import { Skeleton, Tabs, cn } from '../../src'
import { BLOCKS, type BlockMeta } from '../blocks/registry'
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
    <div className="flex min-h-80 w-full justify-center rounded-lg border bg-studio p-5 sm:p-10">
      {near ? (
        <Suspense fallback={<Skeleton className="h-64 w-full max-w-md" />}>
          {/* min-w-0: a flex item never shrinks below its content (a table) otherwise. */}
          <div className="flex min-w-0 flex-1 justify-center">
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
  return (
    <div>
      <h1 className={cn('max-w-2xl text-balance text-4xl font-bold leading-[1.05] text-foreground sm:text-5xl', DISPLAY)}>
        Whole screens, ready to copy
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-foreground-light">
        {BLOCKS.length} screens built only from the library. Each one is real code that follows your theme, in light
        and dark.
      </p>
      <nav aria-label="Blocks" className="mt-6 flex flex-wrap gap-1.5">
        {BLOCKS.map((block) => (
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
        {BLOCKS.map((block) => (
          <BlockSection key={block.id} block={block} />
        ))}
      </div>
    </div>
  )
}
