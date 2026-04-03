# boneyard-vue

Pixel-perfect skeleton loading screens for Vue 3, extracted from your real DOM. No manual measurement, no hand-tuned placeholders.

> Vue 3 port of [boneyard-js](https://github.com/0xGF/boneyard) by [0xGF](https://github.com/0xGF). Core engine ported with permission under MIT license.

## How it works

1. Wrap your component with `<BoneyardSkeleton>` and give it a name
2. Run `npx boneyard-vue build` — it snapshots the DOM and generates bones
3. Import the registry once — every skeleton auto-resolves

```vue
<script setup>
import { BoneyardSkeleton } from "boneyard-vue/vue";

const { data, isLoading } = useFetch("/api/post");
</script>

<template>
  <BoneyardSkeleton name="blog-card" :loading="isLoading">
    <BlogCard v-if="data" :data="data" />
  </BoneyardSkeleton>
</template>
```

```bash
npx boneyard-vue build
```

```ts
// main.ts — add once
import "./bones/registry";
```

Done. Every `<BoneyardSkeleton name="...">` shows a pixel-perfect skeleton on load.

## Install

```bash
npm install boneyard-vue
```

## What it does

- Reads `getBoundingClientRect()` on every visible element in your component
- Stores positions as a flat array of `{ x, y, w, h, r }` bones
- Renders them as gray rectangles that match your real layout exactly
- Responsive — captures at multiple breakpoints (375px, 768px, 1280px by default)
- Pulse animation shimmers to a lighter shade of whatever color you set
- Auto-detects dark mode (media query + `.dark` class)

## Props

| Prop              | Type                              | Default                  | Description                         |
| ----------------- | --------------------------------- | ------------------------ | ----------------------------------- |
| `loading`         | boolean                           | required                 | Show skeleton or real content       |
| `name`            | string                            | —                        | Unique name for this skeleton       |
| `initial-bones`   | SkeletonResult \| ResponsiveBones | —                        | Pre-generated bones                 |
| `color`           | string                            | `rgba(0,0,0,0.08)`       | Bone fill color                     |
| `dark-color`      | string                            | `rgba(255,255,255,0.06)` | Bone color in dark mode             |
| `animate`         | boolean                           | `true`                   | Pulse animation                     |
| `snapshot-config` | SnapshotConfig                    | —                        | Control which elements are included |

## Slots

| Slot       | Description                                |
| ---------- | ------------------------------------------ |
| default    | Your component — rendered when not loading |
| `fallback` | Shown when loading and no bones available  |
| `fixture`  | Mock content for CLI build mode capture    |

## Usage patterns

### Direct import (tree-shakeable)

```vue
<script setup>
import { BoneyardSkeleton } from "boneyard-vue/vue";
</script>
```

### Plugin (global registration)

```ts
// main.ts
import { createApp } from "vue";
import { BoneyardPlugin } from "boneyard-vue/vue";
import "./bones/registry";

const app = createApp(App);
app.use(BoneyardPlugin);
app.mount("#app");
```

Then use `<BoneyardSkeleton>` anywhere without importing.

### Composable

```vue
<script setup>
import { useSkeleton } from "boneyard-vue/vue";

const { containerRef, activeBones, resolvedColor } = useSkeleton({
  name: "dashboard-chart",
});
</script>

<template>
  <div ref="containerRef">
    <!-- custom rendering with activeBones -->
  </div>
</template>
```

## CLI

```bash
npx boneyard-vue build                    # auto-detect dev server
npx boneyard-vue build http://localhost:5173
npx boneyard-vue build --breakpoints 390,820,1440 --out ./public/bones
```

### Options

| Flag                 | Default        | Description                     |
| -------------------- | -------------- | ------------------------------- |
| `--out <dir>`        | `./src/bones`  | Output directory                |
| `--breakpoints <bp>` | `375,768,1280` | Comma-separated viewport widths |
| `--wait <ms>`        | `800`          | Extra ms after page load        |

### Fixtures

Provide mock content so the CLI can capture bones even without real data:

```vue
<BoneyardSkeleton name="user-card" :loading="isLoading">
  <UserCard v-if="user" :user="user" />

  <template #fixture>
    <UserCard :user="{ name: 'Jane Doe', avatar: '/placeholder.png' }" />
  </template>
</BoneyardSkeleton>
```

## Credits

This project is a Vue 3 port of [boneyard-js](https://github.com/0xGF/boneyard) created by [0xGF](https://github.com/0xGF). The core skeleton extraction engine (DOM walking, layout computation, responsive breakpoints) is ported directly from the original project. The Vue component layer, composable, plugin system, and security hardening are new additions.

## License

MIT — see [LICENSE](./LICENSE)
