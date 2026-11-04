import type { AdmonitionType } from './admonition-types'
import type { Labels } from '../../../providers/locale-provider'

export const TYPE_TO_VARIANT = {
  note: 'default',
  caution: 'warning',
  danger: 'destructive',
  deprecation: 'warning',
  default: 'default',
  warning: 'warning',
  destructive: 'destructive',
  success: 'default',
} as const satisfies Record<AdmonitionType, 'default' | 'warning' | 'destructive'>

export const TYPE_LABEL = {
  note: 'admonitionNote',
  caution: 'admonitionCaution',
  danger: 'admonitionDanger',
  deprecation: 'admonitionDeprecated',
  default: 'admonitionNote',
  warning: 'admonitionWarning',
  destructive: 'admonitionDanger',
  success: 'admonitionSuccess',
} as const satisfies Record<AdmonitionType, keyof Labels>
