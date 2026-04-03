import { fromElement } from "./extract.ts";
import type { ResponsiveDescriptor } from "./types.ts";

const DEFAULT_BREAKPOINTS = [0, 768, 1024];

/**
 * Extract a responsive descriptor from a rendered DOM element at multiple widths.
 *
 * Resizes the element's container to each breakpoint width, extracts the
 * skeleton descriptor, and returns a ResponsiveDescriptor mapping.
 */
export function extractResponsive(
  el: Element,
  breakpoints: number[] = DEFAULT_BREAKPOINTS,
): ResponsiveDescriptor {
  const container = el.parentElement;
  if (!container) {
    throw new Error("boneyard-vue: element must have a parent to extract responsive descriptors");
  }

  const originalWidth = container.style.width;
  const originalOverflow = container.style.overflow;

  const result: ResponsiveDescriptor = {};

  container.style.overflow = "hidden";

  const sorted = [...breakpoints].sort((a, b) => a - b);

  for (const bp of sorted) {
    const targetWidth = bp === 0 ? 375 : bp;

    container.style.width = `${targetWidth}px`;

    // Force synchronous layout recalc
    void container.offsetHeight;

    try {
      result[bp] = fromElement(el);
    } catch {
      // Skip breakpoints that fail to extract
    }
  }

  container.style.width = originalWidth;
  container.style.overflow = originalOverflow;

  void container.offsetHeight;

  return result;
}
