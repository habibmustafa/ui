import { Inbox as InboxIcon, Send, Star } from 'lucide-react'
import { useState } from 'react'

import { Avatar, Button, Mentions, Resizable, VirtualList } from '../../src'

interface Message {
  id: number
  from: string
  subject: string
  preview: string
  when: string
  unread: boolean
}

const SENDERS = ['Grace Hopper', 'Linus Torvalds', 'Ada Lovelace', 'Margaret Hamilton', 'Dennis Ritchie']
const SUBJECTS = [
  ['Release checklist', 'Can you check the last three items before we ship?'],
  ['Invoice question', 'The September total looks higher than the plan we picked.'],
  ['Design review', 'I left comments on the onboarding screens, mostly small.'],
  ['Weekly summary', 'Twelve tasks closed, three opened, one blocked by legal.'],
  ['Access request', 'Could you add me to the billing project for a day?'],
]

/** Deterministic sample mail: the same row is always the same message. */
const messages: Message[] = Array.from({ length: 200 }, (_, index) => {
  const [subject, preview] = SUBJECTS[index % SUBJECTS.length]
  return {
    id: index,
    from: SENDERS[(index * 3) % SENDERS.length],
    subject: index < 5 ? subject : `${subject} (${index})`,
    preview,
    when: index < 3 ? `${index + 1} h ago` : index < 20 ? 'Yesterday' : 'Sep 12',
    unread: index < 4,
  }
})

const PEOPLE = [
  { value: 'ada', label: 'Ada Lovelace', description: 'Engineering' },
  { value: 'grace', label: 'Grace Hopper', description: 'Compilers' },
  { value: 'linus', label: 'Linus Torvalds', description: 'Kernel' },
]

const FOLDERS = [
  { name: 'Inbox', icon: <InboxIcon />, count: 4 },
  { name: 'Starred', icon: <Star />, count: 0 },
  { name: 'Sent', icon: <Send />, count: 0 },
]

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')

export default function Inbox() {
  const [selectedId, setSelectedId] = useState(0)
  const [read, setRead] = useState<Set<number>>(new Set())
  const [reply, setReply] = useState('')
  const [sentTo, setSentTo] = useState<string | null>(null)

  const selected = messages[selectedId]

  return (
    <div className="w-full max-w-5xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <Resizable.Root orientation="horizontal" className="h-[32rem]">
        <Resizable.Panel defaultSize="18" minSize="14">
          <nav aria-label="Folders" className="flex h-full flex-col gap-1 p-3">
            {FOLDERS.map((folder, index) => (
              <a
                key={folder.name}
                href="#inbox"
                aria-current={index === 0 ? 'page' : undefined}
                className="focus-ring flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground-light hover:bg-surface-200 aria-[current=page]:bg-surface-200 aria-[current=page]:text-foreground [&_svg]:h-4 [&_svg]:w-4"
              >
                <span aria-hidden="true">{folder.icon}</span>
                <span className="flex-1">{folder.name}</span>
                {folder.count > 0 && <span className="text-xs tabular-nums">{folder.count}</span>}
              </a>
            ))}
          </nav>
        </Resizable.Panel>
        <Resizable.Handle withHandle />
        <Resizable.Panel defaultSize="38" minSize="25">
          <VirtualList
            items={messages}
            itemHeight={76}
            height={512}
            aria-label="Messages"
            getKey={(message) => message.id}
            renderItem={(message) => {
              const unread = message.unread && !read.has(message.id)
              return (
                <button
                  type="button"
                  aria-current={message.id === selectedId}
                  onClick={() => {
                    setSelectedId(message.id)
                    setRead((current) => new Set(current).add(message.id))
                    setSentTo(null)
                  }}
                  className="focus-ring flex h-full w-full cursor-pointer flex-col justify-center gap-0.5 border-b px-4 text-left transition-colors hover:bg-surface-200 aria-[current=true]:bg-surface-200"
                >
                  <span className="flex items-center justify-between gap-2 text-sm">
                    <span className={unread ? 'font-semibold text-foreground' : 'text-foreground-light'}>
                      {message.from}
                      {unread && <span className="sr-only"> (unread)</span>}
                    </span>
                    <span className="shrink-0 text-xs text-foreground-lighter">{message.when}</span>
                  </span>
                  <span className="truncate text-sm text-foreground">{message.subject}</span>
                  <span className="truncate text-xs text-foreground-lighter">{message.preview}</span>
                </button>
              )
            }}
          />
        </Resizable.Panel>
        <Resizable.Handle withHandle />
        <Resizable.Panel defaultSize="44" minSize="30">
          <div className="flex h-full flex-col gap-4 overflow-auto p-5">
            <div className="flex items-start gap-3">
              <Avatar fallback={initials(selected.from)} className="h-9 w-9 text-xs font-medium" />
              <div className="min-w-0">
                <h4 className="text-base font-semibold text-foreground">{selected.subject}</h4>
                <p className="text-xs text-foreground-lighter">
                  {selected.from}, {selected.when}
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-foreground-light">{selected.preview} Let me know if you need anything from my side before then.</p>

            <div className="mt-auto flex flex-col gap-2 border-t pt-4">
              {sentTo ? (
                <p role="status" className="rounded-md border bg-surface-75 p-3 text-sm text-foreground-light">
                  Reply sent to {sentTo}.
                </p>
              ) : (
                <>
                  <Mentions
                    aria-label={`Reply to ${selected.from}`}
                    placeholder="Write a reply. Type @ to mention someone."
                    rows={3}
                    options={PEOPLE}
                    value={reply}
                    onValueChange={setReply}
                  />
                  <Button
                    variant="primary"
                    className="self-end"
                    disabled={!reply.trim()}
                    onClick={() => {
                      setSentTo(selected.from)
                      setReply('')
                    }}
                  >
                    Send reply
                  </Button>
                </>
              )}
            </div>
          </div>
        </Resizable.Panel>
      </Resizable.Root>
    </div>
  )
}
