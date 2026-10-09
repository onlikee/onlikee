<template>
  <header class="page-header">
    <h1 class="page-title">
      {{ title }}
    </h1>
    <p v-if="description || $slots.description" class="page-description">
      <slot name="description">
        {{ description }}
      </slot>
    </p>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<style scoped>
.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--fgColor-default);
  margin-bottom: 0.5rem;
}

.page-description {
  font-size: 1rem;
  color: var(--fgColor-muted);
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
    margin-bottom: 0.375rem;
  }

  .page-description {
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
  }
}
</style>
