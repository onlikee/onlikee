<script setup lang="ts">
</script>

<template>
  <p class="blankslate-description">
    <slot />
  </p>
</template>

<style scoped>
.blankslate-description {
  color: var(--fgColor-muted, #59636e);
  font-size: var(--blankslate-description-size, 0.875rem);
  line-height: 1.5;
  margin: 0;
  max-width: 100%;
}
</style>
