'use client'

import { FileIcon, Upload, X } from 'lucide-react'
import * as React from 'react'

import { Button } from '../../actions/button'
import { useControllableState } from '../../../../lib/use-controllable-state'
import { cn } from '../../../../lib/utils'
import {
  formatFileSize,
  validateFiles,
  type FileRejection,
  type FileRejectionReason,
} from './file-upload-utils'

/*
 * Drop zone + file list. The real <input type="file"> stays in the DOM (visually hidden)
 * so forms and `name` keep working; the visible "Browse" button is the keyboard and
 * screen-reader path, and the whole zone also takes clicks and drag-and-drop. Files are
 * validated against accept/maxSize/maxFiles before they are added; rejected ones are
 * reported via onReject and listed under the zone.
 */

export interface FileUploadClassNames {
  dropzone?: string
  list?: string
  item?: string
  error?: string
}

export interface FileUploadProps {
  /** Selected files, controlled. */
  value?: File[]
  /** @default [] */
  defaultValue?: File[]
  onValueChange?: (files: File[]) => void
  /** Called with every rejected file and why (type / size / count). */
  onReject?: (rejections: FileRejection[]) => void
  /** Same syntax as <input accept>: ".pdf,image/*". */
  accept?: string
  /** Bytes. */
  maxSize?: number
  maxFiles?: number
  /** @default true */
  multiple?: boolean
  disabled?: boolean
  /** Submitted with forms via the underlying file input. */
  name?: string
  /** Goes on the Browse button — the accessible control — so `<label for>` names it. */
  id?: string
  /** Heading inside the drop zone. @default "Drag and drop files here" */
  label?: React.ReactNode
  /** Smaller text under the label, e.g. accepted types and limits. */
  description?: React.ReactNode
  /** @default "Browse files" */
  browseText?: React.ReactNode
  /** Render the list of selected files below the zone. @default true */
  showFileList?: boolean
  /** Messages for rejected files. */
  rejectionMessages?: Partial<Record<FileRejectionReason, string>>
  /** Labels the Browse button (its own text is kept after the label). */
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: React.AriaAttributes['aria-invalid']
  /** Called when the Browse button loses focus. */
  onBlur?: React.FocusEventHandler<HTMLButtonElement>
  className?: string
  classNames?: FileUploadClassNames
}

