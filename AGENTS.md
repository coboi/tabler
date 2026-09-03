# AGENTS.md — Tabler (custom fork)

> **Custom fork of [Tabler](https://github.com/tabler/tabler), tailored to a specific use.** It intentionally diverges from upstream: unused code/themes/components are stripped to keep the runtime small, and bespoke tweaks live directly in `core/` + `shared/`. Not maintained as a distribution — no upstream sync, no support, no semver/changeset gate, no “keep for parity” with upstream. Hard-deletes are preferred over deprecation.

## Stack & structure

- `core/` = `@tabler/core` — SCSS + JS source of truth (`scss/tabler.scss`, `scss/_variables.scss`, `scss/_props.scss`, `scss/tabler-themes.scss`, `js/tabler.ts` + `tabler-theme.ts`). Outputs `core/dist/` (never hand-edit).
- `preview/` (Astro, :3000), `docs/` (Astro, :3010), `shared/` (Astro components + `shared/lib/*`, `shared/ui/*`, `shared/data/*`) — demo sites. `shared` is consumed by both via `shared/**` turbo inputs.
- `screenshots/` — Percy/visual only. `.build/` — executable build scripts (`build-css.ts`, `check-css-vars.ts`, `generate-tokens.ts`, `html-diff.ts`). `turbo.json` is task source of truth.
- `pnpm@11.17.0` via `corepack`, `node >=22.12` (see `.nvmrc: 24`). `pnpm` required, not `npm`/`yarn`.

## Commands (run from repo root)

- Install: `corepack enable && pnpm install` (`pnpm: command not found` → missing corepack)
- Build all: `pnpm run build` (= `turbo build` + zip). Core only: `pnpm --filter @tabler/core build`
- Dev servers: `pnpm run dev` → preview :3000 + docs :3010 (turbo `dev` persistent). Single package: `pnpm --filter @tabler/core dev`
- One-off verification (run after any `core/scss/**` edit):
  ```sh
  pnpm --filter @tabler/core build
  pnpm --filter @tabler/core lint:scss
  pnpm --filter @tabler/core test:scss   # 112 tests, vitest + sass-true
  pnpm run check-css-vars                # 833 vars, 0 fallbacks expected
  pnpm run generate-tokens:check         # if site.ts tokens changed, run pnpm run generate-tokens to regenerate
  ```
- Other checks: `pnpm run lint` (md + docs-links + prettier + vars + css-vars + tokens), `pnpm run type-check` (turbo), `pnpm run html-diff:baseline` / `html-diff` for output-neutral refactors.
- Prettier owns SCSS formatting — `stylelint` has stylistic rules disabled. Run `pnpm run lint:fix` / `pnpm run format-prettier`.

## Conventions to not guess

- **SCSS vars are the API.** Change `core/scss/_variables.scss` or `core/scss/_props.scss`; never patch `core/dist/` directly. `--tblr-*` prefix added in `.build/css-var-prefix.ts` build step, not in SCSS source (`postcss-prefix-custom-properties`).
- **Single-theme policy (this fork):** `primary: #000`, gray = `slate` only (`#f8fafc…#020617`), `radius 0.5` fixed, fonts `sans-serif` + `monospace` only, `semantic + social` colors only. Deleted `[data-bs-theme-*]` blocks in `core/scss/tabler-themes.scss` are intentional — do not re-add `extra-colors`, `gray`/`zinc`/`neutral`/`stone`, `serif`/`comic`, radius `0/1/1.5/2`, `pink` easter egg.
- **No ThemeSettings switchers** for deleted axes. Runtime cleanup for stale localStorage lives in `core/js/tabler-theme.ts` + `shared/layouts/BaseLayout.astro` — keep when deleting further themes.
- **Docs follow reality:** if a theme axis is hard-deleted, also update `docs/content/ui/getting-started/color-modes.mdx` and `shared/data/docs.json` / `shared/lib/site.ts` (`themeBases/themeFonts/themeRadiuses/themeColors`). `theme-base-colors.mdx` is deleted.
- **File ownership:** class references `→` frontmatter `classnames` on docs pages; Astro client scripts `→` `shared/ui/*.astro` + `shared/lib/*.ts` with matching `*.test.ts`; page chrome `→` `shared/layouts/*` + `shared/data/menu.json`.
- **Generated artifacts:** `dist/`, `tmp-assets/`, `preview/tmp-assets/`, `docs/tmp-assets/` are build outputs. Changes vanish on restart unless source in `core/`/`shared/` is updated.
