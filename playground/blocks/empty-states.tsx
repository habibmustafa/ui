import { FolderPlus, SearchX } from 'lucide-react'

import { Button, EmptyStatePresentational, ErrorDisplay } from '../../src'

export default function EmptyStates() {
  return (
    <div className="grid w-full max-w-5xl gap-4 md:grid-cols-3">
      <div className="rounded-lg border bg-surface-75 p-6">
        <EmptyStatePresentational
          icon={<FolderPlus />}
          title="No projects yet"
          description="A project holds your databases, functions and files. Create one to get started."
        >
          <Button variant="primary" size="small">
            Create project
          </Button>
        </EmptyStatePresentational>
      </div>

      <div className="rounded-lg border bg-surface-75 p-6">
        <EmptyStatePresentational
          icon={<SearchX />}
          title="Nothing matches “invoice”"
          description="Check the spelling, or search for a shorter word."
        >
          <Button size="small">Clear search</Button>
        </EmptyStatePresentational>
      </div>

      <div className="rounded-lg border bg-surface-75 p-6">
        <ErrorDisplay
          title="Projects did not load"
          errorMessage="The request timed out. Your data is safe, so try again in a moment."
        >
          <Button size="small">Try again</Button>
        </ErrorDisplay>
      </div>
    </div>
  )
}
