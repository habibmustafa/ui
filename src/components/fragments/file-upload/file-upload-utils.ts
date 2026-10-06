export type FileRejectionReason = 'type' | 'size' | 'count'

export interface FileRejection {
  file: File
  reasons: FileRejectionReason[]
}

/** 1536 -> "1.5 KB". Binary units, one decimal under 10. */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return ''
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  const rounded = unit === 0 || value >= 10 ? Math.round(value) : Math.round(value * 10) / 10
  return `${rounded} ${units[unit]}`
}

/**
 * Whether `file` matches an `accept` string the way <input type="file" accept> reads it:
 * comma-separated extensions (".pdf"), exact MIME types ("image/png") and wildcards
 * ("image/*"). An empty/undefined accept takes everything.
 */
export function fileMatchesAccept(file: File, accept?: string): boolean {
  if (!accept || accept.trim() === '') return true
  const name = file.name.toLowerCase()
  const type = (file.type || '').toLowerCase()
  return accept
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith('.')) return name.endsWith(rule)
      if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1))
      return type === rule
    })
}

/**
 * Splits incoming files into accepted and rejected ones. `current` is how many files are
 * already selected, for the `maxFiles` count check (files beyond the limit are rejected
 * in arrival order).
 */
export function validateFiles(
  files: readonly File[],
  { accept, maxSize, maxFiles, current = 0 }: { accept?: string; maxSize?: number; maxFiles?: number; current?: number }
): { accepted: File[]; rejected: FileRejection[] } {
  const accepted: File[] = []
  const rejected: FileRejection[] = []
  for (const file of files) {
    const reasons: FileRejectionReason[] = []
    if (!fileMatchesAccept(file, accept)) reasons.push('type')
    if (maxSize !== undefined && file.size > maxSize) reasons.push('size')
    if (reasons.length === 0 && maxFiles !== undefined && current + accepted.length >= maxFiles) {
      reasons.push('count')
    }
    if (reasons.length > 0) rejected.push({ file, reasons })
    else accepted.push(file)
  }
  return { accepted, rejected }
}
