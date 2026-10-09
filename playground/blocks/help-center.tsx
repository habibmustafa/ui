import { LifeBuoy, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Accordion, Button, Input, Select, Textarea } from '../../src'

const FAQ = [
  { value: 'reset', question: 'How do I reset my password?', answer: 'Open the sign-in page, choose “Forgot password” and enter your email. The link works for 30 minutes.' },
  { value: 'seats', question: 'How do I add more seats?', answer: 'Go to Billing and plan, then change the number of seats. You pay only for the days that are left in the month.' },
  { value: 'invoice', question: 'Where can I download an invoice?', answer: 'Every paid invoice is listed under Billing and plan. Choose PDF next to the one you need.' },
  { value: 'cancel', question: 'Can I cancel at any time?', answer: 'Yes. Your plan stays active until the end of the period you paid for, and you keep your data for 30 days.' },
  { value: 'export', question: 'How do I export my data?', answer: 'Open Settings, choose Export, and we email you a link to a zip file within a few minutes.' },
]

const TOPICS = [
  { value: 'billing', label: 'Billing' },
  { value: 'account', label: 'My account' },
  { value: 'bug', label: 'Something is broken' },
]

export default function HelpCenter() {
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState('billing')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return FAQ.filter((item) => !needle || `${item.question} ${item.answer}`.toLowerCase().includes(needle))
  }, [query])

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div className="flex flex-col items-center gap-4 border-b bg-surface-75 px-6 py-10 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border bg-surface-100 text-foreground-light">
          <LifeBuoy className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-foreground">How can we help?</h3>
          <p className="mt-1 text-sm text-foreground-light">Search the answers below, or write to us.</p>
        </div>
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          prefix={<Search className="h-4 w-4 text-foreground-muted" aria-hidden="true" />}
          placeholder="Search for an answer"
          aria-label="Search the help center"
          size="large"
          className="max-w-md"
        />
      </div>

      <div className="px-6 py-4" aria-live="polite">
        {matches.length === 0 ? (
          <p className="py-8 text-center text-sm text-foreground-light">
            No answers for “{query.trim()}”. Try a shorter word, or write to us below.
          </p>
        ) : (
          <Accordion
            type="single"
            collapsible
            items={matches.map((item) => ({ value: item.value, trigger: item.question, content: item.answer }))}
          />
        )}
      </div>

      <section aria-labelledby="help-contact" className="border-t px-6 py-6">
        <h4 id="help-contact" className="text-sm font-medium text-foreground">
          Still stuck?
        </h4>
        {sent ? (
          <p role="status" className="mt-3 rounded-lg border bg-surface-75 p-4 text-sm text-foreground-light">
            Thanks. We got your message and will reply by email within one working day.
          </p>
        ) : (
          <form
            className="mt-4 flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              if (message.trim()) setSent(true)
            }}
          >
            <Select options={TOPICS} value={topic} onValueChange={setTopic} aria-label="Topic" />
            <Textarea value={message} onChange={(event) => setMessage(event.target.value)} aria-label="Your message" placeholder="Tell us what happened" rows={4} />
            <Button type="submit" variant="primary" size="medium" disabled={!message.trim()} className="self-end">
              Send message
            </Button>
          </form>
        )}
      </section>
    </div>
  )
}
