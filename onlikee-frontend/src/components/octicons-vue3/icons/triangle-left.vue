<template>
  <svg
    aria-hidden="true"
    focusable="false"
    data-octicon="triangle-left"
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    :fill="color"
  >
    <path
      d="M9.573 4.427 6.177 7.823a.25.25 0 0 0 0 .354l3.396 3.396a.25.25 0 0 0 .427-.177V4.604a.25.25 0 0 0-.427-.177Z"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string; color?: string }>(), {
  size: 16,
  color: 'currentColor',
})
</script>
