import { CopyButton, Input } from '../../../src'

export default function CopyButtonDemo() {
  const url = 'https://xyzcompany.supabase.co'

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex items-center gap-2">
        <Input readOnly value={url} aria-label="Project URL" className="font-mono" />
        <CopyButton value={url} aria-label="Copy project URL" />
      </div>
      <div className="flex items-center gap-2">
        <CopyButton value="npm i @habibmustafa/ui" label="Copy install command" />
        <CopyButton
          variant="primary"
          label="Copy token"
          copiedLabel="Token copied"
          value={async () => 'generated-token-' + Date.now()}
        />
      </div>
    </div>
  )
}
