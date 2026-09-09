<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  }>(),
  {
    as: 'h2'
  }
)
</script>

<template>
  <component
    :is="as"
    class="blankslate-heading"
  >
    <slot />
  </component>
</template>

<style scoped>
.blankslate-heading {
  color: var(--fgColor-default, #1f2328);
  font-size: var(--blankslate-heading-size, 1.5rem);
  font-weight: var(--base-text-weight-semibold, 600);
  line-height: var(--blankslate-heading-line-height, 1.333);
  margin: 0;
}
</style>
