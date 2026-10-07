import { Result, type ResultStatus } from '../../../src'

const statuses: { status: ResultStatus; title: string; description: string }[] = [
  { status: 'error', title: 'Upload failed', description: 'The file is larger than 5 MB.' },
  { status: 'warning', title: 'Almost there', description: 'Verify your email to continue.' },
  { status: '403', title: 'No access', description: 'You need permission to view this page.' },
  { status: '404', title: 'Page not found', description: 'The page was moved or never existed.' },
  { status: '500', title: 'Something broke', description: 'We are looking into it.' },
]

export default function ResultStatuses() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {statuses.map((s) => (
        <Result key={s.status} size="small" level={3} {...s} className="rounded-md border" />
      ))}
    </div>
  )
}
