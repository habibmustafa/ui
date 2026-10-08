# Publish and deploy guide

This document explains the whole process for **releasing `@habibmustafa/ui` to npm** and
**deploying the playground site** (`ui.habibmustafa.me`) **on Cloudflare**.
Goal: to be able to come back a few months later and remember everything from scratch.

This file is in the `docs/` folder — it does not go into the npm package (see the `files`
list in `package.json`), i.e. it stays only in the GitHub repo; consumers don't see it.

---

## 1. There are two separate "deploys", don't mix them up

| | What | Where | How it is triggered |
|---|---|---|---|
| **npm publish** | The `@habibmustafa/ui` library itself | npmjs.com | When the "Version Packages" PR is merged into `main` (Changesets) |
| **Playground deploy** | Demo site (showing all components) | Cloudflare Workers, `ui.habibmustafa.me` | Automatically on every push to `main` |

The two are completely separate systems, triggered separately, depending on separate files.

---

## 2. Releasing a new version to npm (Changesets)

Version, CHANGELOG, tag and GitHub Release are no longer done by hand —
[Changesets](https://github.com/changesets/changesets) does it. The idea is: each PR records its
change as a `.changeset/*.md` file, these files accumulate, and then a single
"Version Packages" PR turns them all into one version.

### Things set up once

- **Trusted Publishing (OIDC)** — there is NO `NPM_TOKEN` secret, and none is needed.
  On npmjs.com, in the package's **Settings → Trusted Publisher** section, a GitHub
  provider has been added: repo `habibmustafa/ui`, workflow file
  `.github/workflows/publish.yml`. GitHub Actions proves its identity via OIDC on every run,
  and npm matches it against that record.
  - **The workflow file name must stay `publish.yml`** — npm checks exactly this name.
  - If this ever needs to be set up AGAIN (e.g. if the repo name changes): npmjs.com →
    `npmjs.com/package/@habibmustafa/ui` → Settings → Trusted Publisher →
    GitHub → Repository: `habibmustafa/ui`, Workflow filename: `publish.yml`.
  - `publish.yml` must keep `permissions.id-token: write` and the `npm install -g npm@latest`
    step (OIDC requires npm CLI ≥11.5.1).
- **GitHub repo setting (once, by hand):** Settings → Actions → General →
  **"Allow GitHub Actions to create and approve pull requests"** must be enabled,
  otherwise the workflow cannot open the "Version Packages" PR.
- **`.changeset/config.json`** — `access: "public"`, `baseBranch: "main"`.
- **`.github/workflows/publish.yml`** — on every push to `main`, `changesets/action` runs:
  - If there are pending files in `.changeset/` → opens/updates the "Version Packages" PR
    (`npm run version-packages`: `package.json` version, `CHANGELOG.md`,
    `package-lock.json`, consumed changeset files are deleted).
  - If there are no pending files and the version in `package.json` is not yet on npm (i.e.
    that PR was just merged) → `npm run release`: the same checks as `npm run verify`, minus `check:tokens`, +
    `changeset publish` (`npm publish --provenance`), then the `vX.Y.Z` tag and GitHub
    Release are created.

### On every change (in the PR)

If you are making a change that library users will see (fix, new component, breaking
change), add a changeset to the same PR:

```sh
npx changeset      # pick the package, pick the bump type, write a short description
```

This creates `.changeset/<random-name>.md` — commit it too. You can also write it by hand:

```md
---
"@habibmustafa/ui": minor
---

Added the `Pagination` component.
```

**Bump type (during the 0.x stage):** breaking change and new component/feature → `minor`,
bug fix → `patch`. Don't pick `major` — it takes the package to 1.0.0.

No changeset is needed for playground-only, docs, test or CI changes.

### Releasing a version

1. PRs with changesets are merged into `main`.
2. The workflow automatically opens a **"Version Packages"** PR (and updates it on subsequent
   merges). Check the new version and the CHANGELOG in the PR.
3. When ready, **merge** that PR — the workflow publishes to npm and creates the tag and GitHub
   Release. Do nothing else: don't change the version by hand, don't create the Release by hand.
4. **Verify**: `github.com/habibmustafa/ui/actions` → "Publish" green ✓,
   `npmjs.com/package/@habibmustafa/ui` should show the new version.

### If publish fails

The version commit is already on `main` but not on npm — re-running the workflow
is enough (Actions → Publish → **Re-run jobs**): `changeset publish` publishes only
the version that is not on npm, so a second attempt is safe. If the cause was in the code,
push the fix to `main` — that push's run will publish in the same way.

## 3. Deploying the playground on Cloudflare

### How it works (set up once)

On Cloudflare, **Workers & Pages → the `ui` project** is connected to the GitHub repo
("Workers Builds" / Git integration). **Every push to `main` automatically triggers a new
deploy** — no extra step is needed.

The configuration is **not in the dashboard**; it is in the `wrangler.toml` file in the repo:

```toml
name = "ui"
compatibility_date = "2026-10-05"

[build]
command = "npm run build:playground"

[assets]
directory = "./playground-dist"
not_found_handling = "404-page"
```

- `[build].command` — Cloudflare runs this itself and creates the `playground-dist/`
  folder. The script builds the client, then the server entry
  (`playground/entry-server.tsx` → `playground-ssr/`), then `scripts/prerender.mjs`
  writes a prerendered HTML file for every route: `/` → `index.html`,
  `/components/button` → `components/button.html`, and so on. The browser paints that
  HTML before any JavaScript loads and `playground/main.tsx` hydrates it. The file names
  rely on the default `html_handling` (`auto-trailing-slash`), which serves
  `components/button.html` for `/components/button`. A route that is not in
  `ROUTES` (entry-server.tsx) is not prerendered and falls through to `404.html`.
- `[assets].directory` — which folder to upload.
- `not_found_handling = "404-page"` — so that the SPA's client-side router (e.g. `/components/dialog`)
  works on hard refresh. **DO NOT WRITE `"single-page-application"`** —
  for this specific project, Cloudflare's internal `_redirects` validator rejects it as an "infinite
  loop" (see §5, "Known issues"). `"404-page"` + `404.html` (the unrendered app
  shell, written by `scripts/prerender.mjs`) is the replacement for it.
