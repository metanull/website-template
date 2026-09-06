import { describe, expect, it, vi } from 'vitest'
import { createViewer, loadEntities, mergeMessages } from '@metanull/viewer-core'
import { checkOfferedLanguages } from '@metanull/viewer-core/testing'
import { catalogues as sharedTexts } from '@metanull/viewer-i18n/__SITE_CLASS__'
import ownTexts from '../locales/en.json'
import config from '../src/dataset.config.js'

// The same two layers main.js assembles, in the same order: the shared bundle
// first, this website's own file last. Mounting without them would prove
// nothing about the chrome — every text would render as its own name.
const messages = mergeMessages(sharedTexts, { en: ownTexts })

// Mounted on the address under test, as a visitor arrives: this is what
// found viewer-core's deep-link defect (1.9.1), which a test pushing to the
// page after mounting on `#/` never could.
async function mountSite(hash = '#/') {
  window.location.hash = hash
  const app = createViewer({ ...config, messages })
  const host = document.createElement('div')
  document.body.appendChild(host)
  app.mount(host)
  await app.config.globalProperties.$router.isReady()
  return { app, host }
}

describe('website smoke test', () => {
  it('mounts against the configured data package', async () => {
    const { app, host } = await mountSite()

    expect(host.querySelector('.mwnf-page')).not.toBeNull()

    // The composed landing page (named in `config.views.home`) replaces
    // viewer-core's generic home view: the title, the cards and the record
    // on display come from `config.home`, not from a page written here. The
    // title is this website's own text, not the package's `siteName`.
    expect(host.querySelector('.vc-home')).toBeNull()
    expect(host.querySelector('.mwnf-home__title').textContent.trim()).not.toBe('')
    expect(host.querySelector('.mwnf-cards__card')).not.toBeNull()

    app.unmount()
  }, 20000)

  // The two other pages a scaffolded website starts with, rendered against
  // the data package by the composed views, each on an application mounted
  // on that page's address — as a visitor arrives from a link. The results
  // page lists records under the filter panel the catalogue spec declares;
  // the record page shows a record's sheet under the labels the sheet spec
  // declares.
  it('renders the composed results page from the catalogue spec', async () => {
    const { app, host } = await mountSite('#/catalogue')
    await vi.waitFor(() => expect(host.querySelector('.mwnf-list__row')).not.toBeNull(), { timeout: 20000 })
    expect(host.querySelector('.mwnf-filter')).not.toBeNull()
    expect(host.querySelector('.mwnf-summary__count')).not.toBeNull()
    app.unmount()
  }, 60000)

  it('renders the composed record page from the sheet spec', async () => {
    const [items] = await loadEntities(['items'])
    const { app, host } = await mountSite(`#/item/${encodeURIComponent(items[0].id)}`)
    await vi.waitFor(() => expect(host.querySelector('.mwnf-sheet__label')).not.toBeNull(), { timeout: 20000 })
    expect(host.querySelector('.mwnf-record__title').textContent.trim()).not.toBe('')
    app.unmount()
  }, 60000)

  it('declares every route by name, and leaves the catch-all to the router', () => {
    // A named route is what a view links to; a path written into a link is a
    // second declaration of the same address, and the two drift.
    expect(config.extraViews.every((r) => r.name)).toBe(true)
    expect(config.extraViews.map((r) => r.name)).toContain('catalogue')
    expect(config.extraViews.map((r) => r.name)).toContain('item')
    // The three slots are the composed views, not viewer-core's generic ones.
    expect(Object.keys(config.views ?? {}).sort()).toEqual(['detail', 'home', 'list'])
    // Every route belongs to a section the shell can name.
    expect(config.extraViews.every((r) => typeof r.meta?.section === 'string')).toBe(true)
    // viewer-core adds `/:pathMatch(.*)*` itself. A second catch-all here
    // shadows it, and the unmatched-address page stops appearing.
    expect(config.extraViews.some((r) => r.path.includes('pathMatch'))).toBe(false)
  })

  it('declares the entities every route reads', () => {
    // A view rendering records against `null` is the failure this prevents:
    // the router loads what a route names before the view is created.
    for (const route of config.extraViews) {
      expect(Array.isArray(route.meta?.entities), route.name).toBe(true)
    }
  })

  it('publishes no generic entity pages', () => {
    // Leaving `entities` at the package default publishes one list and one
    // detail page per exported entity — routes this website never had, showing
    // the data package's shape rather than the site's.
    expect(config.features.entities).toEqual([])
  })

  // The one language rule, checked the same way in all seven websites: every
  // offered language is one the package declares for this site AND one the
  // items actually carry. Offering a language whose item sheets all render
  // English is the failure this catches, and a visitor cannot tell it from a
  // site that is simply untranslated.
  it('offers the languages the package declares, where the items carry them', () => {
    expect(checkOfferedLanguages(config)).toEqual([])
    expect(config.languages.length).toBeGreaterThan(0)
    const switcher = config.navigation.languages
    expect(switcher.map((l) => l.code)).toEqual(config.languages)
    expect(switcher.every((l) => Boolean(l.label))).toBe(true)
  })

  // The chrome is two layers, and either one failing is silent: a missing
  // entry renders as its own name rather than as an error. This asserts the
  // rendered page, not the files, so a bundle that installs but never reaches
  // the components fails here too.
  it('renders the shared texts and its own over them', async () => {
    const { app, host } = await mountSite()

    // From viewer-i18n: the layout's skip link.
    expect(host.textContent).toContain('Skip to content')
    // Nothing rendered as a bare entry name, which is what a missing text
    // looks like — there is no exception to throw for one.
    expect(host.textContent).not.toMatch(/\b(__SITE_NAMESPACE__|core|layout)\.[a-z]/i)

    app.unmount()
  }, 20000)
})
