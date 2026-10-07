import { ScrollArea, Separator } from '../../../src'

const tags = Array.from({ length: 40 }, (_, i) => `v1.${40 - i}.0`)

export default function ScrollAreaDemo() {
  return (
    <ScrollArea aria-label="Releases" className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <p className="mb-3 text-sm font-medium text-foreground">Releases</p>
        {tags.map((tag) => (
          <div key={tag}>
            <div className="py-1 font-mono text-xs text-foreground-light">{tag}</div>
            <Separator />
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