- `public/_headers` — content-hashed `/assets/*` and the versioned `/fonts/*` are cached
  for a year (`immutable`); HTML keeps Cloudflare's default (revalidated on every
  visit), so a deploy shows up immediately.

**Domain**: `ui.habibmustafa.me` → added in the **Custom domains** section of the Cloudflare Pages/Workers project.
The domain is already on Cloudflare's own
nameservers, so DNS/SSL is set up automatically; don't do anything by hand.

### What to do for a new deploy

**Nothing.** Push to `main`, and Cloudflare picks it up itself. To check the status:
`dash.cloudflare.com` → Workers & Pages → `ui` → **Deployments** tab.

If you want to deploy manually from a local machine (rare case):
```sh
npx wrangler deploy          # real deploy
npx wrangler deploy --dry-run  # check only, does not deploy
```
(You first need to authenticate to the Cloudflare account with `wrangler login`.)

---

## 4. GitHub Actions — what runs when

| File | Trigger | What it does |
|---|---|---|
| `.github/workflows/ci.yml` | every `push` (main) and every PR | `build:lib`, `lint`, `check:classes`, `check:api`, `test`, `build:playground` — all must pass. `check:api` verifies that the playground's API tables (`playground/generated/api.ts`) are in sync with the types; when you change a component's props, run `npm run api:generate` and commit the result. `check:tokens` is a separate job; because it depends on the network, it does not block the PR even if it fails (`continue-on-error: true`). |
| `.github/workflows/publish.yml` | every `push` (main) | Changesets: if there is a pending changeset, opens/updates the "Version Packages" PR; if not, and the version is not on npm, `npm run release` (the `verify` checks without `check:tokens`, which compares against an external site and so can't gate a release) + `changeset publish` + tag + GitHub Release. |
| Cloudflare Workers Builds | every push (main) | Reads from `wrangler.toml`, builds the playground and deploys it. This is NOT part of GitHub Actions — it is Cloudflare's own system, connected to the repo. |

**Node version: 22** (both in CI and in `package.json`'s `engines`).
`scripts/check-classes.mjs` uses `node:fs`'s `globSync`, which exists only in
Node 22+ — if you write Node 20, CI will break.

---

## 5. Known issues (solved this time, so they don't recur in the future)

These were real, root-caused problems that surfaced when this project's full CI/deploy chain was
first set up. If you see a similar error in the future, check here first:

1. **`npm run check:classes` fails in CI with a `globSync is not exported` error**
   → The Node version is 20; it must be 22. `node-version` in `ci.yml`/`publish.yml`
   and `engines.node` in `package.json`.

2. **Cloudflare deploy error "`_redirects` — infinite loop detected (code 100324)"**
   → If `not_found_handling = "single-page-application"` is written in `wrangler.toml`,
   change it — Cloudflare's own SPA-fallback generation produces this
   error for this project. Use `"404-page"` (§3 above).

3. **Golden snapshot tests (`tests/golden/*.html`) fail in CI (Linux)
   but pass locally (Windows)** — this had 3 different root causes, all fixed in
   `tests/golden/normalize.ts` or `tests/setup.ts`:
   - **Attribute order** (`<rect x="3" rx="2" ...>` vs `<rect rx="2" ... x="3">`):
     the old code in `normalize.ts` used `.sort((a,b) => a.localeCompare(b))`.
     **`localeCompare` is NOT alphabetical order, it is locale collation** —
     `"x".localeCompare("rx")` returns negative (!), and the result varies with the host's ICU locale
     data. Fix: a simple comparison like `(a < b ? -1 : a > b ? 1 : 0)`.
     **Never use `localeCompare` for purely technical sorting (attribute names, file
     names, etc.)** — it is only suitable for sorting real, human-readable text (such as
     user names).
   - **Time difference** (`13:30:00` vs `09:30:00`, 4 hours = Baku UTC+4):
     the `TimestampInfo` component displays in the browser's local time zone (this is
     correct behavior, don't change it). The test environment did not set a time zone.
     Fix: `process.env.TZ = "UTC"` in `tests/setup.ts`.
   - **Thousands separator** (`4.724` vs `4,724`): playground examples
     used `value.toLocaleString(undefined, {...})` — an `undefined` locale
     falls back to the host's default (a dot on Windows, a comma on Linux). Fix:
     `toLocaleString('en-US', {...})` — but ONLY in the demo files inside
     `playground/examples/`, NOT in the actual component source (`chart.tsx`,
     `metric-card-parts.tsx`), because that is real library behavior,
     not a test artifact.

   **General lesson**: any code whose output depends on `toLocaleString`, `localeCompare`,
   `Intl.*`, the time zone or the locale can produce DIFFERENT results between the local machine
   (Windows) and CI (Linux, UTC, en-US-like locale) — even with the same
   `package-lock.json` and the same Node version.
   In test/golden-snapshot code, either remove these entirely (in meaningless places such as
   attribute order), or pin them explicitly (TZ, locale).

4. **The publish workflow fails with `npm error code ENEEDAUTH` or `EOTP`**
   → This was the problem we hit when using the `NPM_TOKEN` secret
   (the token type was "Granular Access Token", it did not bypass the 2FA-writes setting,
   and it asked for an OTP in CI). The fix was NOT to fix the token but to move from the whole token system to
   **Trusted Publishing** ("Things set up once" in §2 above). Now `publish.yml` has no
   `NODE_AUTH_TOKEN`/`NPM_TOKEN` at all —
   if you see these errors AGAIN, it means someone has reverted the workflow to the token-based form,
   or deleted/changed the Trusted Publisher record on npmjs.com.

5. **The "Version Packages" PR is never opened; `changesets/action` fails with
   `npm error code EALLOWREMOTE ... Refusing to fetch ... oxide-wasm32-wasi`**
   → `version-packages` used to run `npm install --package-lock-only` after `changeset version`.
   That command re-resolves every dependency, and the `npm@latest` the workflow installs (for
   Trusted Publishing) refuses to fetch the optional `@tailwindcss/oxide-wasm32-wasi` tarball.
   Only the lockfile's own `version` needs to follow `package.json`, so
   `scripts/sync-lockfile-version.mjs` now does just that, with no network. Don't put
   `npm install` back into `version-packages`.

---

## 6. Quick summary ("I want to release a new version, what do I do?")

```sh
# 1. Add a changeset in the PR that makes the change
npx changeset          # pick minor / patch, write a description
git add .changeset && git commit -m "Add changeset"

# 2. Merge the PR into main
#    -> the workflow opens the "Version Packages" PR

# 3. Review and merge the "Version Packages" PR
#    -> the workflow publishes to npm, creates the vX.Y.Z tag and the GitHub Release

# 4. Verify:
#    github.com/habibmustafa/ui/actions  (Publish workflow should be green)
#    npmjs.com/package/@habibmustafa/ui  (the new version should be visible)

# Playground (ui.habibmustafa.me) - no extra work needed, every push to main
# deploys it automatically.
```
