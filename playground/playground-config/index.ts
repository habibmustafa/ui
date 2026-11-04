import { actions } from './actions'
import { display } from './display'
import { forms } from './forms'
import { fragments } from './fragments'
import { inputs } from './inputs'
import { overlay } from './overlay'
import { navigation } from './navigation'
import { layout } from './layout'
import { feedback } from './feedback'
import { data } from './data'
import type { Definition } from './types'

export const playgroundDefinitions: Record<string, Definition> = {
  ...actions,
  ...forms,
  ...display,
  ...data,
  ...feedback,
  ...layout,
  ...navigation,
  ...overlay,
  ...inputs,
  ...fragments
}
