import { Copy } from 'lucide-react'
import React, {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from 'react'

import { cn } from '../../../../lib/utils'
import { copyToClipboard } from '../../../../lib/copy-to-clipboard'
// Imported from the file rather than the `form` barrel: the InputGroup family is an
// internal building block for DataInput/Form, deliberately not part of the public API
// (consumers get `Input`'s own `prefix`/`suffix` props instead).
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput as BaseInput,
} from '../form/input-group'

export interface DataInputProps extends Omit<ComponentProps<typeof BaseInput>, 'onCopy'> {
  copy?: boolean
  showCopyOnHover?: boolean
  onCopy?: () => void
  icon?: any
  reveal?: boolean
  actions?: React.ReactNode
  iconContainerClassName?: string
  containerClassName?: string
}

const DataInput = forwardRef<
  ElementRef<typeof BaseInput>,
  ComponentPropsWithoutRef<typeof BaseInput> & DataInputProps
>(
  (
    {
      copy,
      showCopyOnHover = false,
      icon,
      reveal = false,
      actions,
      onCopy,
      iconContainerClassName,
      containerClassName,
      size = 'small',
      ...props
    }: DataInputProps,
    ref
  ) => {
    const [copyLabel, setCopyLabel] = useState('Copy')
    const [hidden, setHidden] = useState(true)
    const inputRef = useRef<HTMLInputElement>(null)

    const setInputRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      },
      [ref]
    )

    function _onCopy() {
      copyToClipboard(inputRef.current?.value ?? '', () => {
        /* clipboard successfully set */
        setCopyLabel('Copied')
        setTimeout(function () {
          setCopyLabel('Copy')
        }, 3000)
        onCopy?.()
      })
    }

    function onReveal() {
      setHidden(false)
    }

    return (
      <InputGroup className={containerClassName}>
        <BaseInput
          ref={setInputRef}
          onFocus={(event: React.FocusEvent<HTMLInputElement>) => event.target.select()}
          {...props}
          size={size}
          onCopy={onCopy}
          type={reveal && hidden ? 'password' : props.type}
          disabled={props.disabled}
          className={props.className}
          data-1p-ignore // 1Password
          data-lpignore="true" // LastPass
          data-form-type="other" // Dashlane
          data-bwignore // Bitwarden
        />
        {icon && (
          <InputGroupAddon align="inline-start" className={iconContainerClassName}>
            {icon}
          </InputGroupAddon>
        )}
        {copy || actions || (reveal && hidden) ? (
          <InputGroupAddon
            align="inline-end"
            // Override defaults
            className="pr-1 has-[>button]:mr-0 has-[>kbd]:mr-0"
          >
            {copy && !(reveal && hidden) ? (
              <InputGroupButton
                size="tiny"
                variant="default"
                className={cn(
                  showCopyOnHover &&
                    'opacity-0 group-hover/input-group:opacity-100 group-focus-within/input-group:opacity-100 transition'
                )}
                icon={<Copy size={16} className="text-foreground-muted" />}
                onClick={_onCopy}
              >
                {copyLabel}
              </InputGroupButton>
            ) : null}
            {reveal && hidden ? (
              <InputGroupButton size="tiny" variant="default" onClick={onReveal}>
                Reveal
              </InputGroupButton>
            ) : null}
            {actions}
          </InputGroupAddon>
        ) : null}
      </InputGroup>
    )
  }
)
DataInput.displayName = 'DataInput'

export { DataInput }
