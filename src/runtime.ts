import type { SkeletonResult } from "./types.ts";
import { adjustColor, sanitizeColor } from "./color.ts";

/** Coerce a value to a finite number, returning fallback if invalid */
function safeNum(val: unknown, fallback: number): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

/** Validate border-radius string: single or multi-value (e.g. "8px 4px 8px 4px") */
const SAFE_RADIUS_RE = /^[\d.]+(px|%)?(\s+[\d.]+(px|%)?){0,3}$/;

/**
 * Render bones to an HTML string.
 * Use for SSR, innerHTML, or any HTML-based rendering.
 */
export function renderBones(skel: SkeletonResult, color?: string, animate?: boolean): string {
  const c = sanitizeColor(color ?? "#e0e0e0");
  const shouldAnimate = animate !== false;
  const lighter = adjustColor(c, 0.3);

  const keyframes = shouldAnimate
    ? `<style>.boneyard-bone{animation:boneyard-pulse 1.8s ease-in-out infinite}@keyframes boneyard-pulse{0%,100%{background-color:${c}}50%{background-color:${lighter}}}</style>`
    : "";

  const height = safeNum(skel.height, 0);
  let html = `${keyframes}<div class="boneyard" style="position:relative;width:100%;height:${height}px">`;

  for (const b of skel.bones) {
    const isCircle = b.r === "50%";
    const radius =
      typeof b.r === "string" ? (SAFE_RADIUS_RE.test(b.r) ? b.r : "8px") : `${safeNum(b.r, 8)}px`;
    const x = safeNum(b.x, 0);
    const y = safeNum(b.y, 0);
    const h = safeNum(b.h, 0);
    const w = isCircle ? `${h}px` : `${safeNum(b.w, 0)}%`;
    html += `<div class="boneyard-bone" style="position:absolute;left:${x}%;top:${y}px;width:${w};height:${h}px;border-radius:${radius};background-color:${c}"></div>`;
  }

  html += "</div>";
  return html;
}
