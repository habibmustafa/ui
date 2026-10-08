import { MoreHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Badge, Button, DropdownMenu, FileUpload, Progress, formatFileSize } from '../../src'

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

  return (
    <div className="flex w-full max-w-xl flex-col gap-5">
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

      {files.length > 0 && (
        <ul className="divide-y rounded-md border" aria-label="Files">
          {files.map((file) => {
            const done = progress[keyOf(file)] ?? 0
            const complete = done >= 100
            return (
              <li key={keyOf(file)} className="flex items-center gap-3 px-4 py-3 text-sm">
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-foreground">{file.name}</span>
                    <span className="shrink-0 text-xs tabular-nums text-foreground-lighter">{formatFileSize(file.size)}</span>
                  </div>
                  <Progress value={done} aria-label={`Uploading ${file.name}`} />
                </div>
                {complete ? (
                  <Badge variant="success" className="normal-case">
                    Uploaded
                  </Badge>
                ) : (
                  <span className="w-12 text-right text-xs tabular-nums text-foreground-light">{done}%</span>
                )}
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
      )}
    </div>
  )
}
