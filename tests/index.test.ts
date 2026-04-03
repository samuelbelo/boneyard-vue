import { describe, it, expect } from "vite-plus/test";
import { renderBones } from "../src/runtime.ts";
import type { SkeletonResult } from "../src/types.ts";

// ── renderBones ──

describe("renderBones", () => {
  it("renders empty skeleton", () => {
    const skel: SkeletonResult = {
      name: "test",
      viewportWidth: 100,
      width: 100,
      height: 50,
      bones: [],
    };
    const html = renderBones(skel);
    expect(html).toContain("height:50px");
    expect(html).not.toContain("left:");
  });

  it("renders bones with correct positions", () => {
    const skel: SkeletonResult = {
      name: "test",
      viewportWidth: 400,
      width: 400,
      height: 200,
      bones: [
        { x: 0, y: 0, w: 400, h: 180, r: 10 },
        { x: 0, y: 190, w: 200, h: 14, r: 4 },
      ],
    };
    const html = renderBones(skel);
    expect(html).toContain("left:0%;top:0px;width:400%;height:180px");
    expect(html).toContain("left:0%;top:190px;width:200%;height:14px");
  });

  it("handles circle radius", () => {
    const skel: SkeletonResult = {
      name: "avatar",
      viewportWidth: 40,
      width: 40,
      height: 40,
      bones: [{ x: 0, y: 0, w: 40, h: 40, r: "50%" }],
    };
    expect(renderBones(skel)).toContain("border-radius:50%");
  });

  it("includes pulse animation by default", () => {
    const skel: SkeletonResult = {
      name: "x",
      viewportWidth: 100,
      width: 100,
      height: 100,
      bones: [{ x: 0, y: 0, w: 100, h: 100, r: 4 }],
    };
    const html = renderBones(skel);
    expect(html).toContain("boneyard-pulse");
  });

  it("no animation when disabled", () => {
    const skel: SkeletonResult = {
      name: "x",
      viewportWidth: 100,
      width: 100,
      height: 100,
      bones: [{ x: 0, y: 0, w: 100, h: 100, r: 4 }],
    };
    const html = renderBones(skel, "#e0e0e0", false);
    expect(html).not.toContain("animation");
  });

  it("respects custom color", () => {
    const skel: SkeletonResult = {
      name: "x",
      viewportWidth: 50,
      width: 50,
      height: 50,
      bones: [{ x: 0, y: 0, w: 50, h: 50, r: 0 }],
    };
    expect(renderBones(skel, "#ff0000", false)).toContain("#ff0000");
  });

  it("handles many bones", () => {
    const bones = Array.from({ length: 50 }, (_, i) => ({
      x: 0,
      y: i * 20,
      w: 300,
      h: 14,
      r: 4,
    }));
    const skel: SkeletonResult = {
      name: "list",
      viewportWidth: 300,
      width: 300,
      height: 1000,
      bones,
    };
    const matches = renderBones(skel).match(/class="boneyard-bone" style=/g);
    expect(matches).toHaveLength(50);
  });
});
