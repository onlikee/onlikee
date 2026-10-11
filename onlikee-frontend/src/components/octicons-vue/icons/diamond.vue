<template>
  <svg
    aria-hidden="true"
    focusable="false"
    data-octicon="diamond"
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    :fill="color"
  >
    <path
      d="M.527 9.237a1.75 1.75 0 0 1 0-2.474L6.777.512a1.75 1.75 0 0 1 2.475 0l6.251 6.25a1.75 1.75 0 0 1 0 2.475l-6.25 6.251a1.75 1.75 0 0 1-2.475 0L.527 9.238Zm1.06-1.414a.25.25 0 0 0 0 .354l6.251 6.25a.25.25 0 0 0 .354 0l6.25-6.25a.25.25 0 0 0 0-.354l-6.25-6.25a.25.25 0 0 0-.354 0l-6.25 6.25Z"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string; color?: string }>(), {
  size: 16,
  color: 'currentColor',
})
</script>
