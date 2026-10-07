<script setup lang="ts">
</script>

<template>
  <div
    :class="$style['blankslate-visual']"
    aria-hidden="true"
  >
    <slot />
  </div>
</template>

<style module src="./BlankslateVisual.module.css"></style>
