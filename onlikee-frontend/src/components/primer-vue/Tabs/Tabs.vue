<script setup lang="ts">
import { computed, provide, shallowRef, useId, watch } from 'vue'
import { tabsKey } from './context'
import type { TabsProps } from './types'

defineOptions({ name: 'Tabs', inheritAttrs: false })
const props = defineProps<TabsProps>()
defineSlots<{ default?: () => unknown }>()
const generatedId = useId()
const controlled = props.value !== undefined
const value = shallowRef(props.value ?? props.defaultValue)
const selectedValue = computed(() => (controlled ? props.value : value.value))
const focusedValue = shallowRef<string>()

if (import.meta.env.DEV) {
  watch(
    () => props.value !== undefined,
    (next) => {
      if (next !== controlled)
        console.warn(
          `A component is changing ${controlled ? 'a controlled' : 'an uncontrolled'} tab-selection component to be ${next ? 'controlled' : 'uncontrolled'}. Decide between using a controlled or uncontrolled value for the lifetime of the component.`,
        )
    },
  )
}

provide(tabsKey, {
  groupId: computed(() => props.id ?? generatedId),
  selectedValue,
  activationMode: computed(() => props.activationMode ?? 'automatic'),
  focusedValue,
  selectTab(next) {
    focusedValue.value = undefined
    if (next === selectedValue.value) return
    if (!controlled) value.value = next
    props.onValueChange?.({ value: next })
  },
  focusTab(next) {
    focusedValue.value = next
  },
})
</script>

<template><slot /></template>
