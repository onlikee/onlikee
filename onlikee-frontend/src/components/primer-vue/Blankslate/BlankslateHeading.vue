<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  }>(),
  {
    as: 'h2',
  },
)
</script>

<template>
  <component :is="as" :class="$style['blankslate-heading']">
    <slot />
  </component>
</template>

<style module src="./BlankslateHeading.module.css"></style>
