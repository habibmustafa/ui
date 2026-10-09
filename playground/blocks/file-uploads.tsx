import { CircleCheck, FileImage, FileText, MoreHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button, DropdownMenu, FileUpload, Progress, formatFileSize } from '../../src'

const keyOf = (file: File) => `${file.name}:${file.size}:${file.lastModified}`

export default function FileUploads() {
  const [files, setFiles] = useState<File[]>([])
  const [progress, setProgress] = useState<Record<string, number>>({})

  // There is no server here: each file "uploads" at its own pace so the states are real.
  useEffect(() => {
    if (files.every((file) => (progress[keyOf(file)] ?? 0) >= 100)) return
    const id = setInterval(() => {
      setProgress((current) => {
        const next = { ...current }
        for (const file of files) {
          const key = keyOf(file)
          const done = next[key] ?? 0
          if (done < 100) next[key] = Math.min(100, done + 8 + (file.size % 11))
        }
        return next
      })
    }, 350)
    return () => clearInterval(id)
  }, [files, progress])

  const remove = (file: File) => setFiles((current) => current.filter((item) => item !== file))
  const uploaded = files.filter((file) => (progress[keyOf(file)] ?? 0) >= 100).length

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
      <div className="p-6">
        <FileUpload
          label="Attachments"
          description="PNG, JPG or PDF, up to 5 MB each."
          accept="image/png,image/jpeg,application/pdf"
          maxSize={5 * 1024 * 1024}
          multiple
          showFileList={false}
          value={files}
          onValueChange={setFiles}
        />
      </div>

      {files.length > 0 && (
        <>
          <ul className="divide-y border-t" aria-label="Files">
            {files.map((file) => {
              const done = progress[keyOf(file)] ?? 0
              const complete = done >= 100
              const Icon = file.type.startsWith('image/') ? FileImage : FileText
              return (
                <li key={keyOf(file)} className="flex items-center gap-3 px-6 py-4 text-sm">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-surface-75 text-foreground-light"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate font-medium text-foreground">{file.name}</span>
                      {complete ? (
                        <span className="inline-flex shrink-0 items-center gap-1 text-xs text-brand-600">
                          <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          Uploaded
                        </span>
                      ) : (
                        <span className="shrink-0 text-xs tabular-nums text-foreground-light">{done}%</span>
                      )}
                    </div>
                    {complete ? (
                      <span className="text-xs tabular-nums text-foreground-lighter">{formatFileSize(file.size)}</span>
                    ) : (
                      <Progress value={done} aria-label={`Uploading ${file.name}`} />
                    )}
                  </div>
                  <DropdownMenu
                    align="end"
                    trigger={
                      <Button size="tiny" variant="text" icon={<MoreHorizontal />} aria-label={`Actions for ${file.name}`} />
                    }
                    items={[{ key: 'remove', label: complete ? 'Remove' : 'Cancel upload', onSelect: () => remove(file) }]}
                  />
                </li>
              )
            })}
          </ul>
          <p className="border-t bg-surface-75 px-6 py-3 text-xs tabular-nums text-foreground-light" aria-live="polite">
            {uploaded} of {files.length} uploaded
          </p>
        </>
      )}
    </div>
  )
}
