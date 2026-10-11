<template>
  <svg
    aria-hidden="true"
    focusable="false"
    data-octicon="graph-bar-vertical"
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    :fill="color"
  >
    <path
      d="M1 15.25V.75q0-.311.22-.53.219-.22.53-.22.311 0 .53.22.22.219.22.53v14.5q0 .311-.22.53-.219.22-.53.22-.311 0-.53-.22-.22-.219-.22-.53Z"
    />
    <path
      d="M9 3.25v2.5a.25.25 0 0 1-.25.25h-6.5A.25.25 0 0 1 2 5.75v-2.5A.25.25 0 0 1 2.25 3h6.5a.25.25 0 0 1 .25.25Zm4 4v2.5a.25.25 0 0 1-.25.25H2.25A.25.25 0 0 1 2 9.75v-2.5A.25.25 0 0 1 2.25 7h10.5a.25.25 0 0 1 .25.25Zm-6 4v2.5a.25.25 0 0 1-.25.25h-4.5a.25.25 0 0 1-.25-.25v-2.5a.25.25 0 0 1 .25-.25h4.5a.25.25 0 0 1 .25.25Z"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string; color?: string }>(), {
  size: 16,
  color: 'currentColor',
})
</script>
