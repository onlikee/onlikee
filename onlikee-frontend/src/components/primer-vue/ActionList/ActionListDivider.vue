<script setup lang="ts">
import { normalizeReactStyle } from '../internal/style'
import type { ActionListDividerProps } from './types'
defineOptions({ name: 'ActionListDivider', __SLOT__: Symbol('ActionList.Divider'), inheritAttrs: false })
defineProps<ActionListDividerProps>()
</script>
<template>
  <li
    class="action-list-divider"
    :class="[className, $attrs.class]"
    :style="normalizeReactStyle(style ?? $attrs.style)"
    aria-hidden="true"
    data-component="ActionList.Divider"
  />
</template>
