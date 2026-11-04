import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { resolve } from 'node:path'
import ts from 'typescript'
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest'
import { ComponentPlayground } from '../playground/component-playground'
import { playgroundDefinitions } from '../playground/playground-config'
import { playgroundPresets } from '../playground/playground-config/presets'
import { CATEGORY_OF, loadPlayground } from '../playground/playground-config/registry'
import { exampleCode, type Values } from '../playground/playground-config/types'
import { PKG } from '../playground/package-info'

beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
    }
  )
})
afterEach(() => vi.unstubAllGlobals())

const preview = () => within(screen.getByRole('group', { name: 'Live preview' }))
const settings = () => within(screen.getByRole('region', { name: 'Playground settings' }))
async function group(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(settings().getByRole('tab', { name }))
}
async function choose(user: ReturnType<typeof userEvent.setup>, name: string, option: string) {
  const fieldGroup = Object.values(playgroundDefinitions)
    .flatMap((definition) => definition.groups)
    .find((group) => group.fields.some((field) => field.label === name))
  if (fieldGroup) await group(user, fieldGroup.label)
  const segmented = settings().queryByRole('radiogroup', { name })
  if (segmented) {
    await user.click(within(segmented).getByRole('radio', { name: option }))
    return
  }
  await user.click(settings().getByRole('combobox', { name }))
  await user.click(await screen.findByRole('option', { name: option }))
}
// The page loads a definition on demand; loaded ones render without a second pass.
beforeAll(() => Promise.all(Object.keys(CATEGORY_OF).map(loadPlayground)))

test('the registry and the definitions list the same components', () => {
  expect(Object.keys(CATEGORY_OF).sort()).toEqual(Object.keys(playgroundDefinitions).sort())
})

async function code(user: ReturnType<typeof userEvent.setup>) {
  const button = screen.getByRole('button', { name: 'Your code' })
  if (button.getAttribute('aria-expanded') !== 'true') await user.click(button)
  return screen.getByRole('region', { name: 'Your code' }).textContent ?? ''
}

test('typing in a live field keeps focus and updates controls and usable code', async () => {
  const user = userEvent.setup()
  render(<ComponentPlayground id="input" />)
  const field = preview().getByRole('textbox', { name: 'Email' })
  await user.type(field, 'hello@example.com')
  expect(document.activeElement).toBe(field)
  await group(user, 'Content')
  expect(settings().getByRole('textbox', { name: 'Value' })).toHaveProperty(
    'value',
    'hello@example.com'
  )
  await user.type(settings().getByRole('textbox', { name: 'Prefix' }), '$')
  await group(user, 'Behavior')
  await user.click(settings().getByRole('checkbox', { name: 'Read only' }))
  expect(preview().getByRole('textbox', { name: 'Email' })).toHaveProperty('readOnly', true)
  const snippet = await code(user)
  expect(snippet).toContain('useState<string>("hello@example.com")')
  expect(snippet).toContain('onChange={(event) => setValue(event.target.value)}')
  expect(snippet).toContain('prefix="$"')
  await user.click(screen.getByRole('button', { name: 'Reset preview' }))
  expect(preview().getByRole('textbox', { name: 'Email' })).toHaveProperty('value', '')
  expect(preview().getByRole('textbox', { name: 'Email' })).toHaveProperty('readOnly', false)
})

test('checkbox supports mixed state and live changes are reflected in settings', async () => {
  const user = userEvent.setup()
  render(<ComponentPlayground id="checkbox" />)
  await choose(user, 'Checked state', 'indeterminate')
  const checkbox = preview().getByRole('checkbox', { name: 'Accept terms' })
  expect(checkbox.getAttribute('aria-checked')).toBe('mixed')
  await user.click(checkbox)
  expect(checkbox.getAttribute('aria-checked')).toBe('true')
  expect(settings().getByRole('radio', { name: 'checked', checked: true })).toBeTruthy()
  expect(await code(user)).toContain('useState<boolean | "indeterminate">(true)')
})

