<template>
  <svg
    aria-hidden="true"
    focusable="false"
    data-octicon="iterations"
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    :fill="color"
  >
    <path
      d="M2.5 7.25a4.75 4.75 0 0 1 9.5 0 .75.75 0 0 0 1.5 0 6.25 6.25 0 1 0-6.25 6.25H12v2.146c0 .223.27.335.427.177l2.896-2.896a.25.25 0 0 0 0-.354l-2.896-2.896a.25.25 0 0 0-.427.177V12H7.25A4.75 4.75 0 0 1 2.5 7.25Z"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string; color?: string }>(), {
  size: 16,
  color: 'currentColor',
})
</script>
