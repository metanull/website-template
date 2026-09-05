# website-template

Template repository for MWNF websites. Every new website repo
(`metanull/<dataset>`, public) is created **once** from this template — it is
never installed as a dependency and never updated in existing websites.

A website is a light, static Vue 3 front-end for one published dataset. It
combines three `@metanull` packages from GitHub Packages:

| Package | Role |
| --- | --- |
| `@metanull/<dataset>-data` | the dataset (JSON + `manifest.json`) |
| `@metanull/viewer-core` | application engine (routing, data access, texts, language, shared views) |
| `@metanull/viewer-layout` | page structure (`PageShell` + sections), themed via `theme/tokens.css` |
| `@metanull/viewer-i18n` | the shared texts of this kind of website |

---

## Admin — creating a new website

1. **Use this template.** On this repo's GitHub page, click **Use this
   template → Create a new repository**. Name it after the dataset
   (`metanull/<dataset>`), keep it **public**.
2. **Replace every `__DATASET__` placeholder** with the dataset key
   (e.g. `islamicart`). The placeholder appears in exactly these places:
   - `package.json` — the `name` field and the `@metanull/__DATASET__-data` dependency
   - `vite.config.js` — the `@inventory-data` alias path
   - `src/dataset.config.js` — `datasetPackage` and the `siteName` fallback
   - `index.html` — the `<title>`
   - `locales/en.json` — the example texts

   Leave the dataset dependency's *version* (`0.0.0-REPLACE-ME`) alone — step 4
   sets it. A half-configured copy cannot reach CI: npm itself refuses a
   dependency still named or versioned after a placeholder, and a `preinstall`
   check refuses the rest, naming the files you still have to edit.
