import { MultiSelectorHybrid } from './multi-select'
import {
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorRoot,
  MultiSelectorTrigger,
} from './multi-select-parts'

export const MultiSelector = Object.assign(MultiSelectorHybrid, {
  Root: MultiSelectorRoot,
  Trigger: MultiSelectorTrigger,
  Input: MultiSelectorInput,
  Content: MultiSelectorContent,
  List: MultiSelectorList,
  Item: MultiSelectorItem,
})

export {
  MultiSelectorRoot,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from './multi-select-parts'
export type { MultiSelectorRootProps, MultiSelectorTriggerProps } from './multi-select-parts'
export type { MultiSelectorOption, MultiSelectorProps } from './multi-select'
export { SelectionListState } from './selection-list-state'
