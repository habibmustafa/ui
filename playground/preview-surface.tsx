import { RotateCcw } from 'lucide-react'
import { Fragment, useState, type ReactNode } from 'react'

import { cn } from '../src'

/** Shared canvas controls. A reset remounts only the example, leaving the page in place. */
export function PreviewSurface({ children, controls, onReset }: { children: ReactNode; controls?: ReactNode; onReset?: () => void }) {
  const [background, setBackground] = useState('grid')
  const [revision, setRevision] = useState(0)

  return (
    <div className="overflow-hidden rounded-xl border bg-studio">
      <div className="flex flex-wrap items-center gap-3 border-b bg-surface-75 px-4 py-2.5">
        {controls}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-foreground-light">
            <span className={controls ? 'hidden sm:inline' : undefined}>Background</span>
            <select aria-label="Preview background" value={background} onChange={(event) => setBackground(event.target.value)} className="focus-ring h-8 rounded-md border bg-background py-1 pl-2 pr-7 text-xs text-foreground">
              <option value="grid">Grid</option>
              <option value="plain">Plain</option>
              <option value="muted">Muted</option>
            </select>
          </label>
          <button type="button" aria-label="Reset preview" title="Reset preview" onClick={() => { setBackground('grid'); setRevision((value) => value + 1); onReset?.() }} className="focus-ring inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-foreground-light hover:bg-surface-200 hover:text-foreground">
            <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div data-preview-background={background} className={cn('relative', background === 'muted' ? 'bg-surface-200' : 'bg-background')}>
        {background === 'grid' && <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(oklch(from_var(--foreground-default)_l_c_h_/_0.08)_1px,transparent_1px)] bg-size-[16px_16px]" />}
        <div className="preview relative flex min-h-64 w-full flex-wrap items-center justify-center gap-3 p-5 sm:p-10">
          <Fragment key={revision}>{children}</Fragment>
        </div>
      </div>
    </div>
  )
}
