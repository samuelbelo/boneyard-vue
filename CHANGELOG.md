## [1.0.2](https://github.com/samuelbelo/boneyard-vue/compare/v1.0.1...v1.0.2) (2026-04-03)


### Bug Fixes

* harden rendering against untrusted bone data ([0947adc](https://github.com/samuelbelo/boneyard-vue/commit/0947adc8829c1a1872858c5c432ed79f98b47d93))

## [1.0.1](https://github.com/samuelbelo/boneyard-vue/compare/v1.0.0...v1.0.1) (2026-04-03)

### Bug Fixes

- align renderBones with upstream — use % for x/w units ([4177fda](https://github.com/samuelbelo/boneyard-vue/commit/4177fda87bcdb4a7a259b1bba610fe60c783201b))
- correct deploy-pages action SHA ([2f79eb6](https://github.com/samuelbelo/boneyard-vue/commit/2f79eb635c079f949dc3a5f69c087417ea24a9e3))
- pixel-perfect skeleton rendering — auto-snapshot DOM and fix circle bones ([99716cb](https://github.com/samuelbelo/boneyard-vue/commit/99716cbbaeb4afdd59ae8ca70f48253d7aad22b7))

# Changelog

## [Unreleased]

### Bug Fixes

- fix circle bones rendering as ovals when container width differs from capture width
- fix demo using hardcoded bones — now auto-snapshots real UI via `snapshotBones()` (matches original boneyard-js approach)

## 1.0.0 (2026-04-03)

### Bug Fixes

- use pnpm exec for CI so vite-plus resolves project deps ([484f0f1](https://github.com/samuelbelo/boneyard-vue/commit/484f0f147ed16f82ac357f6d0b1e6b09353d7b9b))

### Features

- initial release of boneyard-vue ([1f59862](https://github.com/samuelbelo/boneyard-vue/commit/1f59862d416dfd967e4f8fab4d322941308a0dde))
