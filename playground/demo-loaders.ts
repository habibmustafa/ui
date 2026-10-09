import { lazy, type ComponentType } from 'react'

const modules = import.meta.glob<{ default: ComponentType }>('./examples/**/*.tsx')
export const demoLoaders = Object.fromEntries(Object.entries(modules).map(([path, loader]) => [path.split('/').pop()!.replace(/\.tsx$/, ''), loader]))
const pending = new Map<string, Promise<{ default: ComponentType }>>()

function loadDemo(name: string) {
  let promise = pending.get(name)
  if (!promise) {
    promise = demoLoaders[name]()
    pending.set(name, promise)
    void promise.catch(() => pending.delete(name))
  }
  return promise
}

const demos = Object.fromEntries(Object.keys(demoLoaders).map(name => [name, lazy(() => loadDemo(name))]))
export function getDemo(name: string) { return demos[name] }
export function prefetchDemo(name: string) {
  if (demoLoaders[name]) void loadDemo(name).catch(() => {})
}
