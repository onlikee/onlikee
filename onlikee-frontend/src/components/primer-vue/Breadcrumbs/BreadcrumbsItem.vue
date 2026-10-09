<script setup lang="ts">
import type { BreadcrumbsItemProps } from './types'

withDefaults(defineProps<BreadcrumbsItemProps>(), { as: 'a', selected: false, to: undefined })
</script>

<template>
  <component
    :is="as"
    :to="to"
    :aria-current="selected ? 'page' : undefined"
    :class="[$style['breadcrumbs-link'], 'breadcrumbs-link']"
    data-component="Breadcrumbs.Item"
  >
    <slot />
  </component>
</template>

<style module src="./BreadcrumbsItem.module.css"></style>
