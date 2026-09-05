import {
  byId, entityRef, renderBlock, renderInline, renderPlain, useDataPackage,
} from '@metanull/viewer-core'

// This website's records, read the one way every website reads them: through
// viewer-core, lazily. Each entity is a shared ref that stays `null` until a
// route declaring it in `meta.entities` brings its chunk in, so importing this
// module loads nothing and a page pays only for what it reads.
//
// This file holds no state of its own. It is derivation over viewer-core's
// records and translations — refs, lookup maps, label helpers, route helpers.
// A second cache here is a second answer to the same question, and the two
// drift. Nothing here imports `@inventory-data` either: the alias is
// viewer-core's to read.
//
// Rename this file after the website: `useGalleryData.js`, `useExhibitionData.js`,
// `useInventoryData.js` — whatever its records are.

const dataPackage = useDataPackage()
export const manifest = dataPackage.manifest

// ── Records ────────────────────────────────────────────────────────────────
//
// Language-independent; every human-readable string lives under translations/.
// One line per entity this website reads. The name must match the JSON file:
// `entityRef('timeline_events')` reads `timeline_events.json`.

export const items = entityRef('items')
export const partners = entityRef('partners')
export const countries = entityRef('countries')

// English is the base language of every catalogue in the platform: every list,
// label and fallback reads it. Which languages the site OFFERS is decided
// once, in dataset.config.js; which language a record is read in is decided on
// that record's own page, by viewer-core's `useRecordLanguage`.
export const defaultLang = 'en'

// ── Lookup maps ────────────────────────────────────────────────────────────
//
// `byId` returns a computed **Map**, not an object: read it with `.get(id)`.
// `map.value[id]` is `undefined` rather than an error, so a page written that
// way renders nothing at all and looks like missing data.

export const itemById = byId('items')
export const partnerById = byId('partners')
export const countryById = byId('countries')

// ── Translations ───────────────────────────────────────────────────────────
//
// One file per entity per language, resolved by name through viewer-core.
// Never `` import(`…/items.${lang}.json`) ``: a bundler cannot resolve an
// interpolated specifier statically, so it bundles every language of that
// entity eagerly. On a large dataset that is a build which never finishes.

export const { availableLanguages, loadTranslations, translations } = dataPackage

/** One record's translated fields, falling back to English then to nothing. */
export function tr(entity, id, lang = defaultLang) {
  return dataPackage.tr(entity, id, lang, defaultLang)
}

// ── Labels ─────────────────────────────────────────────────────────────────
//
// A label is a record's name reduced to plain text: it appears in a <title>,
// an alt attribute and a select option, where markup would show as characters.

export function itemLabel(item) {
  if (!item) return ''
  return mdStrip(tr('items', item.id).name ?? item.internal_name ?? item.id)
}

// ── Routes ─────────────────────────────────────────────────────────────────
//
// Built by name, never by string concatenation, so a path shape is changed in
// dataset.config.js alone. The language never travels in the path.

export function itemRoute(item) {
  return { name: 'item', params: { id: item.id } }
}

// ── Rendering ──────────────────────────────────────────────────────────────
//
// Every field of a record is Markdown, and these three are the only places one
// becomes HTML on this website. They are viewer-core's renderers: raw HTML in
// a record shows on the page as the characters it is, and when it does the fix
// belongs in the importer, not here.

export function md(text, glossary) {
  return renderBlock(text, { glossary })
}

export function mdInline(text, glossary) {
  return renderInline(text, { glossary })
}

export function mdStrip(text) {
  return renderPlain(text)
}
