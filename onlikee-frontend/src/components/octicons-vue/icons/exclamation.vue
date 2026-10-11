<template>
  <svg
    aria-hidden="true"
    focusable="false"
    data-octicon="exclamation"
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    :fill="color"
  >
    <path
      d="M8 11a2 2 0 1 1 .001 3.999A2 2 0 0 1 8 11ZM8 1a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-3 0v-6A1.5 1.5 0 0 1 8 1Z"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string; color?: string }>(), {
  size: 16,
  color: 'currentColor',
})
</script>
