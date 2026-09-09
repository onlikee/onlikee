<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    href?: string
    newTab?: boolean
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  {
    href: '',
    newTab: false,
    type: 'button',
    disabled: false
  }
)

const emit = defineEmits<{ click: [] }>()

const handleClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault()
    return
  }

  emit('click')
}
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    class="blankslate-secondary-action"
    :href="href && !disabled ? href : undefined"
    :target="href ? (newTab ? '_blank' : '_self') : undefined"
    :rel="href && newTab ? 'noopener noreferrer' : undefined"
    :type="href ? undefined : type"
    :disabled="href ? undefined : disabled"
    :aria-disabled="disabled ? 'true' : undefined"
    @click="handleClick"
  >
    <slot />
  </component>
</template>

<style scoped>
.blankslate-secondary-action {
  appearance: none;
  background: transparent;
  border: 0;
  border-radius: 3px;
  color: var(--fgColor-link, #0969da);
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-size: var(--text-body-size-medium, 0.875rem);
  line-height: var(--text-body-lineHeight-medium, 1.5);
  margin-top: var(--blankslate-secondary-margin-top, 0.25rem);
  padding: 0;
  text-decoration: none;
}

.blankslate-secondary-action:hover:not(:disabled):not([aria-disabled='true']) {
  text-decoration: underline;
}

.blankslate-secondary-action:focus-visible {
  outline: 2px solid var(--focus-outlineColor, #0969da);
  outline-offset: 2px;
}

.blankslate-secondary-action:disabled,
.blankslate-secondary-action[aria-disabled='true'] {
  color: var(--control-fgColor-disabled, #8c959f);
  cursor: not-allowed;
}
</style>
