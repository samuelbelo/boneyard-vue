# Contributing to boneyard-vue

## Prerequisites

- [Vite+](https://viteplus.dev) CLI installed (`vp`)
- Node.js (managed via `vp env use`)

## Setup

```bash
git clone https://github.com/samuelbelo/boneyard-vue.git
cd boneyard-vue
vp install
```

## Development workflow

```bash
vp dev          # watch mode — rebuilds on change
vp test watch   # tests in watch mode
vp check        # lint + format + type-check
vp check --fix  # auto-fix lint/format issues
vp pack         # build library locally
```

## Commit conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/) — semantic-release depends on this for automated versioning.

| Prefix                         | Effect                         |
| ------------------------------ | ------------------------------ |
| `feat:`                        | minor release (1.0.0 -> 1.1.0) |
| `fix:`                         | patch release (1.0.0 -> 1.0.1) |
| `feat!:` or `BREAKING CHANGE:` | major release (1.0.0 -> 2.0.0) |
| `docs:`                        | no release                     |
| `chore:`                       | no release                     |
| `test:`                        | no release                     |
| `ci:`                          | no release                     |

### Examples

```bash
git commit -m "feat: add SSR support for skeleton rendering"
git commit -m "fix: correct breakpoint resolution for mobile"
git commit -m "docs: update CLI usage examples"
git commit -m "feat!: change plugin API to use provide/inject"
```

## Pull request process

1. Fork the repo and create a branch from `main`
2. Write or update tests for your change
3. Ensure all checks pass:
   ```bash
   vp check && vp test run
   ```
4. Commit with a conventional commit message
5. Open a PR against `main`

## Code style

Code style is enforced by `vp check` (Oxlint + Oxfmt). No manual configuration needed — Vite+ handles it. Run `vp check --fix` to auto-fix formatting and lint issues before committing.

## Project structure

```
src/
  types.ts              # Core type definitions
  extract.ts            # DOM snapshot extraction
  layout.ts             # Layout engine (pretext-based)
  runtime.ts            # HTML string renderer
  responsive.ts         # Multi-breakpoint extraction
  index.ts              # Core re-exports
  vue.ts                # Vue component, registry, plugin
  composables/
    useSkeleton.ts      # Composable for programmatic use
bin/
  cli.js                # Playwright-based CLI
tests/
  index.test.ts         # Runtime tests
  layout.test.ts        # Layout engine tests
  vue.test.ts           # Component + plugin tests
  composables.test.ts   # Composable tests
```

## Testing

Tests run via Vitest through Vite+:

```bash
vp test              # single run
vp test watch        # watch mode
vp test run --coverage  # with coverage
```

Component tests use `@vue/test-utils` with `happy-dom` as the test environment.

## Releasing

Releases are automated. When a PR is merged to `main`:

1. CI runs `vp check` + `vp test run` + `vp pack`
2. `semantic-release` analyzes commit messages
3. If warranted, it bumps the version, publishes to npm, and creates a GitHub release

You don't need to manually bump versions or publish.
