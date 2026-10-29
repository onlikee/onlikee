<script setup lang="ts">
import { useAttrs, useTemplateRef } from 'vue'
import {
  AlertIcon,
  CheckCircleIcon,
  InfoIcon,
  LightBulbIcon,
  StopIcon,
} from '@onlikee/octicons-vue'
import { VisuallyHidden } from '../VisuallyHidden'
import type { AdmonitionComponentProps, AdmonitionType } from './types'

defineOptions({ name: 'Admonition', inheritAttrs: false })
const props = withDefaults(defineProps<AdmonitionComponentProps>(), {
  type: 'info',
  titleAs: 'div',
})
defineSlots<{
  default?: () => unknown
  title?: () => unknown
}>()

const attrs = useAttrs()
const element = useTemplateRef<HTMLDivElement>('root')
const icons = {
  critical: StopIcon,
  info: InfoIcon,
  success: CheckCircleIcon,
  upsell: LightBulbIcon,
  warning: AlertIcon,
}
const labels: Record<AdmonitionType, string> = {
  critical: 'Critical',
  info: 'Information',
  success: 'Success',
  upsell: 'Recommendation',
  warning: 'Warning',
}

function getRootAttrs() {
  const { class: classValue, ...rest } = attrs
  return {
    role: 'note',
    ...rest,
    class: [props.className, classValue],
    'data-component': 'Admonition',
    'data-type': props.type,
  }
}

defineExpose({ element })
</script>

<template>
  <div v-bind="getRootAttrs()" ref="root" :class="$style.Admonition">
    <div :class="$style.Visual" aria-hidden="true">
      <component :is="icons[type]" :size="16" />
    </div>
    <div :class="$style.Body">
      <VisuallyHidden v-if="typeLabel !== ''">{{ typeLabel ?? labels[type] }}: </VisuallyHidden>
      <component :is="titleAs" v-if="title || $slots.title" :class="$style.Title">
        <slot name="title">{{ title }}</slot>
      </component>
      <div :class="$style.Content"><slot /></div>
    </div>
  </div>
</template>

<style module src="./Admonition.module.css" />
