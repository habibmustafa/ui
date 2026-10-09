import { Table } from '../src'
import { api, type ApiComponent } from './generated/api'

/*
 * The "API" section at the bottom of every component page. The data comes from
 * scripts/generate-api.mjs, which reads the library's TypeScript types — so this
 * file only lays it out; a wrong row means a wrong type or doc comment in src/.
 */

const LONG_TYPE = 100

function Code({ children }: { children: string }) {
  return (
    <code className="rounded-sm bg-surface-200 px-1 py-0.5 font-mono text-xs text-foreground break-words">
      {children}
    </code>
  )
}

function Extends({ sources }: { sources: ApiComponent['extends'] }) {
  if (sources.length === 0) return null
  return (
    <p className="mt-3 text-xs text-foreground-light">
      Also accepts every prop of{' '}
      {sources.map((source, i) => (
        <span key={`${source.package}/${source.name}`}>
          {i > 0 ? (i === sources.length - 1 ? ' and ' : ', ') : null}
          <Code>{source.name}</Code>
          {source.package ? <span className="text-foreground-muted"> ({source.package})</span> : null}
        </span>
      ))}
      .
    </p>
  )
}

function ComponentApi({ component }: { component: ApiComponent }) {
  const title = component.alias ?? component.name
  return (
    <section className="mb-10">
      <h3 className="font-mono text-sm text-foreground">
        {title}
        {component.alias ? (
          <span className="ml-2 text-xs text-foreground-muted">{component.name}</span>
        ) : null}
      </h3>
      {component.description ? (
        <p className="mt-1 text-sm text-foreground-light">{component.description}</p>
      ) : null}

      {component.props.length > 0 ? (
        <div className="mt-3 overflow-x-auto rounded-md border">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head className="w-1/4">Prop</Table.Head>
                <Table.Head>Type</Table.Head>
                <Table.Head className="w-1/6">Default</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {component.props.map((prop) => (
                <Table.Row key={prop.name}>
                  <Table.Cell className="align-top">
                    <span className="font-mono text-xs text-foreground">
                      {prop.name}
                      {prop.required ? <span className="text-destructive">*</span> : null}
                    </span>
                    {prop.description ? (
                      <p className="mt-1 text-xs text-foreground-light">{prop.description}</p>
                    ) : null}
                  </Table.Cell>
                  <Table.Cell className="align-top">
                    {prop.type.length > LONG_TYPE ? (
                      // Expanded generic soup (slotProps etc.) — collapsed until asked for.
                      <details>
                        <summary className="cursor-pointer text-xs text-foreground-light">
                          <Code>{`${prop.type.slice(0, LONG_TYPE)}…`}</Code>
                        </summary>
                        <div className="mt-1">
                          <Code>{prop.type}</Code>
                        </div>
                      </details>
                    ) : (
                      <Code>{prop.type}</Code>
                    )}
                  </Table.Cell>
                  <Table.Cell className="align-top">
                    {prop.default !== undefined ? (
                      <Code>{prop.default}</Code>
                    ) : (
                      <span className="text-foreground-muted">—</span>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </div>
      ) : (
        <p className="mt-2 text-sm text-foreground-light">No props of its own.</p>
      )}

      <Extends sources={component.extends} />
    </section>
  )
}

export default function ApiReference({ id }: { id: string }) {
  const entry = api[id]
  if (!entry || entry.components.length === 0) return null

  return (
    <div id="api" className="scroll-mt-32">
      <h2 className="mb-1 text-xl tracking-tight">API</h2>
      <p className="mb-6 text-sm text-foreground-light">
        Generated from the TypeScript types in <Code>{entry.source}</Code>.
      </p>
      {entry.components.map((component) => (
        <ComponentApi key={component.name} component={component} />
      ))}
    </div>
  )
}
