/** Validate that a color string is safe for CSS interpolation */
function isSafeColor(color: string): boolean {
  return (
    /^#[\da-f]{6}$/i.test(color) ||
    /^rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*(?:,\s*[\d.]+)?\s*\)$/i.test(color)
  );
}

/** Mix a hex color toward white by `amount` (0–1). */
export function adjustColor(color: string, amount: number): string {
  const rgbaMatch = color.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/,
  );
  if (rgbaMatch) {
    const [, r, g, b, a = "1"] = rgbaMatch;
    const newAlpha = Math.min(1, parseFloat(a) + amount * 0.5);
    return `rgba(${r},${g},${b},${newAlpha.toFixed(3)})`;
  }
  if (color.startsWith("#") && /^#[\da-f]{6}$/i.test(color)) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const nr = Math.round(r + (255 - r) * amount);
    const ng = Math.round(g + (255 - g) * amount);
    const nb = Math.round(b + (255 - b) * amount);
    return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
  }
  return color;
}

/**
 * Sanitize a color string for safe CSS interpolation.
 * Returns the color if valid hex or rgba, otherwise returns a safe default.
 */
export function sanitizeColor(color: string, fallback: string = "#e0e0e0"): string {
  return isSafeColor(color) ? color : fallback;
}
