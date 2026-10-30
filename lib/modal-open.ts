// One answer to "is something modal open?". Every global key asks it before
// acting (navigation chords, Space, the theme key), so a key never acts from
// under a dialog, an alert, a menu or an open select. Base UI marks an open
// popup with `data-open`.

/** An open floating surface that owns the keyboard: a dialog, an alert, a menu, an open select. */
export const MODAL_OPEN_SELECTOR = [
  '[role="dialog"][data-open]',
  '[role="alertdialog"][data-open]',
  '[role="menu"][data-open]',
  '[role="listbox"][data-open]',
  // A Base UI Select puts the listbox role on its List, inside the open popup.
  '[data-open] [role="listbox"]',
].join(", ");

/** True while a dialog, an alert, a menu or a select is open anywhere in the window. */
export function isModalOpen(
  root: Pick<Document, "querySelector"> = document
): boolean {
  return root.querySelector(MODAL_OPEN_SELECTOR) !== null;
}
