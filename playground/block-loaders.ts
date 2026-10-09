import { lazy, type ComponentType } from 'react'

const loaders = import.meta.glob<{ default: ComponentType }>('./blocks/*.tsx')
export const BLOCK_COMPONENTS = Object.fromEntries(Object.entries(loaders).map(([path, loader]) => [path.split('/').pop()!.replace('.tsx', ''), lazy(loader)]))
