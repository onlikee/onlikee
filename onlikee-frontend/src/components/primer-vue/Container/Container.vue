<template>
  <div
    class="container"
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

<style scoped>
.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--bgColor-default, #ffffff);
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
    padding-top: 4rem;
  }
}
</style>
