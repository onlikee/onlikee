<script setup lang="ts">
</script>

<template>
  <div
    class="blankslate-visual"
    aria-hidden="true"
  >
    <slot />
  </div>
</template>

<style scoped>
.blankslate-visual {
  align-items: center;
  color: var(--fgColor-muted, #59636e);
  display: inline-flex;
  height: var(--blankslate-visual-size, 32px);
  justify-content: center;
  margin-bottom: 0.25rem;
  width: var(--blankslate-visual-size, 32px);
}

.blankslate-visual :deep(svg) {
  height: var(--blankslate-visual-size, 32px);
  width: var(--blankslate-visual-size, 32px);
}
</style>
