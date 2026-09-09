<template>
  <ActionListItemBase
    v-bind="{ ...props, ...$attrs }"
    as="a"
    @select="event => emit('select', event)"
  >
    <slot />
  </ActionListItemBase>
</template>

<script setup lang="ts">
import ActionListItemBase from './ActionListItemBase.vue'
import type { ActionListItemSize, ActionListItemVariant } from './context'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    href: string
    newTab?: boolean
    target?: string
    rel?: string
    selected?: boolean
    active?: boolean
    variant?: ActionListItemVariant
    disabled?: boolean
    loading?: boolean
    size?: ActionListItemSize
    role?: string
  }>(),
  {
    newTab: false,
    target: undefined,
    rel: undefined,
    selected: false,
    active: false,
    variant: 'default',
    disabled: false,
    loading: false,
    size: 'medium',
    role: undefined
  }
)

const emit = defineEmits<{
  select: [event: MouseEvent]
}>()
</script>
