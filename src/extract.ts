import type { SkeletonDescriptor, Bone, SkeletonResult, SnapshotConfig } from "./types.ts";

const DEFAULT_LEAF_TAGS = new Set(["p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "tr"]);

/**
 * Snapshot the exact visual layout of a rendered DOM element as skeleton bones.
 * Walks the DOM, finds every visible leaf element, and captures its exact
 * bounding rect relative to the root.
 */
export function snapshotBones(
  el: Element,
  name: string = "component",
  config?: SnapshotConfig,
): SkeletonResult {
  const rootRect = el.getBoundingClientRect();
  const bones: Bone[] = [];

  const leafTags = config?.leafTags
    ? new Set([...DEFAULT_LEAF_TAGS, ...config.leafTags])
    : DEFAULT_LEAF_TAGS;
  const captureRoundedBorders = config?.captureRoundedBorders ?? true;
  const excludeTags = config?.excludeTags ? new Set(config.excludeTags) : null;
  const excludeSelectors = config?.excludeSelectors ?? null;

  function walk(node: Element): void {
    const style = getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return;

    const tag = node.tagName.toLowerCase();

    if (excludeTags?.has(tag)) return;
    if (excludeSelectors?.some((sel) => node.matches(sel))) return;

    const children = [...node.children].filter((child) => {
      const cs = getComputedStyle(child);
      return cs.display !== "none" && cs.visibility !== "hidden" && cs.opacity !== "0";
    });

    const isMedia = tag === "img" || tag === "svg" || tag === "video" || tag === "canvas";
    const isFormEl = tag === "input" || tag === "button" || tag === "textarea" || tag === "select";
    const isLeaf = children.length === 0 || isMedia || isFormEl || leafTags.has(tag);

    const bg = style.backgroundColor;
    const hasBg = bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent";
    const hasBgImage = style.backgroundImage !== "none";
    const borderTopWidth = parseFloat(style.borderTopWidth) || 0;
    const hasBorder =
      captureRoundedBorders &&
      borderTopWidth > 0 &&
      style.borderTopColor !== "rgba(0, 0, 0, 0)" &&
      style.borderTopColor !== "transparent";
    const hasBorderRadius = (parseFloat(style.borderTopLeftRadius) || 0) > 0;
    const hasVisualSurface = hasBg || hasBgImage || (hasBorder && hasBorderRadius);

    const isTableNode =
      tag === "tr" ||
      tag === "td" ||
      tag === "th" ||
      tag === "thead" ||
      tag === "tbody" ||
      tag === "table";

    if (isLeaf) {
      const rect = node.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      const isSquarish =
        isMedia && rect.width > 0 && rect.height > 0 && Math.abs(rect.width - rect.height) < 4;
      const br = isTableNode ? 0 : isSquarish ? "50%" : (parseBorderRadius(style, node) ?? 8);
      const rw = rootRect.width;
      bones.push({
        x: rw > 0 ? +(((rect.left - rootRect.left) / rw) * 100).toFixed(4) : 0,
        y: Math.round(rect.top - rootRect.top),
        w: rw > 0 ? +((rect.width / rw) * 100).toFixed(4) : 0,
        h: Math.round(rect.height),
        r: br,
      });
      return;
    }

    if (hasVisualSurface) {
      const rect = node.getBoundingClientRect();
      if (rect.width >= 1 && rect.height >= 1) {
        const br = isTableNode ? 0 : (parseBorderRadius(style, node) ?? 8);
        const rw = rootRect.width;
        bones.push({
          x: rw > 0 ? +(((rect.left - rootRect.left) / rw) * 100).toFixed(4) : 0,
          y: Math.round(rect.top - rootRect.top),
          w: rw > 0 ? +((rect.width / rw) * 100).toFixed(4) : 0,
          h: Math.round(rect.height),
          r: br,
          c: true,
        });
      }
    }

    for (const child of children) {
      walk(child);
    }
  }

  for (const child of el.children) {
    walk(child);
  }

  return {
    name,
    viewportWidth: Math.round(rootRect.width),
    width: Math.round(rootRect.width),
    height: Math.round(rootRect.height),
    bones,
  };
}

/**
 * Extract a SkeletonDescriptor from a rendered DOM element.
 */
export function fromElement(el: Element): SkeletonDescriptor {
  return extractNode(el);
}

function extractNode(el: Element): SkeletonDescriptor {
  const style = getComputedStyle(el);
  const desc: SkeletonDescriptor = {};

  if (style.display === "grid" || style.display === "inline-grid") {
    return snapshotAsLeaf(el, style, desc);
  }
  if (style.position === "absolute" || style.position === "fixed") {
    return snapshotAsLeaf(el, style, desc);
  }

  if (style.display === "flex" || style.display === "inline-flex") {
    desc.display = "flex";
    desc.flexDirection =
      style.flexDirection === "column" || style.flexDirection === "column-reverse"
        ? "column"
        : "row";
    if (style.alignItems && style.alignItems !== "normal" && style.alignItems !== "stretch")
      desc.alignItems = style.alignItems;
    if (
      style.justifyContent &&
      style.justifyContent !== "normal" &&
      style.justifyContent !== "flex-start"
    )
      desc.justifyContent = style.justifyContent;
    const rowGap = parseFloat(style.rowGap);
    const colGap = parseFloat(style.columnGap);
    if (rowGap > 0 && colGap > 0 && rowGap === colGap) {
      desc.gap = rowGap;
    } else {
      if (rowGap > 0) desc.rowGap = rowGap;
      if (colGap > 0) desc.columnGap = colGap;
    }
  }

  const pad = extractSides(style, "padding");
  if (pad) desc.padding = pad;
  const mar = extractSides(style, "margin");
  if (mar) desc.margin = mar;

  const elTag = el.tagName.toLowerCase();
  const isTableEl =
    elTag === "tr" ||
    elTag === "td" ||
    elTag === "th" ||
    elTag === "thead" ||
    elTag === "tbody" ||
    elTag === "table";
  if (!isTableEl) {
    const br = parseBorderRadius(style, el);
    if (br !== undefined) desc.borderRadius = br;
  }

  const maxW = parseFloat(style.maxWidth);
  if (maxW > 0 && isFinite(maxW)) desc.maxWidth = maxW;

  const rect = el.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  const parentW = el.parentElement ? el.parentElement.getBoundingClientRect().width : w;

  if (isLeafElement(el, style)) {
    return extractLeaf(el, style, desc, w, h, parentW);
  }

  if (isFixedSize(el, style, w, parentW) && w > 0) {
    desc.width = Math.round(w);
  }

  const children: SkeletonDescriptor[] = [];
  for (const child of el.children) {
    const childStyle = getComputedStyle(child);
    if (
      childStyle.display === "none" ||
      childStyle.visibility === "hidden" ||
      childStyle.opacity === "0"
    )
      continue;
    children.push(extractNode(child));
  }

  if (children.length > 0) desc.children = children;
  return desc;
}

function isFixedSize(el: Element, style: CSSStyleDeclaration, w: number, parentW: number): boolean {
  if (parseFloat(style.flexGrow) > 0) return false;
  if (style.flexShrink === "0") return true;
  const parent = el.parentElement;
  if (parent) {
    const parentStyle = getComputedStyle(parent);
    const parentIsFlex = parentStyle.display === "flex" || parentStyle.display === "inline-flex";
    const parentIsRow =
      parentIsFlex &&
      (parentStyle.flexDirection === "row" || parentStyle.flexDirection === "row-reverse");
    if (parentIsRow) {
      return false;
    }
  }
  if (w > 0 && parentW > 0 && w < parentW * 0.8) return true;
  return false;
}

function isLeafElement(el: Element, style: CSSStyleDeclaration): boolean {
  const tag = el.tagName.toLowerCase();
  if (tag === "img" || tag === "video" || tag === "canvas" || tag === "svg") return true;
  if (tag === "input" || tag === "button" || tag === "textarea" || tag === "select") return true;
  if (el.children.length === 0) return true;
  if (style.backgroundImage && style.backgroundImage !== "none" && !el.querySelector("*:not(br)"))
    return true;
  return false;
}

function extractLeaf(
  el: Element,
  style: CSSStyleDeclaration,
  desc: SkeletonDescriptor,
  w: number,
  h: number,
  parentW: number,
): SkeletonDescriptor {
  const tag = el.tagName.toLowerCase();

  if (tag === "img" || tag === "video" || tag === "canvas") {
    return applyDimensions(el, style, desc, w, h, parentW);
  }

  if (tag === "svg") {
    if (!desc.width && w > 0) desc.width = Math.round(w);
    desc.height = Math.round(h > 0 ? h : 24);
    return desc;
  }

  if (style.backgroundImage && style.backgroundImage !== "none" && el.children.length === 0) {
    return applyDimensions(el, style, desc, w, h, parentW);
  }

  if (tag === "button" || tag === "input" || tag === "textarea" || tag === "select") {
    desc.leaf = true;
    desc.height = Math.round(h > 0 ? h : 40);
    return desc;
  }

  const text = el.textContent?.trim();
  if (text) {
    desc.text = text;
    desc.font = buildFontString(style);
    const lh = parseFloat(style.lineHeight);
    if (lh > 0 && isFinite(lh)) desc.lineHeight = Math.round(lh * 100) / 100;
    return desc;
  }

  if (isFixedSize(el, style, w, parentW) && w > 0) {
    desc.width = Math.round(w);
  }
  desc.height = Math.round(h > 0 ? h : 20);
  return desc;
}

function applyDimensions(
  el: Element,
  style: CSSStyleDeclaration,
  desc: SkeletonDescriptor,
  w: number,
  h: number,
  parentW: number,
): SkeletonDescriptor {
  const ar = style.aspectRatio;
  if (ar && ar !== "auto") {
    const parsed = parseAspectRatio(ar);
    if (parsed) {
      desc.aspectRatio = parsed;
      return desc;
    }
  }

  if (desc.width || isFixedSize(el, style, w, parentW)) {
    if (!desc.width && w > 0) desc.width = Math.round(w);
    desc.height = Math.round(h > 0 ? h : w);
    return desc;
  }

  if (w > 0 && h > 0) {
    desc.aspectRatio = Math.round((w / h) * 1000) / 1000;
  } else {
    desc.height = Math.round(h > 0 ? h : 150);
  }
  return desc;
}

function buildFontString(style: CSSStyleDeclaration): string {
  const weight = style.fontWeight;
  const size = style.fontSize;
  const family = style.fontFamily
    .split(",")[0]
    .trim()
    .replace(/^["']|["']$/g, "");
  return `${weight} ${size} ${family}`;
}

function extractSides(
  style: CSSStyleDeclaration,
  prop: "padding" | "margin",
): number | { top?: number; right?: number; bottom?: number; left?: number } | undefined {
  const top = parseFloat(style.getPropertyValue(`${prop}-top`)) || 0;
  const right = parseFloat(style.getPropertyValue(`${prop}-right`)) || 0;
  const bottom = parseFloat(style.getPropertyValue(`${prop}-bottom`)) || 0;
  const left = parseFloat(style.getPropertyValue(`${prop}-left`)) || 0;

  if (top === 0 && right === 0 && bottom === 0 && left === 0) return undefined;
  if (top === right && right === bottom && bottom === left) return top;

  const sides: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  } = {};
  if (top) sides.top = top;
  if (right) sides.right = right;
  if (bottom) sides.bottom = bottom;
  if (left) sides.left = left;
  return sides;
}

function parseBorderRadius(style: CSSStyleDeclaration, el?: Element): number | string | undefined {
  const tl = parseFloat(style.borderTopLeftRadius) || 0;
  const tr = parseFloat(style.borderTopRightRadius) || 0;
  const br = parseFloat(style.borderBottomRightRadius) || 0;
  const bl = parseFloat(style.borderBottomLeftRadius) || 0;

  if (tl === 0 && tr === 0 && br === 0 && bl === 0) return undefined;

  const isSquarish = el
    ? (() => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && Math.abs(rect.width - rect.height) < 4;
      })()
    : false;

  const raw = style.borderRadius;
  if (raw === "50%") return "50%";

  const maxCorner = Math.max(tl, tr, br, bl);
  if (maxCorner > 9998) {
    return isSquarish ? "50%" : 9999;
  }

  if (tl === tr && tr === br && br === bl) {
    return tl !== 8 ? tl : undefined;
  }

  return `${tl}px ${tr}px ${br}px ${bl}px`;
}

function snapshotAsLeaf(
  el: Element,
  style: CSSStyleDeclaration,
  desc: SkeletonDescriptor,
): SkeletonDescriptor {
  const rect = el.getBoundingClientRect();

  desc.width = Math.round(rect.width);
  desc.height = Math.round(rect.height);

  const leafTag = el.tagName.toLowerCase();
  const isTableLeaf =
    leafTag === "tr" ||
    leafTag === "td" ||
    leafTag === "th" ||
    leafTag === "thead" ||
    leafTag === "tbody" ||
    leafTag === "table";
  if (!isTableLeaf) {
    const br = parseBorderRadius(style, el);
    if (br !== undefined) desc.borderRadius = br;
  }

  const children: SkeletonDescriptor[] = [];
  for (const child of el.children) {
    const childStyle = getComputedStyle(child);
    if (
      childStyle.display === "none" ||
      childStyle.visibility === "hidden" ||
      childStyle.opacity === "0"
    )
      continue;
    children.push(extractNode(child));
  }
  if (children.length > 0) {
    desc.display = "flex";
    desc.flexDirection = "column";
    desc.children = children;
  }

  return desc;
}

function parseAspectRatio(ar: string): number | undefined {
  const parts = ar.split("/");
  if (parts.length === 2) {
    const num = parseFloat(parts[0]);
    const den = parseFloat(parts[1]);
    if (num > 0 && den > 0) return Math.round((num / den) * 1000) / 1000;
  }
  const val = parseFloat(ar);
  if (val > 0 && isFinite(val)) return val;
  return undefined;
}
