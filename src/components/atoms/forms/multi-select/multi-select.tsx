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

export interface MultiSelectorOption {
  value: string
  label?: React.ReactNode
  disabled?: boolean
}

type MultiSelectorOptionsModeProps = Omit<MultiSelectorRootProps, 'children'> &
  Pick<
    MultiSelectorTriggerProps,
    | 'label'
    | 'persistLabel'
    | 'badgeLimit'
    | 'wrapBadges'
    | 'deletableBadge'
    | 'showIcon'
    | 'renderValue'
    | 'mode'
  > & {
    options: readonly MultiSelectorOption[]
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
    children?: never
  }

type MultiSelectorCompoundProps = MultiSelectorRootProps & { options?: never }

export type MultiSelectorProps = MultiSelectorOptionsModeProps | MultiSelectorCompoundProps

export function MultiSelectorHybrid(props: MultiSelectorProps) {
  if (props.options === undefined) {
    return <MultiSelectorRoot {...props} />
  }

  const {
    options,
    label,
    persistLabel,
    badgeLimit,
    wrapBadges,
    deletableBadge,
    showIcon,
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

  // The trigger only knows the selected *values*; in options mode the consumer already
  // told us each one's label, so show that instead of the raw value (compound mode has
  // no option list to look this up in, hence the default living here).
  const renderOptionLabel =
    renderValue ?? ((value: string) => options.find((o) => o.value === value)?.label ?? value)

  return (
    <MultiSelectorRoot {...rootProps}>
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
          {options.map((option) => (
            <MultiSelectorItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label ?? option.value}
            </MultiSelectorItem>
          ))}
        </MultiSelectorList>
      </MultiSelectorContent>
    </MultiSelectorRoot>
  )
}
