<template>
  <svg
    aria-hidden="true"
    focusable="false"
    data-octicon="skip-fill"
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    :fill="color"
  >
    <path
      d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm11.333-2.167a.825.825 0 0 0-1.166-1.166l-5.5 5.5a.825.825 0 0 0 1.166 1.166Z"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string; color?: string }>(), {
  size: 16,
  color: 'currentColor',
})
</script>
