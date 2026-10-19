<script setup lang="ts">
import { h, isVNode, useAttrs, useCssModule, type FunctionalComponent } from 'vue'
import {
  AlertFillIcon,
  AlertIcon,
  CheckCircleFillIcon,
  CheckCircleIcon,
  InfoIcon,
} from '@onlikee/octicons-vue'
import { renderNode } from '../internal/renderNode'
import type { InlineMessageComponentProps } from './types'

defineOptions({ name: 'InlineMessage', inheritAttrs: false })
const props = withDefaults(defineProps<InlineMessageComponentProps>(), {
  size: 'medium',
  leadingVisual: undefined,
})
defineSlots<{ default?: () => unknown }>()

const attrs = useAttrs()
const styles = useCssModule()
const icons = {
  warning: AlertIcon,
  critical: AlertIcon,
  success: CheckCircleIcon,
  unavailable: AlertIcon,
}
const smallIcons = {
  warning: AlertFillIcon,
  critical: AlertFillIcon,
  success: CheckCircleFillIcon,
  unavailable: AlertFillIcon,
}

const LeadingVisual: FunctionalComponent = () => {
  const iconClass = { class: styles.InlineMessageIcon }
  if (props.leadingVisual !== undefined) {
    return renderNode(props.leadingVisual, isVNode(props.leadingVisual) ? undefined : iconClass)
  }
  if (props.variant) {
    return props.size === 'small'
      ? h(smallIcons[props.variant], { ...iconClass, size: 12 })
      : h(icons[props.variant], iconClass)
  }
  return h(InfoIcon, iconClass)
}

function getRootAttrs() {
  const { class: classValue, ...rest } = attrs
  return {
    ...rest,
    class: [props.className, classValue, styles.InlineMessage],
    'data-size': props.size,
    'data-variant': props.variant,
    'data-component': 'InlineMessage',
  }
}
</script>

<template>
  <div v-bind="getRootAttrs()">
    <LeadingVisual />
    <slot />
  </div>
</template>

<style module src="./InlineMessage.module.css" />
