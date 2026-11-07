<script setup lang="ts">
import { computed, h, shallowRef, useAttrs, useSlots, type Component } from 'vue'
import { Button } from '../Button'
import type { ButtonInstance } from '../Button/types'

defineOptions({ name: 'BannerPrimaryAction', inheritAttrs: false })
const props = defineProps<{ as?: string | Component; className?: string }>()
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
const slots = useSlots()
const button = shallowRef<ButtonInstance | null>(null)
const element = computed(() => button.value?.element ?? null)
const Render = () =>
  h(
    Button,
    {
      'data-component': 'Banner.PrimaryAction',
      variant: 'default',
      ...attrs,
      as: props.as,
      className: ['BannerPrimaryAction', props.className].filter(Boolean).join(' '),
      ref: button,
    },
    slots.default ? { default: slots.default } : undefined,
  )
defineExpose({ element })
</script>

<template>
  <Render />
</template>
