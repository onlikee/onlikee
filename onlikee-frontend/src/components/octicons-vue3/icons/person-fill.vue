<template>
  <svg
    aria-hidden="true"
    focusable="false"
    data-octicon="person-fill"
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    :fill="color"
  >
    <path
      d="M4.243 4.757a3.757 3.757 0 1 1 5.851 3.119 6.006 6.006 0 0 1 3.9 5.339.75.75 0 0 1-.715.784H2.721a.75.75 0 0 1-.714-.784 6.006 6.006 0 0 1 3.9-5.34 3.753 3.753 0 0 1-1.664-3.118Z"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string; color?: string }>(), {
  size: 16,
  color: 'currentColor',
})
</script>