test('select supports edited options, grouping, selection and clearing', async () => {
  const user = userEvent.setup()
  render(<ComponentPlayground id="select" />)
  await group(user, 'Content')
  fireEvent.change(settings().getByRole('textbox', { name: 'Options' }), {
    target: { value: 'Alpha\nBeta\nGamma' }
  })
  await user.click(settings().getByRole('checkbox', { name: 'Group options' }))
  await group(user, 'Behavior')
  await user.click(settings().getByRole('checkbox', { name: 'Disable last option' }))
  await user.click(preview().getByRole('combobox', { name: 'Environment' }))
  expect(screen.getByRole('option', { name: 'Gamma' }).getAttribute('aria-disabled')).toBe('true')
  await user.click(screen.getByRole('option', { name: 'Beta' }))
  await group(user, 'Content')
  expect(settings().getByRole('combobox', { name: 'Selected option' }).textContent).toBe('Beta')
  const snippet = await code(user)
  expect(snippet).toContain('useState<string | null>("option-2")')
  expect(snippet).toContain('groups={')
  expect(snippet).toContain('"label":"Beta"')
  const select = preview().getByRole('combobox', { name: 'Environment' })
  select.focus()
  await user.keyboard('{Backspace}')
  expect(settings().getByRole('combobox', { name: 'Selected option' }).textContent).toBe('None')
})

test('range slider clamps to valid bounds and keyboard changes reach the code', async () => {
  const user = userEvent.setup()
  render(<ComponentPlayground id="slider" />)
  await group(user, 'Content')
  await user.click(settings().getByRole('checkbox', { name: 'Range (two thumbs)' }))
  await group(user, 'Behavior')
  fireEvent.change(settings().getByRole('spinbutton', { name: 'Maximum' }), {
    target: { value: '50' }
  })
  expect(
    preview().getByRole('slider', { name: 'Volume maximum' }).getAttribute('aria-valuenow')
  ).toBe('50')
  const start = preview().getByRole('slider', { name: 'Volume minimum' })
  start.focus()
  await user.keyboard('{ArrowRight}')
  await group(user, 'Content')
  expect(settings().getByRole('spinbutton', { name: 'Value / range start' })).toHaveProperty(
    'value',
    '41'
  )
  expect(await code(user)).toContain('useState<number[]>([41,50])')
  await choose(user, 'Orientation', 'vertical')
  expect(
    preview().getByRole('slider', { name: 'Volume minimum' }).getAttribute('aria-orientation')
  ).toBe('vertical')
  await group(user, 'Content')
  const valueControl = settings().getByRole('spinbutton', { name: 'Value / range start' })
  fireEvent.change(valueControl, { target: { value: '999' } })
  fireEvent.blur(valueControl)
  expect(valueControl).toHaveProperty('value', '50')
  expect(
    preview().getByRole('slider', { name: 'Volume minimum' }).getAttribute('aria-valuenow')
  ).toBe('50')
})

test('settings remain editable from code, and switching component resets its values', async () => {
  const user = userEvent.setup()
  const { rerender } = render(<ComponentPlayground id="button" />)
  await code(user)
  await group(user, 'Content')
  fireEvent.change(settings().getByRole('textbox', { name: 'Button text' }), {
    target: { value: 'Save "draft" <now> & later\n{safe}' }
  })
  expect(screen.getByRole('region', { name: 'Your code' }).textContent).toContain(
    'Save \\"draft\\" <now> & later{safe}'
  )
  rerender(<ComponentPlayground id="textarea" />)
  expect(preview().getByRole('textbox', { name: 'Message' })).toHaveProperty('value', '')
  rerender(<ComponentPlayground id="unknown" />)
  expect(screen.queryByRole('region', { name: 'Playground settings' })).toBeNull()
})

