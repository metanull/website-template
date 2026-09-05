<script setup>
// The website's own home page. It replaces viewer-core's generic one by taking
// the route name 'home' in dataset.config.js.
//
// A view reads its records from the composable and never from the data package
// directly, and it renders every record field through `md` / `mdInline`. This
// one has no records yet — delete the import when you write the real page, or
// use it.
import { I18nText } from '@metanull/viewer-core'
</script>

<template>
  <div class="home">
    <h1 class="home-heading">{{ $t('__SITE_NAMESPACE__.identity.title') }}</h1>
    <!-- I18nText renders a text as Markdown; {{ }} renders it as plain text. -->
    <I18nText tag="p" class="home-intro" keypath="__SITE_NAMESPACE__.home.intro" />
  </div>
</template>

<style scoped>
.home-heading {
  font-size: 24px;
  font-weight: 400;
  color: var(--heading);
  margin-bottom: 12px;
}
.home-intro {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text);
}
</style>
