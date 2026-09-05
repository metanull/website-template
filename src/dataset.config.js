import { languageLabels, offeredLanguages, useDataPackage } from '@metanull/viewer-core'
import SiteShell from './SiteShell.vue'

// The whole declaration of this website. Before it mounts, the website reads
// nothing from its package but the manifest: the languages it offers, their
// labels and its name come from `manifest.site`, and every record is loaded by
// the route that reads it. Nothing else in `src/` imports `@inventory-data`.

const { manifest } = useDataPackage()

// The languages the package declares for this site, kept where the item
// translations actually carry them. Pass `{ declared: [...] }` to offer fewer
// than the package declares — a site whose chrome is English-only, say.
//
// A record may carry more languages than the site offers; its own page reads
// those from `useRecordLanguage`, without touching the site language.
const languages = offeredLanguages()

export default {
  // The dataset package this website renders. Must match the alias in
  // vite.config.js and the dependency in package.json.
  datasetPackage: '@metanull/__DATASET__-data',

  // The website's name, as the package declares it. The fallback is what a
  // package predating `manifest.site` still shows.
  siteName: manifest.site?.names?.en ?? '__DATASET__',

  features: {
    // No generic entity pages. viewer-core can publish one list and one detail
    // page per exported entity, which is useful for looking at a new dataset
    // and wrong for a website: those routes expose the data package's shape
    // rather than the site's. Set `entities: entityNames` from
    // `useDataPackage()` temporarily while exploring; ship `[]`.
    entities: [],
  },

  // The site language. One per visit, negotiated once by viewer-core: an
  // explicit `?lang=`, then the remembered choice, then the browser, then
  // English.
  languages,

  shell: SiteShell,

  // Only what is not a text. Menu labels and the footer line are texts, so
  // they are built in SiteShell.vue where the catalogue is installed; the
  // language names below come from the data package, not from a translator.
  navigation: {
    languages: languageLabels(languages),
  },

  // Where this website's media lives. `mediaUrl(path, size)` builds an address
  // from a path the data package carries; no view reads `import.meta.env` and
  // no host is written anywhere but here.
  media: {
    legacyHost: 'https://images.museumwnf.org',
  },

  // Every address this website links out to, by name.
  links: {
    portal: 'https://www.museumwnf.org',
  },

  // The route map. Every route is named, sections are kebab-case, and the page
  // and every filter live in the query. Each route declares the entities its
  // view reads, so the router loads them before the view is created and no
  // page renders against records that are not there yet.
  //
  // The 'home' name replaces viewer-core's generic home view.
  extraViews: [
    {
      path: '/',
      name: 'home',
      component: () => import('./views/Home.vue'),
      meta: { entities: [] },
    },
  ],

  // Addresses this website was published under before, each resolving onto a
  // canonical route above. Redirect-only: no view, no second way to reach a
  // page. A website that has never moved leaves this empty.
  legacyRoutes: [],

  // The unmatched-address page is viewer-core's, on a catch-all it adds
  // itself. Pass `notFound: false` to leave it out, or a component to replace
  // it — do not declare a `/:pathMatch(.*)*` route here.
}
