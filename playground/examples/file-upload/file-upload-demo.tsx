import { useState } from 'react'

import { FileUpload } from '../../../src'

export default function FileUploadDemo() {
  const [files, setFiles] = useState<File[]>([])

  return (
    <div className="w-full max-w-md">
      <FileUpload
        value={files}
        onValueChange={setFiles}
        accept="image/*"
        maxSize={2 * 1024 * 1024}
        maxFiles={5}
        description="PNG, JPG or GIF — up to 5 files, 2 MB each"
      />
    </div>
  )
}
