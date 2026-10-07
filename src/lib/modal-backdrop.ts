/*
 * Backdrop for Dialog / AlertDialog, whose content renders *inside* the overlay (the
 * overlay is also the scroll container for tall dialogs).
 *
 * The dim + blur live on the overlay's ::before, and only that fades in on open. If
 * the overlay element itself faded in, the content's own fade would be multiplied by
 * it (at 30% backdrop × 30% content the panel shows at 9%), so the dialog seemed to
 * arrive late. On close the whole overlay fades out: Radix keeps the overlay mounted
 * until *its own* animation ends, and a quick combined exit is what we want anyway.
 *
 * No backdrop-filter: a blur under an animating dialog is recomputed every frame and
 * halved the frame rate while the dialog opened (9-11 frames in 300ms vs a steady 20
 * without it). A slightly deeper dim does the same job of pushing the page back.
 */
export const modalBackdropClass = [
  'before:pointer-events-none before:fixed before:inset-0 before:-z-10',
  'before:bg-black/50 before:will-change-[opacity]',
  'data-[state=open]:before:animate-backdrop-show',
  'data-[state=closed]:animate-backdrop-hide',
].join(' ')
