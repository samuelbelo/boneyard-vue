import { fromElement } from "./extract.ts";
import { computeLayout } from "./layout.ts";
import { renderBones } from "./runtime.ts";
import type { SkeletonDescriptor } from "./types.ts";

export type {
  Bone,
  SkeletonResult,
  ResponsiveBones,
  SkeletonDescriptor,
  ResponsiveDescriptor,
  SnapshotConfig,
} from "./types.ts";

export { snapshotBones } from "./extract.ts";
export { fromElement } from "./extract.ts";
export { extractResponsive } from "./responsive.ts";
export { computeLayout } from "./layout.ts";
export { renderBones } from "./runtime.ts";

/**
 * All-in-one convenience: extract descriptor -> compute layout -> render HTML.
 *
 * For Vue, prefer `<BoneyardSkeleton>` from 'boneyard-vue/vue' — it handles
 * caching, responsiveness, and dark mode automatically.
 */
export function skeleton(
  el: Element,
  options?: { width?: number; color?: string; animate?: boolean },
): string {
  const structure: SkeletonDescriptor = fromElement(el);
  const w = options?.width ?? el.getBoundingClientRect().width;
  const result = computeLayout(structure, w);
  return renderBones(result, options?.color, options?.animate);
}
