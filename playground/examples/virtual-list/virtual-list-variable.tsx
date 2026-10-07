import { VirtualList } from '../../../src'

const messages = Array.from({ length: 5_000 }, (_, i) => ({
  id: i,
  text: `Message ${i + 1}${i % 3 === 0 ? ': a longer one that needs a taller row.' : ''}`,
}))

export default function VirtualListVariable() {
  return (
    <VirtualList
      items={messages}
      itemHeight={(i) => (i % 3 === 0 ? 64 : 40)}
      height={240}
      aria-label="Messages"
      className="w-full max-w-sm rounded-md border"
      getKey={(m) => m.id}
      renderItem={(m) => <div className="flex h-full items-center border-b px-3 text-sm">{m.text}</div>}
    />
  )
}
