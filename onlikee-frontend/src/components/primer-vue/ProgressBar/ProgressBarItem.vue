<template>
  <span
    :style="progressStyle"
    v-bind="$attrs"
    class="progress-bar__item"
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

const props = withDefaults(defineProps<{
  progress?: string | number
  bg?: string
  ariaValuenow?: number | string
}>(), {
  progress: undefined,
  bg: 'success.emphasis',
  ariaValuenow: undefined
})

const ariaValueNow = computed(() => {
  const progress = typeof props.progress === 'string' ? parseInt(props.progress, 10) : props.progress
  return props.ariaValuenow ?? (progress !== undefined && progress >= 0 ? Math.round(progress) : 0)
})

const progressStyle = computed(() => {
  const [color, emphasis = 'emphasis'] = (props.bg || 'success.emphasis').split('.')
  return {
    '--progress-width': props.progress ? `${props.progress}%` : '0%',
    '--progress-bg': `var(--bgColor-${color}-${emphasis}, var(--bgColor-success-emphasis, #1f883d))`
  }
})
</script>

<style scoped>
.progress-bar__item {
  width: var(--progress-width);
  background-color: var(--progress-bg);
}

@media (prefers-reduced-motion: no-preference) {
  .progress-bar__item[data-animated='true'] {
    mask-image: linear-gradient(75deg, #000 30%, rgb(0, 0, 0, 0.65) 80%);
    mask-size: 200%;
    animation: shimmer 1s infinite;
  }
}

@keyframes shimmer {
  from {
    mask-position: 200%;
  }

  to {
    mask-position: 0%;
  }
}

@media (forced-colors: active) {
  .progress-bar__item {
    background-color: LinkText;
    forced-color-adjust: none;
  }
}
</style>
