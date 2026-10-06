import { Pagination } from '../../../src'

// With getHref every page is a real link (crawlable, opens in a new tab); arrow-only
// controls via null labels.
export default function PaginationLinksPropsDemo() {
  return (
    <Pagination
      totalPages={8}
      defaultPage={1}
      getHref={(page) => `?page=${page}`}
      onPageChange={() => {}}
      previousLabel={null}
      nextLabel={null}
      size="small"
    />
  )
}
