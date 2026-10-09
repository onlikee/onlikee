<template>
  <svg
    aria-hidden="true"
    focusable="false"
    data-octicon="feed-public"
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    :fill="color"
  >
    <path
      d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm4.5.25v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H7v-1.5a1.5 1.5 0 0 1 2.443-1.167.75.75 0 0 0 .943-1.166A3 3 0 0 0 5.5 5.75v1.5a1 1 0 0 0-1 1Z"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string; color?: string }>(), {
  size: 16,
  color: 'currentColor',
})
</script>
