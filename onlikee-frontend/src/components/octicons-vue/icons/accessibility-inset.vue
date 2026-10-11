<template>
  <svg
    aria-hidden="true"
    focusable="false"
    data-octicon="accessibility-inset"
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    :fill="color"
  >
    <path
      d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM3.75 6a.75.75 0 0 0 0 1.5h2.409a1.9 1.9 0 0 0-.025.151l-.307 2.508-.323 3.011a.75.75 0 0 0 1.492.16l.25-2.33h1.509l.25 2.33a.748.748 0 0 0 1.199.552.75.75 0 0 0 .291-.712l-.32-3-.309-2.519a1.9 1.9 0 0 0-.025-.151h2.409a.75.75 0 0 0 0-1.5h-8.5ZM8 6a2 2 0 1 0 .001-3.999A2 2 0 0 0 8 6Z"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string; color?: string }>(), {
  size: 16,
  color: 'currentColor',
})
</script>
