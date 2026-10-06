import { Pagination } from '../../../src'

export default function PaginationLinks() {
  const pages = [1, 2, 3, 4, 5]

  return (
    <Pagination.Root>
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous size="small" label={null} disabled />
        </Pagination.Item>
        {pages.map((page) => (
          <Pagination.Item key={page}>
            <Pagination.Link size="small" href={`?page=${page}`} isActive={page === 1}>
              {page}
            </Pagination.Link>
          </Pagination.Item>
        ))}
        <Pagination.Item>
          <Pagination.Ellipsis />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link size="small" href="?page=8">
            8
          </Pagination.Link>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Next size="small" label={null} href="?page=2" />
        </Pagination.Item>
      </Pagination.Content>
    </Pagination.Root>
  )
}
