<template>
  <span
    :style="progressStyle"
    v-bind="$attrs"
    :class="$style['progress-bar__item']"
    data-component="ProgressBar.Item"
    role="progressbar"
    :aria-valuenow="ariaValueNow"
    :aria-valuemin="0"
    :aria-valuemax="100"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    progress?: string | number
    bg?: string
    ariaValuenow?: number | string
  }>(),
  {
    progress: undefined,
    bg: 'success.emphasis',
    ariaValuenow: undefined,
  },
)

const ariaValueNow = computed(() => {
  const progress =
    typeof props.progress === 'string' ? parseInt(props.progress, 10) : props.progress
  return props.ariaValuenow ?? (progress !== undefined && progress >= 0 ? Math.round(progress) : 0)
})

const progressStyle = computed(() => {
  const [color, emphasis = 'emphasis'] = (props.bg || 'success.emphasis').split('.')
  return {
    '--progress-width': props.progress ? `${props.progress}%` : '0%',
    '--progress-bg': `var(--bgColor-${color}-${emphasis}, var(--bgColor-success-emphasis, #1f883d))`,
  }
})
</script>
<style module src="./ProgressBarItem.module.css" />
