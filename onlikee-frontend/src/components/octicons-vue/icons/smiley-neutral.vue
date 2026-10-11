<template>
  <svg
    aria-hidden="true"
    focusable="false"
    data-octicon="smiley-neutral"
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    :fill="color"
  >
    <path
      d="M8 0a7.996 7.996 0 0 1 8 8 8 8 0 1 1-8-8Zm0 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm2 8.75a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1 0-1.5ZM5 6a1 1 0 1 1 0 1.998A1 1 0 0 1 5 6Zm6 0a1 1 0 1 1 0 1.998A1 1 0 0 1 11 6Z"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string; color?: string }>(), {
  size: 16,
  color: 'currentColor',
})
</script>
