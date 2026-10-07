import { NavigationMenu } from '../../../src'

const product = [
  { title: 'Database', href: '#database', description: 'A full Postgres database for every project.' },
  { title: 'Auth', href: '#auth', description: 'Users, sessions and row level security.' },
  { title: 'Storage', href: '#storage', description: 'Store and serve files of any size.' },
  { title: 'Realtime', href: '#realtime', description: 'Listen to database changes over websockets.' },
]

export default function NavigationMenuDemo() {
  return (
    // The panel renders inline below the bar (no portal), so leave room for it.
    <div className="flex h-72 w-full items-start justify-center">
      <NavigationMenu.Root>
        <NavigationMenu.List>
          <NavigationMenu.Item>
            <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <ul className="grid w-[30rem] grid-cols-2 gap-1">
                {product.map((link) => (
                  <li key={link.href}>
                    <NavigationMenu.Link href={link.href}>
                      <span className="text-sm text-foreground">{link.title}</span>
                      <span className="line-clamp-2 text-xs text-foreground-lighter">{link.description}</span>
                    </NavigationMenu.Link>
                  </li>
                ))}
              </ul>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Trigger>Developers</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <ul className="grid w-72 gap-1">
                <li>
                  <NavigationMenu.Link href="#docs">Documentation</NavigationMenu.Link>
                </li>
                <li>
                  <NavigationMenu.Link href="#changelog">Changelog</NavigationMenu.Link>
                </li>
                <li>
                  <NavigationMenu.Link href="#status">Status</NavigationMenu.Link>
                </li>
              </ul>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link href="#pricing" className="h-8 flex-row px-3 py-0 justify-center">
              Pricing
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>
    </div>
  )
}
