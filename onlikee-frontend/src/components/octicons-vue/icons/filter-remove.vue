<template>
  <svg
    aria-hidden="true"
    focusable="false"
    data-octicon="filter-remove"
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    :fill="color"
  >
    <path
      d="M14.384 4.57a.752.752 0 0 0 1.061 0 .752.752 0 0 0 0-1.061l-.884-.884.883-.884A.75.75 0 0 0 14.384.68l-.884.884-.884-.884a.75.75 0 0 0-1.06 1.061l.883.884-.883.884a.75.75 0 0 0 1.06 1.061l.884-.884.884.884ZM.75 3a.75.75 0 0 0 0 1.5H9A.75.75 0 0 0 9 3H.75ZM3 7.75A.75.75 0 0 1 3.75 7h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 3 7.75Zm3 4a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string; color?: string }>(), {
  size: 16,
  color: 'currentColor',
})
</script>
