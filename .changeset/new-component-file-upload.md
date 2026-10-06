---
"@habibmustafa/ui": minor
---

New `FileUpload` component: drop zone with a Browse button, `accept` / `maxSize` /
`maxFiles` validation (rejections reported via `onReject` and listed under the zone),
a removable file list, single- or multi-file mode, and a real `<input type="file">`
kept in sync with the selection so `name` works in plain form submits. The helpers
`formatFileSize`, `fileMatchesAccept` and `validateFiles` are exported too.