const DEFAULT_REJECTION_MESSAGES: Record<FileRejectionReason, string> = {
  type: 'file type not accepted',
  size: 'file is too large',
  count: 'too many files',
}

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      value,
      defaultValue = [],
      onValueChange,
      onReject,
      accept,
      maxSize,
      maxFiles,
      multiple = true,
      disabled = false,
      name,
      id,
      label = 'Drag and drop files here',
      description,
      browseText = 'Browse files',
      showFileList = true,
      rejectionMessages,
      'aria-labelledby': ariaLabelledby,
      'aria-describedby': ariaDescribedby,
      'aria-invalid': ariaInvalid,
      onBlur,
      className,
      classNames,
    },
    ref
  ) => {
    const [files, setFiles] = useControllableState<File[]>({
      value,
      defaultValue,
      onChange: onValueChange,
    })
    const [rejections, setRejections] = React.useState<FileRejection[]>([])
    const [dragging, setDragging] = React.useState(false)
    const dragDepth = React.useRef(0)
    const inputRef = React.useRef<HTMLInputElement>(null)
    const browseRef = React.useRef<HTMLButtonElement>(null)
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    // Mirror the selection (picked, dropped or removed) into the native input, so a form
    // submit with `name` sends exactly the listed files. DataTransfer is the only way to
    // build a FileList; environments without it (jsdom) just skip the sync.
    const syncInput = React.useCallback((list: readonly File[]) => {
      const input = inputRef.current
      if (!input || typeof DataTransfer === 'undefined') return
      const transfer = new DataTransfer()
      for (const file of list) transfer.items.add(file)
      input.files = transfer.files
    }, [])
    React.useEffect(() => syncInput(files), [files, syncInput])

    const autoId = React.useId()
    const browseId = id ?? autoId
    const descriptionId = `${browseId}-description`
    const invalid = ariaInvalid === true || ariaInvalid === 'true'
    const messages = { ...DEFAULT_REJECTION_MESSAGES, ...rejectionMessages }
    const limit = multiple ? maxFiles : 1

    const addFiles = (incoming: readonly File[]) => {
      if (disabled || incoming.length === 0) return
      // Single-file mode replaces the current file instead of being blocked by it.
      const base = multiple ? files : []
      const { accepted, rejected } = validateFiles(incoming, {
        accept,
        maxSize,
        maxFiles: limit,
        current: base.length,
      })
      setRejections(rejected)
      if (rejected.length > 0) onReject?.(rejected)
      if (accepted.length > 0) setFiles([...base, ...accepted])
    }

    const removeFile = (index: number) => {
      setFiles(files.filter((_, i) => i !== index))
      setRejections([])
      browseRef.current?.focus()
    }

    const dragHandlers = {
      onDragEnter: (event: React.DragEvent) => {
        event.preventDefault()
        if (disabled) return
        dragDepth.current += 1
        setDragging(true)
      },
      onDragOver: (event: React.DragEvent) => {
        event.preventDefault()
        if (!disabled) event.dataTransfer.dropEffect = 'copy'
      },
      onDragLeave: (event: React.DragEvent) => {
        event.preventDefault()
        dragDepth.current = Math.max(0, dragDepth.current - 1)
        if (dragDepth.current === 0) setDragging(false)
      },
      onDrop: (event: React.DragEvent) => {
        event.preventDefault()
        dragDepth.current = 0
        setDragging(false)
        addFiles(Array.from(event.dataTransfer.files))
      },
    }

    const describedBy = [description != null ? descriptionId : null, ariaDescribedby]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={cn('flex w-full flex-col gap-3', className)}>
        <div
          {...dragHandlers}
          data-dragging={dragging ? '' : undefined}
          data-disabled={disabled ? '' : undefined}
          data-invalid={invalid ? '' : undefined}
          onClick={(event) => {
            if (disabled || (event.target as HTMLElement).closest('button, input')) return
            inputRef.current?.click()
          }}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-strong bg-surface-100 px-6 py-8 text-center transition-colors',
            'hover:border-foreground-muted data-dragging:border-brand-default data-dragging:bg-brand-200/40',
            'data-invalid:border-destructive-400 data-invalid:bg-destructive-200',
            'data-disabled:cursor-not-allowed data-disabled:opacity-50',
            classNames?.dropzone
          )}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-default bg-surface-200 text-foreground-lighter">
            <Upload aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
          </span>
          <p className="text-sm text-foreground">{label}</p>
          {description != null && (
            <p id={descriptionId} className="text-xs text-foreground-lighter">
              {description}
            </p>
          )}
          <Button
            ref={browseRef}
            id={browseId}
            variant="default"
            size="tiny"
            disabled={disabled}
            // Point at the text, not the button itself: the button's own name would come
            // from the `<label for>` that already names it, repeating the label.
            aria-labelledby={ariaLabelledby ? `${ariaLabelledby} ${browseId}-text` : undefined}
            aria-describedby={describedBy || undefined}
            aria-invalid={ariaInvalid}
            onBlur={onBlur}
            onClick={() => inputRef.current?.click()}
            className="mt-1"
          >
            <span id={`${browseId}-text`}>{browseText}</span>
          </Button>
          <input
            ref={inputRef}
            type="file"
            name={name}
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            // The Browse button is the accessible control; the input only carries the
            // files (and `name`) for forms, so keep it out of the a11y tree and tab order.
            aria-hidden="true"
            tabIndex={-1}
            className="sr-only"
            // Focusing the input (the forwarded ref, e.g. a form library focusing the
            // field on an error) focuses the Browse button instead.
            onFocus={() => browseRef.current?.focus()}
            onChange={(event) => {
              const picked = Array.from(event.target.files ?? [])
              // The picker replaced the input's FileList with just this pick; put the
              // current selection back (the effect re-syncs again if files get added).
              syncInput(files)
              addFiles(picked)
            }}
          />
        </div>

        <div aria-live="polite">
          {rejections.length > 0 && (
            <ul className={cn('flex flex-col gap-1 text-xs text-destructive', classNames?.error)}>
              {rejections.map((rejection, index) => (
                <li key={`${rejection.file.name}-${index}`}>
                  {rejection.file.name}: {rejection.reasons.map((r) => messages[r]).join(', ')}
                </li>
              ))}
            </ul>
          )}
        </div>

        {showFileList && files.length > 0 && (
          <ul aria-label="Selected files" className={cn('flex flex-col gap-1.5', classNames?.list)}>
            {files.map((file, index) => (
              <li
                key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                className={cn(
                  'flex items-center gap-3 rounded-md border border-default bg-surface-100 px-3 py-2',
                  classNames?.item
                )}
              >
                <FileIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-foreground-lighter" strokeWidth={1.5} />
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{file.name}</span>
                <span className="shrink-0 text-xs tabular-nums text-foreground-lighter">
                  {formatFileSize(file.size)}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  disabled={disabled}
                  onClick={() => removeFile(index)}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-foreground-lighter transition-colors hover:bg-surface-300 hover:text-foreground focus-ring disabled:pointer-events-none"
                >
                  <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }
)
FileUpload.displayName = 'FileUpload'

export { FileUpload }
