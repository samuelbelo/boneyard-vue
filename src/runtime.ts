import type { SkeletonResult } from "./types.ts";
import { adjustColor, sanitizeColor } from "./color.ts";

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

  let html = `${keyframes}<div class="boneyard" style="position:relative;width:100%;height:${skel.height}px">`;

  for (const b of skel.bones) {
    const isCircle = b.r === "50%";
    const radius =
      typeof b.r === "string"
        ? /^[\d.]+(%|px)?$/.test(b.r)
          ? b.r
          : "8px"
        : `${Number.isFinite(b.r) ? b.r : 8}px`;
    const width = isCircle ? `${b.h}px` : `${b.w}%`;
    html += `<div class="boneyard-bone" style="position:absolute;left:${b.x}%;top:${b.y}px;width:${width};height:${b.h}px;border-radius:${radius};background-color:${c}"></div>`;
  }

  html += "</div>";
  return html;
}