test('scenarios replace the previous setup, stay editable and reset without hiding the preview', async () => {
  const user = userEvent.setup()
  render(<ComponentPlayground id="button" />)
  const scenarios = within(screen.getByRole('group', { name: 'Starting scenarios' }))
  await user.click(scenarios.getByRole('button', { name: 'Loading' }))
  expect(preview().getByRole('button', { name: 'Saving changes' })).toHaveProperty('disabled', true)
  await user.click(scenarios.getByRole('button', { name: 'With icon' }))
  expect(preview().getByRole('button', { name: 'Download' })).toHaveProperty('disabled', false)
  expect(scenarios.getByRole('button', { name: 'With icon' }).getAttribute('aria-pressed')).toBe(
    'true'
  )
  await group(user, 'Content')
  fireEvent.change(settings().getByRole('textbox', { name: 'Button text' }), {
    target: { value: 'Export' }
  })
  expect(scenarios.getByText('Custom')).toBeTruthy()
  expect(await code(user)).toContain('Export')
  expect(preview().getByRole('button', { name: 'Export' })).toBeTruthy()
  await user.click(screen.getByRole('button', { name: 'Reset preview' }))
  expect(scenarios.getByRole('button', { name: 'Default' }).getAttribute('aria-pressed')).toBe(
    'true'
  )
  expect(preview().getByRole('button', { name: 'Continue' })).toBeTruthy()
})

test.each(Object.keys(playgroundDefinitions))(
  '%s playground controls have accessible names',
  async (id) => {
    const { container } = render(
      <main>
        <ComponentPlayground id={id} />
      </main>
    )
    const { violations } = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        // cmdk renders its list through groups that axe cannot follow in jsdom.
        'aria-required-children': { enabled: id !== 'command' }
      }
    })
    expect(violations.map((violation) => `${violation.id}: ${violation.nodes[0]?.target}`)).toEqual(
      []
    )
  }
)

test('generated examples typecheck against the actual component API, including edited text and icons', () => {
  const examples = new Map<string, string>()
  let index = 0
  for (const [id, definition] of Object.entries(playgroundDefinitions)) {
    const edited: Values = { ...definition.initial }
    for (const group of definition.groups)
      for (const field of group.fields) {
        if (field.type === 'boolean') edited[field.key] = !edited[field.key]
        else if (field.type === 'choice') {
          const choices =
            typeof field.options === 'function' ? field.options(edited) : field.options
          edited[field.key] = choices.at(-1)?.value ?? edited[field.key]
        } else if (field.type === 'text' || field.type === 'textarea')
          edited[field.key] = 'A "quote" <tag> & {value}\nnext line'
      }
    const scenarios = (definition.presets ?? playgroundPresets[id] ?? []).map((preset) => ({
      ...definition.initial,
      ...preset.values
    }))
    for (const rawValues of [definition.initial, edited, ...scenarios]) {
      const values = definition.normalize?.(rawValues) ?? rawValues
      const source = exampleCode(definition.build(values)).replace(`'${PKG}'`, "'../src'")
      examples.set(
        resolve(`playground/__generated_playground_${index++}.tsx`).replaceAll('\\', '/'),
        source
      )
    }
  }
  const options: ts.CompilerOptions = {
    noEmit: true,
    strict: true,
    skipLibCheck: true,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    target: ts.ScriptTarget.ES2023,
    types: ['vite/client']
  }
  const host = ts.createCompilerHost(options)
  const readSource = host.getSourceFile.bind(host)
  host.getSourceFile = (file, version, onError, shouldCreateNewSourceFile) => {
    const source = examples.get(file.replaceAll('\\', '/'))
    return source === undefined
      ? readSource(file, version, onError, shouldCreateNewSourceFile)
      : ts.createSourceFile(file, source, version, true, ts.ScriptKind.TSX)
  }
  const program = ts.createProgram([...examples.keys()], options, host)
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .filter(
      (diagnostic) =>
        diagnostic.file && examples.has(diagnostic.file.fileName.replaceAll('\\', '/'))
    )
  expect(
    diagnostics.map(
      (diagnostic) =>
        `${diagnostic.file?.fileName}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`
    )
  ).toEqual([])
}, 180000)
