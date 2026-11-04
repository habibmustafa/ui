/*
 * Hybrid API layer (docs/hybrid-api-migration.md) for MultiSelector — Strategy A,
 * discriminator `options`. Not present upstream; mirrors the Select atom's own `options`
 * flat-list pattern (SelectOption: value/label/disabled).
 */
import type * as React from 'react'

import {
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorRoot,
  MultiSelectorTrigger,
  type MultiSelectorRootProps,
  type MultiSelectorTriggerProps,
} from './multi-select-parts'
import { readOptions, type OptionAccessors, type OptionValue } from '../../../../lib/options'

export interface MultiSelectorOption<V extends OptionValue = string> {
  value: V
  label?: React.ReactNode
  disabled?: boolean
}

/**
 * With `options` the MultiSelector renders the whole control; without it, it is the root
 * and takes `children` (the compound parts, whose values are strings).
 */
export type MultiSelectorProps<T = MultiSelectorOption, V extends OptionValue = string> = Omit<
  MultiSelectorRootProps,
  'values' | 'onValuesChange'
> &
  OptionAccessors<T> &
  Pick<
    MultiSelectorTriggerProps,
    | 'label'
    | 'persistLabel'
    | 'badgeLimit'
    | 'wrapBadges'
    | 'deletableBadge'
    | 'showIcon'
    | 'clearable'
    | 'renderValue'
    | 'mode'
  > & {
    /** Selected values (strings or numbers). */
    values: V[]
    onValuesChange: (values: V[]) => void
    /** Option list; leave it out to compose the parts yourself. */
    options?: readonly T[]
    /** @default 9999 (no wrap) */
    creatable?: boolean
    emptyLabel?: string
    error?: boolean
    errorLabel?: string
    loading?: boolean
    triggerClassName?: string
    /**
     * Renders a MultiSelectorInput search field above the list (`mode="combobox"`'s own
     * filter box) — not used with `mode: "inline-combobox"`, which searches inline in the
     * trigger instead.
     */
    searchable?: boolean
    searchPlaceholder?: string
    /**
     * The trigger button — the focusable control. `aria-labelledby`, `aria-describedby`,
     * `aria-invalid` and `onBlur` also go to the trigger in this mode (so a FormControl
     * around it marks the control a user actually reaches), while `id` stays on the root.
     */
    ref?: React.Ref<HTMLButtonElement>
  }

export function MultiSelectorHybrid<T = MultiSelectorOption, V extends OptionValue = string>(
  props: MultiSelectorProps<T, V>
) {
  if (props.options === undefined) {
    return <MultiSelectorRoot {...(props as unknown as MultiSelectorRootProps)} />
  }

  const {
    options,
    valueExpr,
    displayExpr,
    getOptionValue,
    getOptionLabel,
    values,
    onValuesChange,
    label,
    persistLabel,
    badgeLimit,
    wrapBadges,
    deletableBadge,
    showIcon,
    clearable,
    renderValue,
    mode,
    creatable,
    emptyLabel,
    error,
    errorLabel,
    loading,
    triggerClassName,
    searchable,
    searchPlaceholder,
    ref,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'aria-invalid': ariaInvalid,
    onBlur,
    ...rootProps
  } = props

  const read = readOptions(options, { valueExpr, displayExpr, getOptionValue, getOptionLabel })
  // The root and the DOM carry string keys; map them back to the original values.
  const toValue = (key: string) => (read.find((option) => option.key === key)?.value ?? key) as V

  // The trigger only knows the selected *values*; in options mode the consumer already
  // told us each one's label, so show that instead of the raw value (compound mode has
  // no option list to look this up in, hence the default living here).
  const renderOptionLabel =
    renderValue ?? ((key: string) => read.find((option) => option.key === key)?.label ?? key)

  return (
    <MultiSelectorRoot
      {...rootProps}
      values={values.map(String)}
      onValuesChange={(keys) => onValuesChange(keys.map(toValue))}
    >
      <MultiSelectorTrigger
        ref={ref}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        aria-invalid={ariaInvalid}
        onBlur={onBlur as React.FocusEventHandler<HTMLButtonElement> | undefined}
        className={triggerClassName}
        label={label}
        persistLabel={persistLabel}
        badgeLimit={badgeLimit}
        wrapBadges={wrapBadges}
        deletableBadge={deletableBadge}
        showIcon={showIcon}
        clearable={clearable}
        renderValue={renderOptionLabel}
        mode={mode}
      />
      <MultiSelectorContent>
        {searchable && <MultiSelectorInput placeholder={searchPlaceholder} showResetIcon />}
        <MultiSelectorList
          creatable={creatable}
          emptyLabel={emptyLabel}
          error={error}
          errorLabel={errorLabel}
          loading={loading}
        >
          {read.map((option) => (
            <MultiSelectorItem key={option.key} value={option.key} disabled={option.disabled}>
              {option.label}
            </MultiSelectorItem>
          ))}
        </MultiSelectorList>
      </MultiSelectorContent>
    </MultiSelectorRoot>
  )
}
