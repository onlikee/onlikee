<script setup lang="ts">
import { computed, shallowRef, useAttrs } from 'vue'
import { TriangleDownIcon } from '@/components/octicons-vue3'
import { Button } from '../Button'
import Anchor from './ActionMenuAnchor.vue'
import type { ActionMenuButtonProps } from './types'

defineOptions({
  name: 'ActionMenuButton',
  __SLOT__: Symbol('ActionMenu.Button'),
  inheritAttrs: false,
})
const props = withDefaults(defineProps<ActionMenuButtonProps>(), {
  type: 'button',
  loading: undefined,
  inactive: undefined,
  labelWrap: undefined,
  trailingAction: () => TriangleDownIcon,
})
const button = shallowRef<{ element: HTMLElement | null } | null>(null)
const attrs = useAttrs()
const anchorId = computed(() => attrs.id as string | undefined)
const iconButtonOnlyProps = new Set([
  'description',
  'tooltipDirection',
  'tooltip-direction',
  'unsafeDisableTooltip',
  'unsafe-disable-tooltip',
  'keyshortcuts',
  'keybindingHint',
  'keybinding-hint',
])
function buttonAttrs() {
  return Object.fromEntries(
    Object.entries(attrs).filter(([name]) => !iconButtonOnlyProps.has(name)),
  )
}
defineExpose({
  element: computed(() => button.value?.element ?? null),
  focus: () => button.value?.element?.focus(),
})
</script>

<template>
  <Anchor :id="anchorId">
    <Button v-bind="{ ...props, ...buttonAttrs() }" ref="button" data-component="ActionMenu.Button">
      <slot />
    </Button>
  </Anchor>
</template>
