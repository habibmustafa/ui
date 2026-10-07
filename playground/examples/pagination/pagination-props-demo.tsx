import { useState } from 'react'

import { Pagination } from '../../../src'

export default function PaginationPropsDemo() {
  const [page, setPage] = useState(6)

  return (
    <div className="flex flex-col items-center gap-3">
      <Pagination totalPages={20} page={page} onPageChange={setPage} />
      <p className="text-xs text-foreground-lighter">Page {page} of 20</p>
    </div>
  )
}
