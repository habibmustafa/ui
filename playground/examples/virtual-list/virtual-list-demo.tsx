import { VirtualList } from '../../../src'

const rows = Array.from({ length: 100_000 }, (_, i) => ({ id: i, name: `Row ${i + 1}` }))

export default function VirtualListDemo() {
  return (
    <VirtualList
      items={rows}
      itemHeight={40}
      height={280}
      aria-label="100,000 rows"
      className="w-full max-w-sm rounded-md border"
      getKey={(row) => row.id}
      renderItem={(row) => (
        <div className="flex h-full items-center justify-between border-b px-3 text-sm">
          <span>{row.name}</span>
          <span className="text-foreground-lighter tabular-nums">#{row.id}</span>
        </div>
      )}
    />
  )
}