3. **Say which shared texts this website receives**, by replacing two more
   placeholders:
   - `__SITE_CLASS__` — `standalone`, `gallery` or `exhibition`. It appears in
     `package.json` (`viewerI18n.class`) and in `src/main.js`, which imports
     that bundle. A product website (a whole virtual museum) is `standalone`.
   - `__SITE_NAMESPACE__` — the name this website's own texts carry: one
     lowercase word, no hyphens (`carpets`, `waterInIslam`). It appears in
     `package.json` (`viewerI18n.namespace`), `locales/en.json`,
     `src/SiteShell.vue` and `src/views/Home.vue`.

   `__SITE_CLASS__` also appears in `tests/smoke.test.js`, which imports the
   same bundle `src/main.js` does.

   See [`viewer-i18n`](https://github.com/metanull/viewer-i18n) for what each
   bundle contains.
4. **Grant the new repo access to the dataset package.** On the package page
   (`github.com/users/metanull/packages/npm/package/<dataset>-data`) →
   **Package settings → Manage Actions access → Add repository** → the new
   repo, role **Read**. This is what lets CI install a **private** dataset
   with its built-in `github.token`; no secret and no PAT is involved. The
   grant is UI-only, and only affects workflow runs *started after* it — a run
   that already failed with `403 permission_denied: read_package` has to be
   re-run.
5. **Install the dataset.** On any machine logged in to GitHub Packages (or in
   the Docker container below), run

   ```
   npm install @metanull/<dataset>-data@latest
   ```

   and commit `package-lock.json` — CI uses `npm ci` and needs it. Use
   `@latest` rather than a bare `npm install`: it resolves whatever major the
   dataset has actually reached, so this step cannot be wrong for a dataset
   published past 1.x.
6. **Switch on the rails** in the new repo's settings:
   - **Pages** → Build and deployment → Source: **GitHub Actions**.
   - **Ruleset** for `main`: require pull requests + required status checks
     (copy the ruleset of an existing website repo).
   - **General → Allow auto-merge** (needed by the translator flow and Dependabot).
   - **CodeQL** (Security → Code scanning) and Dependabot alerts.
7. **Grant `viewer-core`, `viewer-layout` and `viewer-i18n` Read on the dataset
   package** as well (step 4). Their CI builds every website against the
   package being released, so they install this dataset too.

   There is nothing to register: a website is discovered from the
   `website-template` link GitHub records when the repository is created, so it
   becomes a downstream consumer the moment it exists.
8. **Check `.github/CODEOWNERS`.** It ships owned by `@metanull`, the account
   that owns the template — right for a website under a personal account, and
   worth replacing with the owning teams under an organisation. A team that
   does not exist is ignored without warning, so a wrong name here reads as
   reviewed and is not.
9. **Merge the first PR** (the placeholder replacement). The deploy workflow
   publishes the site to `https://metanull.github.io/<dataset>/`.

The CI, deploy and audit workflows carry an
`if: github.repository != 'metanull/website-template'` guard so the template
itself — which has no lockfile and an unresolvable `__DATASET__` dependency —
does not report failing checks. The condition is false in every repository
created from the template, so the checks simply run; there is nothing to
remove.

The deployed base path comes from the `BASE_PATH` environment variable at
build time; the deploy workflow defaults it to `/<repo>/` for Pages. For a
root deployment (custom domain), pass `base_path: /` to the deploy workflow.

---

## Translator — editing the website's texts

You only need a GitHub account and a browser. The files under `locales/` hold
**this website's own texts**, one file per language — `en.json` is English,
`fr.json` French, and so on.

Texts shared with the other websites of the same kind — the labels of an item
sheet, the navigation, the buttons — are not here: they live in
[`viewer-i18n`](https://github.com/metanull/viewer-i18n) and are edited there,
the same way. This website can override any of them by writing the same entry
name in its own file. The museum content itself arrives already translated and
is not edited anywhere.

1. **Open the folder.** Bookmark this link on the website's GitHub page:
   `locales/`. Click the language file you want to change.
2. **Click the pencil** (✏️, top right of the file view). The file opens in an
   editable text box. Change only the text between the second pair of
   quotation marks on a line — the part before the colon is the name of the
   entry and must stay exactly as it is.
3. **To start a new language**, open `en.json`, copy all of its content, then
   create the new file (Add file → Create new file) named with the two-letter
   language code, e.g. `ar.json`, paste, and translate the texts. A language
   does not have to be complete: anything you have not translated shows in
   English.
4. **Click "Commit changes…" then "Propose changes".** GitHub asks nothing
   else — it saves your edit as a proposal.
5. **Wait for the automatic check.** After a minute or two, the proposal page
   shows a green tick and your change goes live on the website by itself a few
   minutes later. If something is off, a comment appears explaining in plain
   language what to fix — edit again on the same page and the check reruns.

A text is **just text**, formatted with Markdown if you want: `**bold**`,
`*italic*`, `[a link](https://example.org)`. It may not contain HTML tags, and
it may not contain `{` or `}` — nothing is ever inserted into a text, so a
number or a date is placed next to it by the website rather than inside it.

---

## Webdesigner — theming the website

The website's whole visual identity lives in the `theme/` folder:
`tokens.css` (colors, fonts, spacing — the normal surface), `overrides.css`
(escape hatch) and `assets/` (logo, banner, sponsor images). Small changes can
be made straight in the browser with the pencil button, like the translator
flow above — styling changes are reviewed, they do not merge automatically.
For real design work, use the live preview:

1. **One-time setup:**
   - Install **Docker Desktop** (docker.com) and **GitHub Desktop**
     (desktop.github.com), each with default settings.
   - In GitHub Desktop: File → Clone repository → pick this website's repo.
   - Sign in to GitHub Packages once, in a terminal:
     `npm login --registry=https://npm.pkg.github.com --scope=@metanull`.
     That login stays on your own computer, and the preview reads it. Nothing
     in this repository holds a token.
2. **Start the preview:** open a terminal in the folder (GitHub Desktop:
   Repository → Open in Command Prompt) and run:

   ```bash
   docker compose up
   ```

   The first start downloads everything and takes a few minutes; wait until a
   line shows `Local: http://localhost:5173/`, then open
   **http://localhost:5173** in your browser.
3. **Edit `theme/`, watch it live.** Every save refreshes the browser
   automatically. `tokens.css` lists every knob with a comment; put images
   into `theme/assets/` and reference them from `src/dataset.config.js`
   (banner, sponsor logos). Anything a token cannot express goes into
   `overrides.css`. A change to a layout component itself is a request for the
   `viewer-layout` package — open an issue there and a developer pairs on it.
4. **Propose your changes:** in GitHub Desktop, write a short summary bottom
   left → **Commit** → **Push origin** → **Create Pull Request** (opens in the
   browser → green **Create pull request** button). After a colleague approves
   it, the change merges and deploys by itself. Stop the preview with
   `Ctrl+C` in the terminal when done.

---

## Developer notes

The platform has one architecture, and every website follows it. These are its
rules; each one exists because a site that broke it cost something real. The
pass that imposed them is metanull/inventory-app#1683, and the scaffold in this
repository already obeys all ten — a new website starts compliant and stays
that way by not undoing them.

**1. `src/dataset.config.js` is the whole declaration.** Routes, languages,
shell, media host, outbound links. Before the application mounts, the website
reads nothing from its package but `manifest.json`. `src/main.js` needs no edit
after the placeholders are replaced.

**2. Records and translations come from viewer-core, lazily.** `entityRef`,
`byId`, `loadTranslations`, `translations`, `tr` — see `src/composables/useCatalogue.js`,
which is derivation over those and holds no state of its own. Rename it after
the website. Nothing in `src/` imports `@inventory-data` directly, and nothing
keeps a second cache. In particular, never resolve a language with an
interpolated dynamic import: `` import(`@inventory-data/translations/items.${lang}.json`) ``
cannot be resolved statically, so a bundler pulls in every language of that
entity eagerly. On a large dataset that is a build which never finishes in CI —
which is what happened, on three sites.

**3. Glossary highlighting is the renderer's.** Pass `[{ id, spelling }]` to
`md`/`mdInline` and viewer-core marks each occurrence while it parses. Wrapping
a `<span>` into the text beforehand puts markup where a record's text should be,
and it is escaped like any other raw HTML.

**4. One site language, negotiated once.** `offeredLanguages()` in the config
decides what the site offers: what the package declares for it, kept where the
items carry content. Never derive it from `manifest.languages`, which lists
every language the project ever touched — most with no translation file, so the
switcher would offer languages whose pages are all English.

**5. A record's language is not the site's.** An item sheet reads
`useRecordLanguage(record, { entity: 'items' })`: the site language where the
record carries it, English where it does not, the record's first language
otherwise. The visitor may toggle it there, and that toggle never touches the
site language or the address.

**6. Every field is Markdown, escaped in one place.** `md`, `mdInline` and
`mdStrip` in the composable are viewer-core's renderers and the only place a
record becomes HTML. A tag that slipped past the importer appears on the page as
the characters it is; when that happens the fix belongs in the importer, not in
a view.

**7. The shell is `PageShell`, from props.** `src/SiteShell.vue` supplies the
menu and the lockup, because a label is a text and a text needs the running
application. A shape PageShell cannot express is a request to
[`viewer-layout`](https://github.com/metanull/viewer-layout), not a chrome
component built here.

**8. One routing convention.** Every route named, sections kebab-case, the page
and all filters in the query, `meta.entities` naming what the view reads.
Addresses the site used to publish go in `legacyRoutes`, redirect-only. The
catch-all is viewer-core's; do not declare a second one.

**9. A website owns its theme, and nothing else.** `theme/tokens.css` for the
chrome, `src/styles/site.css` for the views' own content styles. Layout belongs
to `viewer-layout`, behaviour to `viewer-core`.

**10. CI is thin and pinned.** The five workflows below call
`metanull/viewer-workflows` at an exact version.

Two more things worth knowing before writing a page:

- **Texts come from two layers**, merged in `src/main.js` with `mergeMessages`:
  the `@metanull/viewer-i18n` bundle for this kind of website, then this
  website's `locales/`, which wins. Read one with `$t('name')` in a template or
  `useI18n()` from `@metanull/viewer-core` in a script, and render Markdown with
  `<I18nText keypath="…">`. Entry names must be **written out in full** at the
  call site: CI checks that every one resolves, and it can only check the names
  it can see. Nothing is ever interpolated into a text — a number or a date is
  placed next to it by the view.
- **`npm run test`** runs `tests/smoke.test.js`, which mounts the application
  against the real data package and asserts the rules above that a test can
  reach: named routes, declared entities, no generic entity pages, and the
  language rule through `checkOfferedLanguages`. Add website-specific tests next
  to it. There is no Markdown test here — the renderers are viewer-core's and
  are tested there.

And on rule 10, the pinned CI:

- CI (`.github/workflows/`) is a set of thin callers of
  [`metanull/viewer-workflows`](https://github.com/metanull/viewer-workflows);
  build, test and texts block, ESLint + `npm audit` report, text-only PRs
  validate and auto-merge, a weekly audit opens issues on findings.
- Those callers pin an **exact** `viewer-workflows` version, never a moving
  major tag. Do not "simplify" them to `@v1`: that tag is frozen at v1.1.2 and
  force-moving it would deploy unverified CI to every website at once. New
  releases arrive as a Dependabot pull request — the `github-actions` ecosystem
  covers reusable-workflow refs — so this site's own CI validates a release
  before it is adopted, and green minor/patch bumps auto-merge.
- **`@metanull` npm packages are not managed by Dependabot.** GitHub Packages
  requires a token for every install, including of a public package, and
  Dependabot has no route to one — so `.github/dependabot.yml` ignores that
  scope and it is propagated by the operator instead. Dependabot still keeps
  third-party dependencies and GitHub Actions current, which both resolve fine.
  The procedure, and the reasoning, are in
  [MAINTENANCE.md](https://github.com/metanull/viewer-workflows/blob/main/MAINTENANCE.md).
