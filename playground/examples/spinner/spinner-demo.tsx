import { Button, Spinner } from '../../../src'

export default function SpinnerDemo() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-6">
        <Spinner size="small" />
        <Spinner size="medium" />
        <Spinner size="large" label="Loading projects" />
      </div>
      <div className="flex items-center gap-2 text-sm text-foreground-light">
        <Spinner size="small" decorative />
        Fetching rows…
      </div>
      <Button variant="default" disabled>
        <span className="flex items-center gap-2">
          <Spinner size="small" decorative /> Saving
        </span>
      </Button>
    </div>
  )
}
