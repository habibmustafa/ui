'use client'

import { ImageOff, X } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import * as React from 'react'

import { modalBackdropClass } from '../../../../lib/modal-backdrop'
import { cn } from '../../../../lib/utils'
import { useLabels } from '../../../../providers/locale-provider'
import { useControllableState } from '../../../../lib/use-controllable-state'
import { Skeleton } from '../../feedback/skeleton'

/*
 * An <img> with the states it usually needs: a skeleton while it loads, a fallback when
 * it fails, and an optional click-to-enlarge lightbox (`preview`). The lightbox is a
 * Radix Dialog, so focus is trapped, Escape and the backdrop close it, and the trigger
 * is a real button with an accessible name.
 */

export interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string
  /** Required: describes the image, and names the preview button and dialog. */
  alt: string
  /** Shown instead of the image when it fails to load or `src` is missing. */
  fallback?: React.ReactNode
  /** Click to open the image in a lightbox. Pass a string to preview a larger file. */
  preview?: boolean | string
  /** Controlled lightbox state. */
  previewOpen?: boolean
  onPreviewOpenChange?: (open: boolean) => void
  /** Shows a skeleton until the image has loaded. @default true */
  showSkeleton?: boolean
  /** CSS aspect ratio of the frame, e.g. `16 / 9`. */
  aspectRatio?: number | string
  /** @default "cover" */
  fit?: 'cover' | 'contain' | 'fill' | 'none'
  /** @default "md" */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  /** Classes for the wrapper; `className` goes on the <img>. */
  wrapperClassName?: string
  /** Label of the lightbox close button. @default "Close preview" */
  closeLabel?: string
}

const fitClass = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
  none: 'object-none',
} as const

const radiusClass = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
} as const

type Status = 'loading' | 'loaded' | 'error'

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt,
      fallback,
      preview = false,
      previewOpen,
      onPreviewOpenChange,
      showSkeleton = true,
      aspectRatio,
      fit = 'cover',
      radius = 'md',
      className,
      wrapperClassName,
      closeLabel,
      style,
      onLoad,
      onError,
      ...props
    },
    ref
  ) => {
    const labels = useLabels()
    const [status, setStatus] = React.useState<Status>(src ? 'loading' : 'error')
    const [open, setOpen] = useControllableState({
      value: previewOpen,
      defaultValue: false,
      onChange: onPreviewOpenChange,
    })

    // A new src starts a new load. Adjusting state during render (not in an effect) keeps
    // the previous image's "loaded" state from flashing over the next one.
    const [trackedSrc, setTrackedSrc] = React.useState(src)
    if (src !== trackedSrc) {
      setTrackedSrc(src)
      setStatus(src ? 'loading' : 'error')
    }

    // Images that finished loading before React attached its handlers (SSR, cache) never
    // fire onLoad; read the settled state off the element instead.
    const imgRef = React.useRef<HTMLImageElement | null>(null)
    const setRefs = (node: HTMLImageElement | null) => {
      imgRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }
    React.useEffect(() => {
      const img = imgRef.current
      if (img?.complete && img.naturalWidth > 0) setStatus('loaded')
    }, [src])

    const previewSrc = typeof preview === 'string' ? preview : src
    const canPreview = Boolean(preview) && status === 'loaded' && Boolean(previewSrc)

    const frameStyle: React.CSSProperties = {
      ...(aspectRatio !== undefined ? { aspectRatio: String(aspectRatio) } : null),
    }

    if (status === 'error') {
      return (
        <div
          role="img"
          aria-label={alt}
          style={frameStyle}
          className={cn(
            'flex items-center justify-center overflow-hidden bg-surface-100 text-foreground-lighter',
            radiusClass[radius],
            wrapperClassName
          )}
        >
          {fallback ?? <ImageOff className="h-6 w-6" aria-hidden="true" />}
        </div>
      )
    }

    const image = (
      <img
        ref={setRefs}
        src={src}
        alt={alt}
        style={style}
        onLoad={(event) => {
          setStatus('loaded')
          onLoad?.(event)
        }}
        onError={(event) => {
          setStatus('error')
          onError?.(event)
        }}
        className={cn(
          'h-full w-full transition-opacity duration-300',
          fitClass[fit],
          status === 'loading' ? 'opacity-0' : 'opacity-100',
          className
        )}
        {...props}
      />
    )

    return (
      <div
        style={frameStyle}
        className={cn('relative inline-block overflow-hidden', radiusClass[radius], wrapperClassName)}
      >
        {showSkeleton && status === 'loading' && (
          <Skeleton aria-hidden="true" className="absolute inset-0 h-full w-full rounded-none" />
        )}
        {/* With `preview`, the trigger is there from the first render and only enabled once
            the image has loaded: wrapping the <img> at that point would remount it, load it
            again and call onLoad twice. */}
        {preview ? (
          <DialogPrimitive.Root open={canPreview && open} onOpenChange={setOpen}>
            <DialogPrimitive.Trigger asChild>
              <button
                type="button"
                disabled={!canPreview}
                aria-label={labels.imagePreview(alt)}
                className="block h-full w-full cursor-zoom-in focus-ring disabled:cursor-default"
              >
                {image}
              </button>
            </DialogPrimitive.Trigger>
            <DialogPrimitive.Portal>
              <DialogPrimitive.Overlay
                className={cn(modalBackdropClass, 'fixed inset-0 z-50 grid place-items-center p-4 sm:p-8')}
              >
                <DialogPrimitive.Content
                  aria-describedby={undefined}
                  className="relative flex max-h-full max-w-full items-center justify-center outline-none"
                >
                  <DialogPrimitive.Title className="sr-only">{alt}</DialogPrimitive.Title>
                  <img
                    src={previewSrc}
                    alt={alt}
                    className="max-h-[calc(100vh-4rem)] max-w-full rounded-md object-contain shadow-lg"
                  />
                  <DialogPrimitive.Close
                    aria-label={closeLabel ?? labels.imageClose}
                    className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full border bg-background text-foreground shadow-md focus-ring"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </DialogPrimitive.Close>
                </DialogPrimitive.Content>
              </DialogPrimitive.Overlay>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>
        ) : (
          image
        )}
      </div>
    )
  }
)
Image.displayName = 'Image'

export { Image }
