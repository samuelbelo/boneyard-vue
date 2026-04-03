import { defineComponent, h, computed, type PropType, type Plugin } from "vue";
import { snapshotBones } from "./extract.ts";
import { useSkeleton } from "./composables/useSkeleton.ts";
import { adjustColor, sanitizeColor } from "./color.ts";
import type { Bone, SkeletonResult, ResponsiveBones, SnapshotConfig } from "./types.ts";

// ── Bones registry ──────────────────────────────────────────────────

const bonesRegistry = new Map<string, SkeletonResult | ResponsiveBones>();

/**
 * Register pre-generated bones so `<BoneyardSkeleton name="...">` can auto-resolve them.
 *
 * Called by the generated `registry.ts` file (created by `npx boneyard-vue build`).
 * Import it once in your app entry point:
 *
 * ```ts
 * import './bones/registry'
 * ```
 */
export function registerBones(map: Record<string, SkeletonResult | ResponsiveBones>): void {
  for (const [name, bones] of Object.entries(map)) {
    bonesRegistry.set(name, bones);
  }
}

/** Look up registered bones by name */
export function getRegisteredBones(name: string): SkeletonResult | ResponsiveBones | undefined {
  return bonesRegistry.get(name);
}

/** Clear all registered bones. Useful for testing. */
export function clearRegistry(): void {
  bonesRegistry.clear();
}

// ── Expose snapshotBones for CLI build mode ─────────────────────────

if (
  typeof window !== "undefined" &&
  (window as unknown as Record<string, unknown>).__BONEYARD_BUILD
) {
  (window as unknown as Record<string, unknown>).__BONEYARD_SNAPSHOT = snapshotBones;
}

// ── BoneyardSkeleton component ──────────────────────────────────────

export const BoneyardSkeleton = defineComponent({
  name: "BoneyardSkeleton",

  props: {
    loading: {
      type: Boolean,
      required: true,
    },
    name: {
      type: String,
      default: undefined,
    },
    initialBones: {
      type: Object as PropType<SkeletonResult | ResponsiveBones>,
      default: undefined,
    },
    color: {
      type: String,
      default: undefined,
    },
    darkColor: {
      type: String,
      default: undefined,
    },
    animate: {
      type: Boolean,
      default: true,
    },
    snapshotConfig: {
      type: Object as PropType<SnapshotConfig>,
      default: undefined,
    },
  },

  setup(props, { slots }) {
    const isBuildMode =
      typeof window !== "undefined" &&
      (window as unknown as Record<string, unknown>).__BONEYARD_BUILD === true;

    // Pass reactive getters so useSkeleton tracks prop changes
    const { containerRef, activeBones, resolvedColor, isDark, containerHeight } = useSkeleton({
      name: () => props.name,
      initialBones: () => props.initialBones,
      color: () => props.color,
      darkColor: () => props.darkColor,
      animate: () => props.animate,
    });

    const scaleY = computed(() => {
      const effective =
        containerHeight.value > 0 ? containerHeight.value : (activeBones.value?.height ?? 0);
      const captured = activeBones.value?.height ?? 0;
      return effective > 0 && captured > 0 ? effective / captured : 1;
    });

    const showSkeleton = computed(() => props.loading && activeBones.value !== null);
    const showFallback = computed(() => props.loading && activeBones.value === null);

    return () => {
      const dataAttrs: Record<string, string> = {};
      if (props.name) {
        dataAttrs["data-boneyard"] = props.name;
        if (props.snapshotConfig) {
          dataAttrs["data-boneyard-config"] = JSON.stringify(props.snapshotConfig);
        }
      }

      // Build mode: render fixture or default slot for CLI capture
      if (isBuildMode) {
        return h(
          "div",
          {
            ref: containerRef,
            style: { position: "relative" },
            ...dataAttrs,
          },
          [h("div", null, [slots.fixture ? slots.fixture() : slots.default?.()])],
        );
      }

      const contentStyle = showSkeleton.value ? { visibility: "hidden" as const } : undefined;

      const contentSlot = showFallback.value ? slots.fallback?.() : slots.default?.();

      const children = [h("div", { style: contentStyle }, [contentSlot])];

      // Skeleton overlay
      if (showSkeleton.value && activeBones.value) {
        const bones = activeBones.value.bones;
        const color = sanitizeColor(resolvedColor.value);
        const dark = isDark.value;
        const sy = scaleY.value;

        const boneElements = bones.map((b: Bone) =>
          h("div", {
            key: `${b.x}-${b.y}-${b.w}-${b.h}`,
            style: {
              position: "absolute",
              left: `${b.x}%`,
              top: `${b.y * sy}px`,
              width: `${b.w}%`,
              height: `${b.h * sy}px`,
              borderRadius: typeof b.r === "string" ? b.r : `${b.r}px`,
              backgroundColor: b.c ? adjustColor(color, dark ? 0.03 : 0.45) : color,
              animation: props.animate ? "boneyard-pulse 1.8s ease-in-out infinite" : undefined,
            },
          }),
        );

        const animationStyle = props.animate
          ? h("style", null, [
              `@keyframes boneyard-pulse{0%,100%{background-color:${color}}50%{background-color:${adjustColor(color, dark ? 0.04 : 0.3)}}}`,
            ])
          : null;

        children.push(
          h(
            "div",
            {
              style: {
                position: "absolute",
                inset: "0",
                overflow: "hidden",
              },
            },
            [
              h(
                "div",
                {
                  style: {
                    position: "relative",
                    width: "100%",
                    height: "100%",
                  },
                },
                [...boneElements, animationStyle],
              ),
            ],
          ),
        );
      }

      return h(
        "div",
        {
          ref: containerRef,
          style: { position: "relative" },
          ...dataAttrs,
        },
        children,
      );
    };
  },
});

// ── Vue Plugin ──────────────────────────────────────────────────────

export const BoneyardPlugin: Plugin = {
  install(app) {
    app.component("BoneyardSkeleton", BoneyardSkeleton);
  },
};

// ── Re-exports for convenience ──────────────────────────────────────

export { useSkeleton } from "./composables/useSkeleton.ts";
export { adjustColor, sanitizeColor } from "./color.ts";
export type { UseSkeletonOptions, UseSkeletonReturn } from "./composables/useSkeleton.ts";
export type { Bone, SkeletonResult, ResponsiveBones, SnapshotConfig } from "./types.ts";
