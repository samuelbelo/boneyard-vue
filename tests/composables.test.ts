import { describe, it, expect } from "vite-plus/test";
import { adjustColor, sanitizeColor } from "../src/color.ts";

describe("adjustColor", () => {
  it("lightens hex color", () => {
    const result = adjustColor("#000000", 0.5);
    expect(result).toBe("#808080");
  });

  it("returns white when fully lightened", () => {
    const result = adjustColor("#000000", 1);
    expect(result).toBe("#ffffff");
  });

  it("handles already white color", () => {
    const result = adjustColor("#ffffff", 0.5);
    expect(result).toBe("#ffffff");
  });

  it("handles rgba color", () => {
    const result = adjustColor("rgba(0,0,0,0.5)", 0.5);
    expect(result).toMatch(/^rgba\(/);
    expect(result).toContain("0.75");
  });

  it("handles rgb color", () => {
    const result = adjustColor("rgba(128,128,128)", 0.5);
    expect(result).toMatch(/^rgba\(/);
  });

  it("returns safe default for unsupported format", () => {
    const result = adjustColor("hsl(0, 0%, 0%)", 0.5);
    expect(result).toBe("#e0e0e0");
  });

  it("handles mid-range hex colors", () => {
    const result = adjustColor("#e0e0e0", 0.3);
    const r = parseInt(result.slice(1, 3), 16);
    expect(r).toBeGreaterThan(0xe0);
  });

  it("returns safe default for invalid hex (not 6-digit)", () => {
    const result = adjustColor("#fff", 0.5);
    expect(result).toBe("#e0e0e0");
  });
});

describe("sanitizeColor", () => {
  it("accepts valid 6-digit hex", () => {
    expect(sanitizeColor("#ff0000")).toBe("#ff0000");
  });

  it("accepts valid rgba", () => {
    expect(sanitizeColor("rgba(0,0,0,0.5)")).toBe("rgba(0,0,0,0.5)");
  });

  it("accepts valid rgb", () => {
    expect(sanitizeColor("rgb(128, 128, 128)")).toBe("rgb(128, 128, 128)");
  });

  it("rejects CSS injection attempts", () => {
    expect(sanitizeColor("#e0e0e0}body{display:none}/*")).toBe("#e0e0e0");
  });

  it("rejects arbitrary strings", () => {
    expect(sanitizeColor("red")).toBe("#e0e0e0");
  });

  it("uses custom fallback", () => {
    expect(sanitizeColor("invalid", "#abcdef")).toBe("#abcdef");
  });
});
