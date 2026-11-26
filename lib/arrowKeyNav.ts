/**
 * Product pages step to the previous or next product on Left / Right. Those
 * keys also move the caret in a text field, change a select or slider, and
 * page a carousel or an open dialog, so the page only takes them when focus
 * is in none of those and nothing modal is open.
 */

export interface ArrowNavEvent {
  key: string;
  defaultPrevented?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  target?: unknown;
}

interface ClosestTarget {
  closest: (selector: string) => unknown;
}

interface QueryRoot {
  querySelector: (selector: string) => unknown;
}

/** Elements that use the arrow keys themselves. */
export const ARROW_KEY_OWNERS = [
  "input",
  "select",
  "textarea",
  "[contenteditable]",
  "[role='slider']",
  "[role='listbox']",
  "[role='menu']",
  "[role='tablist']",
  "[role='radiogroup']",
  "[aria-roledescription='carousel']",
  "[aria-modal='true']"
].join(", ");

const hasClosest = (t: unknown): t is ClosestTarget =>
  !!t && typeof (t as ClosestTarget).closest === "function";

/**
 * -1 for previous, 1 for next, 0 when the key is not the page's to take.
 * `root` is the document, to see whether a modal dialog is open.
 */
export function productArrowDirection(
  event: ArrowNavEvent,
  root?: QueryRoot | null
): -1 | 0 | 1 {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return 0;
  if (event.defaultPrevented) return 0;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    return 0;
  }
  if (hasClosest(event.target) && event.target.closest(ARROW_KEY_OWNERS)) {
    return 0;
  }
  if (root && root.querySelector("[aria-modal='true']")) return 0;
  return event.key === "ArrowLeft" ? -1 : 1;
}
