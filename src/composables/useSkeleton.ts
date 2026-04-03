import {
  ref,
  computed,
  toValue,
  onMounted,
  onUnmounted,
  type Ref,
  type MaybeRefOrGetter,
} from "vue";
import type { SkeletonResult, ResponsiveBones } from "../types.ts";
import { getRegisteredBones } from "../vue.ts";

export { adjustColor, sanitizeColor } from "../color.ts";

export interface UseSkeletonOptions {
  name?: MaybeRefOrGetter<string | undefined>;
  initialBones?: MaybeRefOrGetter<SkeletonResult | ResponsiveBones | undefined>;
  color?: MaybeRefOrGetter<string | undefined>;
  darkColor?: MaybeRefOrGetter<string | undefined>;
  animate?: MaybeRefOrGetter<boolean | undefined>;
}

export interface UseSkeletonReturn {
  containerRef: Ref<HTMLElement | null>;
  activeBones: Ref<SkeletonResult | null>;
  resolvedColor: Ref<string>;
  isDark: Ref<boolean>;
  containerWidth: Ref<number>;
  containerHeight: Ref<number>;
}

/** Pick the right SkeletonResult from a responsive set for the current width */
function resolveResponsive(
  bones: SkeletonResult | ResponsiveBones,
  width: number,
): SkeletonResult | null {
  if (!("breakpoints" in bones)) return bones;
  const bps = Object.keys(bones.breakpoints)
    .map(Number)
    .sort((a, b) => a - b);
  if (bps.length === 0) return null;
  const match = [...bps].reverse().find((bp) => width >= bp) ?? bps[0];
  return bones.breakpoints[match] ?? null;
}

/**
 * Composable for skeleton bone management.
 *
 * Manages container size tracking, dark mode detection,
 * responsive breakpoint resolution, and registry lookup.
 *
 * All options accept refs, getters, or plain values via MaybeRefOrGetter
 * so prop changes are automatically tracked.
 */
export function useSkeleton(options: UseSkeletonOptions = {}): UseSkeletonReturn {
  const containerRef = ref<HTMLElement | null>(null);
  const containerWidth = ref(0);
  const containerHeight = ref(0);
  const isDark = ref(false);

  let resizeObserver: ResizeObserver | null = null;
  let mutationObserver: MutationObserver | null = null;
  let mediaQuery: MediaQueryList | null = null;
  let mqHandler: (() => void) | null = null;

  const resolvedColor = computed(() => {
    return isDark.value
      ? (toValue(options.darkColor) ?? "rgba(255,255,255,0.06)")
      : (toValue(options.color) ?? "rgba(0,0,0,0.08)");
  });

  const activeBones = computed<SkeletonResult | null>(() => {
    const name = toValue(options.name);
    const initial = toValue(options.initialBones);
    const effectiveBones = initial ?? (name ? getRegisteredBones(name) : undefined);

    if (!effectiveBones || containerWidth.value === 0) return null;

    // Use container width for breakpoint selection — the skeleton should match
    // the container it's rendered in, not the viewport
    return resolveResponsive(effectiveBones, containerWidth.value);
  });

  function checkDark(): void {
    const hasDarkClass =
      document.documentElement.classList.contains("dark") || !!containerRef.value?.closest(".dark");
    isDark.value = hasDarkClass;
  }

  onMounted(() => {
    if (typeof window === "undefined") return;

    // Dark mode detection
    checkDark();
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mqHandler = () => checkDark();
    mediaQuery.addEventListener("change", mqHandler);

    mutationObserver = new MutationObserver(checkDark);
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Container size tracking
    const el = containerRef.value;
    if (!el) return;

    resizeObserver = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      containerWidth.value = Math.round(rect?.width ?? 0);
      if (rect && rect.height > 0) containerHeight.value = Math.round(rect.height);
    });
    resizeObserver.observe(el);

    const rect = el.getBoundingClientRect();
    containerWidth.value = Math.round(rect.width);
    if (rect.height > 0) containerHeight.value = Math.round(rect.height);
  });

  onUnmounted(() => {
    resizeObserver?.disconnect();
    mutationObserver?.disconnect();
    if (mediaQuery && mqHandler) {
      mediaQuery.removeEventListener("change", mqHandler);
    }
  });

  return {
    containerRef,
    activeBones,
    resolvedColor,
    isDark,
    containerWidth,
    containerHeight,
  };
}
