<template>
  <svg
    aria-hidden="true"
    focusable="false"
    data-octicon="multi-select"
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    :fill="color"
  >
    <path
      d="M5.75 7.5h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5Zm0 5h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5Zm-4-10h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5ZM2 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm10.314-3.082L11.07 2.417A.25.25 0 0 1 11.256 2h4.488a.25.25 0 0 1 .186.417l-2.244 2.5a.25.25 0 0 1-.372 0Z"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string; color?: string }>(), {
  size: 16,
  color: 'currentColor',
})
</script>
