<script setup lang="ts">
import type { BreadcrumbsItemProps } from './types'

withDefaults(defineProps<BreadcrumbsItemProps>(), { as: 'a', selected: false, to: undefined })
</script>

<template>
  <component
    :is="as"
    :to="to"
    :aria-current="selected ? 'page' : undefined"
    class="breadcrumbs-link"
    data-component="Breadcrumbs.Item"
  >
    <slot />
  </component>
</template>

<style scoped>
.breadcrumbs-link {
  display: inline-block;
  font-size: var(--text-body-size-medium, 14px);
  color: var(--fgColor-link, #0969da);
  text-decoration: none;
}
.breadcrumbs-link:not([aria-current]):hover { text-decoration: underline; }
.breadcrumbs-link[aria-current] { color: var(--fgColor-default, #1f2328); }
.breadcrumbs-link:focus-visible {
  border-radius: var(--borderRadius-small, 3px);
  outline: 2px solid var(--focus-outlineColor, #0969da);
  outline-offset: 2px;
  text-decoration: none;
}
</style>
