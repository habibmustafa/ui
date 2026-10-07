import { useState, type FormEvent } from 'react'

import { Button, FileUpload } from '../../../src'

// Single-file mode inside a form: the underlying <input type="file" name="invoice">
// carries the selection, so a plain form submit (or FormData) picks it up.
export default function FileUploadSingle() {
  const [submitted, setSubmitted] = useState<string | null>(null)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const file = new FormData(event.currentTarget).get('invoice')
    setSubmitted(file instanceof File && file.name ? `${file.name} (${file.size} bytes)` : 'nothing')
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-3">
      <FileUpload
        name="invoice"
        multiple={false}
        accept=".pdf"
        label="Drop your invoice here"
        description="One PDF file"
        browseText="Choose PDF"
      />
      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary">
          Upload
        </Button>
        {submitted && <span className="text-xs text-foreground-lighter">Submitted: {submitted}</span>}
      </div>
    </form>
  )
}
