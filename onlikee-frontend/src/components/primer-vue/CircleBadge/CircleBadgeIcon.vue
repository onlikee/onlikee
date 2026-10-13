<script setup lang="ts">
import { useAttrs } from 'vue'
import type { CircleBadgeIconComponentProps } from './types'
import classes from './CircleBadge.module.css'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'CircleBadgeIcon', inheritAttrs: false })
const props = defineProps<CircleBadgeIconComponentProps>()
const attrs = useAttrs()
function bindings() {
  const { icon: _icon, className, ...rest } = props
  return {
    ...rest,
    ...attrs,
    'data-component': 'CircleBadge.Icon',
    class: [classes['prc-CircleBadge-CircleBadgeIcon'], className, attrs.class],
    style: normalizeReactStyle(attrs.style),
  }
}
</script>

<template>
  <component :is="icon" v-bind="bindings()" />
</template>
