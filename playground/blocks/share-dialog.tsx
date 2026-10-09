import { Share2 } from 'lucide-react'
import { useState } from 'react'

import { Button, CopyButton, Dialog, Input, Label, QRCode, Select } from '../../src'

const LINK = 'https://app.example.com/s/q3-roadmap-7f2a'

const ACCESS = [
  { value: 'invited', label: 'Only people I invite' },
  { value: 'company', label: 'Anyone at Acme Inc.' },
  { value: 'link', label: 'Anyone with the link' },
]

export default function ShareDialog() {
  const [access, setAccess] = useState('company')
  const [shared, setShared] = useState<string | null>(null)

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-xl border bg-surface-100 px-6 py-10 shadow-sm">
      <div className="text-center">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">Q3 roadmap</h3>
        <p className="mt-0.5 text-sm text-foreground-light" aria-live="polite">
          {shared ? `Shared with: ${shared}.` : 'Not shared yet.'}
        </p>
      </div>

      <Dialog
        trigger={
          <Button variant="primary" icon={<Share2 />}>
            Share
          </Button>
        }
        title="Share “Q3 roadmap”"
        description="Choose who can open this document."
        confirmText="Done"
        cancelText="Cancel"
        onConfirm={() => setShared(ACCESS.find((item) => item.value === access)?.label ?? null)}
      >
        <div className="flex flex-col gap-5 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="share-link">Link</Label>
            <div className="flex items-center gap-2">
              <Input id="share-link" readOnly value={LINK} className="font-mono" />
              <CopyButton value={LINK} aria-label="Copy link" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="share-access">Who can open it</Label>
            <Select id="share-access" options={ACCESS} value={access} onValueChange={setAccess} />
          </div>
          <div className="flex items-center gap-4 rounded-lg border bg-surface-75 p-4">
            <QRCode value={LINK} size={88} label="QR code for the share link" />
            <p className="text-sm text-foreground-light">Scan with a phone to open the document on the go.</p>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
