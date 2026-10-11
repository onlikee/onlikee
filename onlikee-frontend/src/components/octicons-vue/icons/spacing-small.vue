<template>
  <svg
    aria-hidden="true"
    focusable="false"
    data-octicon="spacing-small"
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    :fill="color"
  >
    <path
      d="M13.25 4H2.75a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5Zm-3 3h-4.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5Zm3 3H2.75a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5Z"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string; color?: string }>(), {
  size: 16,
  color: 'currentColor',
})
</script>
