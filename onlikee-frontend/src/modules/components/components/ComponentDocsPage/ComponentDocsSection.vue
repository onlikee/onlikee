<template>
  <section :class="variant === 'api' ? 'api-section' : 'demo-section'">
    <h2 class="section-title">
      {{ title }}
    </h2>
    <p v-if="$slots.description" class="section-description">
      <slot name="description" />
    </p>
    <slot />
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    variant?: 'demo' | 'api'
  }>(),
  {
    variant: 'demo',
  },
)
</script>

<style scoped>
.demo-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--fgColor-default);
  margin-bottom: 0.75rem;
}

.section-description {
  color: var(--fgColor-muted);
  margin-bottom: 1rem;
  line-height: 1.6;
}

.section-description code {
  padding: 0.125rem 0.375rem;
  background: var(--bgColor-muted);
  border: 1px solid var(--borderColor-default);
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.875em;
  color: var(--fgColor-default);
}

.api-section {
  margin-top: 3rem;
}

@media (max-width: 768px) {
  .demo-section {
    margin-bottom: 2rem;
  }

  .section-title {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .section-description {
    font-size: 0.875rem;
  }

  .api-section {
    margin-top: 2rem;
  }
}
</style>
