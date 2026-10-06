<script setup lang="ts">
import { computed, shallowRef, useAttrs } from 'vue'
import { TriangleDownIcon } from '@/components/octicons-vue3'
import Button from '../SelectPanel/SelectPanelButton.vue'
import Anchor from './ActionMenuAnchor.vue'
import type { ActionMenuButtonProps } from './types'

defineOptions({ name: 'ActionMenuButton', __SLOT__: Symbol('ActionMenu.Button'), inheritAttrs: false })
const props = withDefaults(defineProps<ActionMenuButtonProps>(), {
  loading: undefined, inactive: undefined, labelWrap: undefined, trailingAction: () => TriangleDownIcon
})
const button = shallowRef<{ element: HTMLElement | null } | null>(null)
const attrs = useAttrs()
const anchorId = computed(() => attrs.id as string | undefined)
defineExpose({ element: computed(() => button.value?.element ?? null), focus: () => button.value?.element?.focus() })
</script>

<template>
  <Anchor :id="anchorId">
    <Button
      v-bind="{ ...props, ...$attrs }"
      ref="button"
      data-component="ActionMenu.Button"
    >
      <slot />
    </Button>
  </Anchor>
</template>
