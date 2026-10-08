<template>
  <svg
    aria-hidden="true"
    focusable="false"
    data-octicon="triangle-up"
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    :fill="color"
  >
    <path
      d="m4.427 9.573 3.396-3.396a.25.25 0 0 1 .354 0l3.396 3.396a.25.25 0 0 1-.177.427H4.604a.25.25 0 0 1-.177-.427Z"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string; color?: string }>(), {
  size: 16,
  color: 'currentColor',
})
</script>
