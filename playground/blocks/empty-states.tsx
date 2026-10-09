import { FolderPlus, Search, SearchX } from 'lucide-react'

import { Button, EmptyStatePresentational, ErrorDisplay, Input } from '../../src'

export default function EmptyStates() {
  return (
    <div className="grid w-full max-w-5xl gap-4 md:grid-cols-3">
      <section aria-label="Nothing yet" className="flex flex-col overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-medium text-foreground">Projects</h3>
          <span className="text-xs tabular-nums text-foreground-lighter">0 projects</span>
        </div>
        <div className="flex flex-1 p-4">
          <EmptyStatePresentational
            icon={<FolderPlus />}
            title="No projects yet"
            description="A project holds your databases, functions and files. Create one to get started."
            className="justify-center"
          >
            <Button variant="primary" size="small">
              Create project
            </Button>
          </EmptyStatePresentational>
        </div>
      </section>

      <section aria-label="Nothing found" className="flex flex-col overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
        <div className="border-b px-4 py-3">
          <Input
            defaultValue="invoice"
            readOnly
            prefix={<Search className="h-4 w-4 text-foreground-muted" aria-hidden="true" />}
            aria-label="Search projects"
          />
        </div>
        <div className="flex flex-1 p-4">
          <EmptyStatePresentational
            icon={<SearchX />}
            title="Nothing matches “invoice”"
            description="Check the spelling, or search for a shorter word."
            className="justify-center"
          >
            <Button size="small">Clear search</Button>
          </EmptyStatePresentational>
        </div>
      </section>

      <section aria-label="Something broke" className="flex flex-col overflow-hidden rounded-xl border bg-surface-100 shadow-sm">
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-medium text-foreground">Projects</h3>
        </div>
        <div className="flex flex-1 items-center p-4">
          <ErrorDisplay
            title="Projects did not load"
            errorMessage="The request timed out. Your data is safe, so try again in a moment."
          >
            <Button size="small">Try again</Button>
          </ErrorDisplay>
        </div>
      </section>
    </div>
  )
}
