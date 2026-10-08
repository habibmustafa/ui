import { useState } from 'react'

import { CodeBlock, CopyButton, Resizable, StatusCode, TimestampInfo } from '../../src'

interface Request {
  id: string
  method: string
  path: string
  status: number
  ms: number
  at: string
  body: string
}

const requests: Request[] = [
  {
    id: 'r1',
    method: 'POST',
    path: '/v1/invoices',
    status: 201,
    ms: 182,
    at: '2026-09-30T09:41:12Z',
    body: '{\n  "id": "inv_2041",\n  "customer": "cus_88a1",\n  "amount": 12000,\n  "currency": "usd"\n}',
  },
  {
    id: 'r2',
    method: 'GET',
    path: '/v1/customers/cus_88a1',
    status: 200,
    ms: 64,
    at: '2026-09-30T09:40:47Z',
    body: '{\n  "id": "cus_88a1",\n  "name": "Ada Lovelace",\n  "plan": "pro"\n}',
  },
  {
    id: 'r3',
    method: 'POST',
    path: '/v1/payments/retry',
    status: 500,
    ms: 2310,
    at: '2026-09-30T09:38:03Z',
    body: '{\n  "error": "upstream_timeout",\n  "message": "The payment provider did not answer in time."\n}',
  },
  {
    id: 'r4',
    method: 'DELETE',
    path: '/v1/keys/key_7be0',
    status: 404,
    ms: 41,
    at: '2026-09-30T09:35:29Z',
    body: '{\n  "error": "not_found",\n  "message": "No key with that id."\n}',
  },
]

export default function RequestLog() {
  const [selectedId, setSelectedId] = useState('r1')
  const selected = requests.find((request) => request.id === selectedId) ?? requests[0]

  return (
    <div className="w-full max-w-5xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div className="border-b px-6 py-4">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">Request log</h3>
        <p className="text-sm text-foreground-light">The latest calls to your API. Drag the divider to resize.</p>
      </div>

      <Resizable.Root orientation="horizontal" className="h-[24rem]">
        <Resizable.Panel defaultSize="46" minSize="30">
          <ul aria-label="Requests" className="h-full divide-y overflow-auto">
            {requests.map((request) => (
              <li key={request.id}>
                <button
                  type="button"
                  aria-current={request.id === selected.id}
                  onClick={() => setSelectedId(request.id)}
                  className="focus-ring flex w-full cursor-pointer flex-col gap-1.5 px-5 py-3.5 text-left transition-colors hover:bg-surface-200 aria-[current=true]:bg-surface-200"
                >
                  <span className="flex items-center justify-between gap-3">
                    <StatusCode method={request.method} statusCode={request.status} />
                    <span className="text-xs tabular-nums text-foreground-lighter">{request.ms} ms</span>
                  </span>
                  <span className="truncate font-mono text-xs text-foreground">{request.path}</span>
                </button>
              </li>
            ))}
          </ul>
        </Resizable.Panel>
        <Resizable.Handle withHandle />
        <Resizable.Panel defaultSize="54" minSize="30">
          <div className="flex h-full flex-col gap-4 overflow-auto p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="truncate font-mono text-sm font-medium text-foreground">{selected.path}</h4>
                <p className="mt-1 text-xs text-foreground-lighter">
                  <TimestampInfo utcTimestamp={selected.at} />
                </p>
              </div>
              <CopyButton value={selected.body} label="Copy response" copiedLabel="Copied" size="tiny" />
            </div>
            <CodeBlock title="Response body" language="json" className="language-json" hideCopy>
              {selected.body}
            </CodeBlock>
          </div>
        </Resizable.Panel>
      </Resizable.Root>
    </div>
  )
}
