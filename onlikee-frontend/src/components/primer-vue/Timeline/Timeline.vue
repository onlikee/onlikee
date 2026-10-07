<script setup lang="ts">
withDefaults(defineProps<{
  clipSidebar?: boolean
}>(), {
  clipSidebar: false
})
</script>

<template>
  <div
    :class="[$style['timeline']]"
    :data-clip-sidebar="clipSidebar ? '' : null"
  >
    <slot />
  </div>
</template>

<style module src="./Timeline.module.css"></style>
