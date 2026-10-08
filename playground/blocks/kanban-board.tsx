import { MoveRight, Plus } from 'lucide-react'
import { useState } from 'react'

import { Avatar, Badge, Button, DropdownMenu, Input } from '../../src'

type ColumnId = 'todo' | 'doing' | 'done'

interface Card {
  id: number
  title: string
  owner: string
  priority: 'High' | 'Normal'
  column: ColumnId
}

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: 'todo', title: 'To do' },
  { id: 'doing', title: 'In progress' },
  { id: 'done', title: 'Done' },
]

const initial: Card[] = [
  { id: 1, title: 'Write the release notes', owner: 'GH', priority: 'Normal', column: 'todo' },
  { id: 2, title: 'Fix the invoice rounding bug', owner: 'AL', priority: 'High', column: 'todo' },
  { id: 3, title: 'Review the new onboarding', owner: 'LT', priority: 'Normal', column: 'doing' },
  { id: 4, title: 'Migrate the billing tables', owner: 'GH', priority: 'High', column: 'doing' },
  { id: 5, title: 'Update the status page', owner: 'AL', priority: 'Normal', column: 'done' },
]

export default function KanbanBoard() {
  const [cards, setCards] = useState(initial)
  const [draft, setDraft] = useState('')

  const move = (id: number, column: ColumnId) =>
    setCards((current) => current.map((card) => (card.id === id ? { ...card, column } : card)))

  const add = () => {
    const title = draft.trim()
    if (!title) return
    setCards((current) => [...current, { id: Date.now(), title, owner: 'AL', priority: 'Normal', column: 'todo' }])
    setDraft('')
  }

  return (
    <div className="w-full max-w-5xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div className="border-b px-6 py-4">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">Release 2.5</h3>
        <p className="text-sm text-foreground-light">Move a card with its menu to change where it stands.</p>
      </div>

      <div className="grid gap-4 bg-surface-75 p-4 md:grid-cols-3">
        {COLUMNS.map((column) => {
          const inColumn = cards.filter((card) => card.column === column.id)
          return (
            <section key={column.id} aria-labelledby={`kanban-${column.id}`} className="flex flex-col gap-3 rounded-lg border bg-surface-100 p-3">
              <h4 id={`kanban-${column.id}`} className="flex items-center justify-between px-1 text-sm font-medium text-foreground">
                {column.title}
                <span className="text-xs tabular-nums text-foreground-lighter" aria-label={`${inColumn.length} cards`}>
                  {inColumn.length}
                </span>
              </h4>

              <ul className="flex min-h-24 flex-col gap-2">
                {inColumn.map((card) => (
                  <li key={card.id} className="flex flex-col gap-3 rounded-md border bg-background p-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-foreground">{card.title}</p>
                      <DropdownMenu
                        align="end"
                        trigger={<Button size="tiny" variant="text" icon={<MoveRight />} aria-label={`Move ${card.title}`} />}
                        items={[
                          { key: 'label', type: 'label', label: 'Move to' },
                          ...COLUMNS.filter((target) => target.id !== card.column).map((target) => ({
                            key: target.id,
                            label: target.title,
                            onSelect: () => move(card.id, target.id),
                          })),
                        ]}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Avatar fallback={card.owner} className="h-6 w-6 text-[10px] font-medium" />
                      {card.priority === 'High' && (
                        <Badge variant="warning" className="px-2 py-1 text-[11px] font-medium normal-case tracking-normal">
                          High priority
                        </Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {column.id === 'todo' && (
                <form
                  className="flex gap-2"
                  onSubmit={(event) => {
                    event.preventDefault()
                    add()
                  }}
                >
                  <Input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Add a card" aria-label="New card title" />
                  <Button type="submit" icon={<Plus />} aria-label="Add card" disabled={!draft.trim()} />
                </form>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
