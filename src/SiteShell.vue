<script setup>
// The page structure, from PageShell's props. Every website of the platform
// renders through this one component: header, banner, navigation, hyperlinks,
// sponsors and footer are configuration, not markup, and a site that needs a
// shape PageShell cannot express asks for it in @metanull/viewer-layout rather
// than building its own chrome here.
//
// Everything dataset.config.js puts in `navigation`, and the language the
// application resolved, arrive as $attrs and pass straight through.
import { computed } from 'vue'
import { useI18n } from '@metanull/viewer-core'
import { PageShell } from '@metanull/viewer-layout'

const { t } = useI18n()

// The menu is built here rather than in dataset.config.js because a label is a
// text and a text is only available inside the application: `t` needs the
// installed catalogue, and every name has to be written out where it is used
// so `viewer-i18n-check` can see it. PageShell receives these links after
// $attrs, so they win over anything the config still passes.
const navLinks = computed(() => [
  { label: t('core.nav.home'), href: '#/' },
])
</script>

<template>
  <PageShell
    v-bind="$attrs"
    :nav-links="navLinks"
    :footer-text="$t('__SITE_NAMESPACE__.identity.copyright')"
  >
    <template #header>
      <a class="site-logo" href="#/">
        <span class="site-logo-org">{{ $t('__SITE_NAMESPACE__.identity.organisation') }}</span>
        <span class="site-logo-title">{{ $t('__SITE_NAMESPACE__.identity.title') }}</span>
      </a>
    </template>
    <slot />
  </PageShell>
</template>

<style scoped>
/* The lockup only. Colours and fonts come from theme/tokens.css, which is
   where this website's identity is set. */
.site-logo {
  display: flex;
  flex-direction: column;
  gap: 1px;
  color: var(--header-fg);
  text-decoration: none !important;
}
.site-logo-org {
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.8;
}
.site-logo-title {
  font-size: 28px;
  font-weight: 400;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
.site-logo:hover {
  color: var(--header-fg);
}
</style>
