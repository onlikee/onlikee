<template>
  <svg
    aria-hidden="true"
    focusable="false"
    data-octicon="feed-issue-closed"
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    :fill="color"
  >
    <path
      d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Zm3.457 6.957a.999.999 0 1 0-1.414-1.414L7.25 8.336 5.957 7.043a.999.999 0 1 0-1.414 1.414l2 2a.999.999 0 0 0 1.414 0Z"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string; color?: string }>(), {
  size: 16,
  color: 'currentColor',
})
</script>
