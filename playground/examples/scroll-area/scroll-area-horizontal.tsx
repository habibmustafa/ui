import { ScrollArea } from '../../../src'

const regions = ['Frankfurt', 'London', 'Paris', 'Stockholm', 'North Virginia', 'Oregon', 'São Paulo', 'Mumbai', 'Singapore', 'Sydney', 'Tokyo', 'Seoul']

export default function ScrollAreaHorizontal() {
  return (
    <ScrollArea aria-label="Regions" orientation="horizontal" className="w-96 whitespace-nowrap rounded-md border">
      <div className="flex w-max gap-3 p-4">
        {regions.map((region) => (
          <div key={region} className="flex h-20 w-32 shrink-0 items-end rounded-md border bg-surface-100 p-2 text-xs text-foreground-light">
            {region}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
