import { NavigationMenu } from '../../../src'

export default function NavigationMenuPropsDemo() {
  return (
    // The panel renders inline below the bar (no portal), so leave room for it.
    <div className="flex h-72 w-full items-start justify-center">
      <NavigationMenu
        items={[
          {
            key: 'product',
            label: 'Product',
            links: [
              { title: 'Database', href: '#database', description: 'A full Postgres database for every project.' },
              { title: 'Auth', href: '#auth', description: 'Users, sessions and row level security.' },
              { title: 'Storage', href: '#storage', description: 'Store and serve files of any size.' },
              { title: 'Realtime', href: '#realtime', description: 'Listen to database changes over websockets.' },
            ],
          },
          {
            key: 'developers',
            label: 'Developers',
            links: [
              { title: 'Documentation', href: '#docs' },
              { title: 'Changelog', href: '#changelog' },
              { title: 'Status', href: '#status' },
            ],
          },
          { key: 'pricing', label: 'Pricing', href: '#pricing' },
        ]}
      />
    </div>
  )
}
