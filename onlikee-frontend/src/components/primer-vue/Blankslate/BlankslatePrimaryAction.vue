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
    class="blankslate-primary-action"
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
.blankslate-primary-action {
  align-items: center;
  appearance: none;
  background-color: var(--button-primary-bgColor-rest, var(--bgColor-success-emphasis, #1f883d));
  border: 1px solid var(--button-primary-borderColor-rest, var(--borderColor-translucent, #1f232826));
  border-radius: var(--borderRadius-medium, 0.375rem);
  box-shadow: var(--shadow-resting-small, var(--button-default-shadow-resting, 0 1px 0 0 #1f23280a));
  color: var(--button-primary-fgColor-rest, var(--fgColor-white, #ffffff));
  cursor: pointer;
  display: inline-flex;
  font-size: var(--text-body-size-medium, 0.875rem);
  font-weight: var(--base-text-weight-medium, 500);
  height: var(--control-medium-size, 2rem);
  justify-content: center;
  line-height: var(--text-body-lineHeight-medium, 1.5);
  margin-top: var(--blankslate-action-margin-top, 0.5rem);
  min-width: max-content;
  padding: 0 var(--control-medium-paddingInline-normal, 0.75rem);
  text-decoration: none;
  transition: 80ms cubic-bezier(0.65, 0, 0.35, 1);
  transition-property: color, background-color, border-color, box-shadow;
  user-select: none;
}

.blankslate-primary-action:hover:not(:disabled):not([aria-disabled='true']) {
  background-color: var(--button-primary-bgColor-hover, #1c8139);
}

.blankslate-primary-action:active:not(:disabled):not([aria-disabled='true']) {
  background-color: var(--button-primary-bgColor-active, #197935);
}

.blankslate-primary-action:focus-visible {
  box-shadow: inset 0 0 0 3px var(--fgColor-onEmphasis, #ffffff);
  outline: 2px solid var(--focus-outlineColor, #0969da);
  outline-offset: 2px;
}

.blankslate-primary-action:disabled,
.blankslate-primary-action[aria-disabled='true'] {
  background-color: var(--button-primary-bgColor-disabled, #95d8a6);
  border-color: var(--button-primary-borderColor-disabled, var(--button-primary-bgColor-disabled, #95d8a6));
  color: var(--button-primary-fgColor-disabled, rgba(255, 255, 255, 0.8));
  cursor: not-allowed;
}
</style>
