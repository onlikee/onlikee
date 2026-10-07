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
    :class="$style['blankslate-secondary-action']"
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

<style module src="./BlankslateSecondaryAction.module.css"></style>
