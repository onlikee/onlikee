<script setup lang="ts">
withDefaults(defineProps<{ isVisible?: boolean; as?: string }>(), { isVisible: false, as: 'span' })
</script>
<template>
  <component :is="as || 'span'" :class="{ 'internal-visually-hidden': !isVisible }">
    <slot />
  </component>
</template>
<style module src="./VisuallyHidden.module.css" />
