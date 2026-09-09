<template>
  <hr
    class="divider"
    :class="{ 'divider--vertical': direction === 'vertical' }"
    :style="direction === 'vertical' ? (height ? { height } : undefined) : (width ? { width } : undefined)"
  >
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  direction?: 'horizontal' | 'vertical'
  height?: string
  width?: string
}>(), {
  direction: 'horizontal',
  height: '',
  width: '',
})
</script>

<style scoped>
.divider {
  border: 0;
  border-block-start: 1px solid var(--borderColor-muted, #d1d9e0b3);
  height: 1px;
  margin: 0.5rem 0;
  width: 100%;
}

.divider--vertical {
  align-self: stretch;
  border-block-start: 0;
  border-inline-start: 1px solid var(--borderColor-muted, #d1d9e0b3);
  flex-shrink: 0;
  height: 1em;
  width: 1px;
}
</style>
