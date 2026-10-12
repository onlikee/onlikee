<script setup lang="ts">
import { h, useAttrs, useSlots } from 'vue'
import { Button } from '../Button'
import { useBlankslate } from './context'

defineOptions({ name: 'BlankslatePrimaryAction', inheritAttrs: false })
const props = defineProps<{ href?: string }>()
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
const slots = useSlots()
const { size } = useBlankslate()
const Render = () => {
  const bindings: Record<string, unknown> = {
    ...attrs,
    as: props.href ? 'a' : 'button',
    href: props.href,
    variant: 'primary',
    size: size.value === 'small' ? 'small' : undefined,
  }
  return h(Button, bindings, slots.default ? { default: slots.default } : undefined)
}
</script>

<template>
  <div :class="['Blankslate-Action', $style.Action]" data-component="Blankslate.PrimaryAction">
    <Render />
  </div>
</template>

<style module src="./Blankslate.module.css" />
