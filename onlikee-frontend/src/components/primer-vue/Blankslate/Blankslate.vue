<script setup lang="ts">
withDefaults(
  defineProps<{
    border?: boolean
    narrow?: boolean
    spacious?: boolean
    size?: 'small' | 'medium' | 'large'
  }>(),
  {
    border: false,
    narrow: false,
    spacious: false,
    size: 'medium'
  }
)
</script>

<template>
  <section
    class="blankslate-container"
  >
    <div
      class="blankslate"
      :class="{
        'blankslate--border': border,
        'blankslate--narrow': narrow,
        'blankslate--spacious': spacious
      }"
      :data-size="size"
    >
      <slot />
    </div>
  </section>
</template>

<style scoped>
.blankslate-container {
  container-type: inline-size;
  min-width: 0;
  width: 100%;
}

.blankslate {
  --blankslate-max-width: 520px;
  --blankslate-padding-block: 2rem;
  --blankslate-padding-inline: 2rem;
  --blankslate-gap: 0.75rem;
  --blankslate-visual-size: 32px;
  --blankslate-heading-size: 1.5rem;
  --blankslate-heading-line-height: 1.333;
  --blankslate-description-size: 0.875rem;
  --blankslate-action-margin-top: 0.5rem;
  --blankslate-secondary-margin-top: 0.25rem;

  align-items: center;
  color: var(--fgColor-default, #1f2328);
  display: flex;
  flex-direction: column;
  gap: var(--blankslate-gap);
  margin-inline: auto;
  max-width: var(--blankslate-max-width);
  padding: var(--blankslate-padding-block) var(--blankslate-padding-inline);
  text-align: center;
  width: 100%;
}

.blankslate--border {
  border: 1px solid var(--borderColor-default, #d1d9e0);
  border-radius: var(--borderRadius-medium, 0.375rem);
}

.blankslate--narrow {
  --blankslate-max-width: 320px;
  --blankslate-padding-block: 1.5rem;
  --blankslate-padding-inline: 1rem;
  --blankslate-gap: 0.5rem;
  --blankslate-visual-size: 24px;
  --blankslate-heading-size: 1.25rem;
  --blankslate-description-size: 0.8125rem;
}

.blankslate--spacious {
  --blankslate-padding-block: 4rem;
  --blankslate-padding-inline: 2rem;
  --blankslate-gap: 1rem;
}

.blankslate[data-size='small'] {
  --blankslate-max-width: 360px;
  --blankslate-padding-block: 1.5rem;
  --blankslate-padding-inline: 1rem;
  --blankslate-gap: 0.5rem;
  --blankslate-visual-size: 24px;
  --blankslate-heading-size: 1.25rem;
  --blankslate-description-size: 0.8125rem;
}

.blankslate[data-size='large'] {
  --blankslate-max-width: 620px;
  --blankslate-padding-block: 3rem;
  --blankslate-padding-inline: 2rem;
  --blankslate-gap: 1rem;
  --blankslate-visual-size: 40px;
  --blankslate-heading-size: 1.75rem;
}

@container (max-width: 360px) {
  .blankslate {
    --blankslate-padding-block: 1.5rem;
    --blankslate-padding-inline: 1rem;
    --blankslate-gap: 0.5rem;
    --blankslate-visual-size: 24px;
    --blankslate-heading-size: 1.25rem;
    --blankslate-description-size: 0.8125rem;
  }
}
</style>
