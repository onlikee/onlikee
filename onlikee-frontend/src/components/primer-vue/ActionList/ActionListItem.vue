<template>
  <ActionListItemBase
    v-bind="{ ...props, ...$attrs }"
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
    selected?: boolean
    active?: boolean
    variant?: ActionListItemVariant
    disabled?: boolean
    loading?: boolean
    size?: ActionListItemSize
    role?: string
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    selected: false,
    active: false,
    variant: 'default',
    disabled: false,
    loading: false,
    size: 'medium',
    role: undefined,
    type: 'button'
  }
)

const emit = defineEmits<{
  select: [event: MouseEvent]
}>()
</script>
