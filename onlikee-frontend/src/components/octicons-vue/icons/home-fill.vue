<template>
  <svg
    aria-hidden="true"
    focusable="false"
    data-octicon="home-fill"
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    :fill="color"
  >
    <path
      d="M6.906.384a1.75 1.75 0 0 1 2.187 0l5.25 4.2c.415.332.657.835.657 1.367v7.019a1.75 1.75 0 0 1-1.75 1.75h-2.5a.75.75 0 0 1-.75-.75V8.72H6v5.25a.75.75 0 0 1-.75.75h-2.5A1.75 1.75 0 0 1 1 12.97V5.95c0-.531.242-1.034.657-1.366l5.249-4.2Z"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string; color?: string }>(), {
  size: 16,
  color: 'currentColor',
})
</script>
