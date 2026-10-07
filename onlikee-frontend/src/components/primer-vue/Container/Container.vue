<template>
  <div
    :class="$style['container']"
    :style="{ '--container-max-width': maxWidth }"
  >
    <slot />
  </div>
</template>


<script setup lang="ts">
withDefaults(
  defineProps<{
    maxWidth?: string
  }>(),
  {
    maxWidth: '1150px'
  }
)
</script>

<style module src="./Container.module.css"></style>
