<script setup lang="ts">
import { useAttrs, useTemplateRef } from 'vue'
import classes from './ProgressBar.module.css'
import { normalizeReactStyle } from '../internal/style'
import type { ProgressBarItemComponentProps, ProgressBarItemProps } from './types'

defineOptions({ name: 'ProgressBarItem', inheritAttrs: false })

const props = defineProps<ProgressBarItemComponentProps>()
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs() as ProgressBarItemProps
const element = useTemplateRef<HTMLSpanElement>('element')

function getItemAttrs() {
  const { class: classValue, style, 'aria-valuenow': ariaValueNow, ...rest } = attrs
  const progress = typeof props.progress === 'string' ? parseFloat(props.progress) : props.progress
  const bgType = props.bg && props.bg.split('.')

  return {
    'data-component': 'ProgressBar.Item',
    class: [props.className, classValue, classes.ProgressBarItem],
    ...rest,
    role: 'progressbar',
    style: [
      {
        '--progress-width': props.progress ? `${props.progress}%` : '0%',
        '--progress-bg': bgType
          ? `var(--bgColor-${bgType[0]}-${bgType[1] || 'emphasis'})`
          : 'var(--bgColor-success-emphasis)',
      },
      normalizeReactStyle(style),
    ],
    'aria-valuenow':
      ariaValueNow ?? (progress !== undefined && progress >= 0 ? Math.round(progress) : 0),
    'aria-valuemin': 0,
    'aria-valuemax': 100,
  }
}

defineExpose({ element })
</script>

<template>
  <span ref="element" v-bind="getItemAttrs()"><slot /></span>
</template>
