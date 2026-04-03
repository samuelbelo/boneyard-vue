import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: {
      index: "src/index.ts",
      vue: "src/vue.ts",
    },
    dts: {
      tsgo: true,
    },
    format: ["esm"],
    sourcemap: true,
    exports: true,
    deps: {
      neverBundle: ["vue", "@chenglou/pretext"],
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "happy-dom",
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
    ignorePatterns: ["demo/**"],
  },
  fmt: {},
});
