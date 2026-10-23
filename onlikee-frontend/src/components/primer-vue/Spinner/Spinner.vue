<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef, useAttrs, useId, watch } from 'vue'
import VisuallyHidden from '../VisuallyHidden/VisuallyHidden.vue'
import { normalizeReactStyle } from '../internal/style'
import type { SpinnerOptions } from './types'

defineOptions({ inheritAttrs: false })

const ANIMATION_DURATION_MS = 1000
const sizeMap = {
  small: '16px',
  medium: '32px',
  large: '64px',
}

const props = withDefaults(defineProps<SpinnerOptions>(), {
  size: 'medium',
  srText: 'Loading',
  delay: false,
})

const normalizedProps = props as typeof props & { ariaLabel?: string }
const attrs = useAttrs()
const labelId = useId()
const isVisible = shallowRef(!props.delay)
const syncDelay = shallowRef(isVisible.value ? computeSyncDelay() : 0)
const noMotionPreference = shallowRef(false)
const hasHiddenLabel = () => props.srText !== null && normalizedProps.ariaLabel === undefined

let motionQuery: MediaQueryList | undefined
const updateMotionPreference = () => {
  noMotionPreference.value = motionQuery?.matches ?? false
}

onMounted(() => {
  watch(
    () => props.delay,
    (delay, _previous, onCleanup) => {
      if (!delay) return
      const duration = typeof delay === 'number' ? delay : delay === 'short' ? 300 : 1000
      const timeoutId = setTimeout(() => {
        isVisible.value = true
        syncDelay.value = computeSyncDelay()
      }, duration)
      onCleanup(() => clearTimeout(timeoutId))
    },
    { immediate: true },
  )
  motionQuery = window.matchMedia?.('(prefers-reduced-motion: no-preference)')
  updateMotionPreference()
  if (motionQuery?.addEventListener) {
    motionQuery.addEventListener('change', updateMotionPreference)
  } else {
    motionQuery?.addListener(updateMotionPreference)
  }
})

onUnmounted(() => {
  if (motionQuery?.removeEventListener) {
    motionQuery.removeEventListener('change', updateMotionPreference)
  } else {
    motionQuery?.removeListener(updateMotionPreference)
  }
})

function computeSyncDelay(): number {
  return typeof performance === 'undefined' ? 0 : -(performance.now() % ANIMATION_DURATION_MS)
}
</script>

<template>
  <span v-if="isVisible" :class="$style['spinner']" data-component="Spinner">
    <svg
      :height="sizeMap[size]"
      :width="sizeMap[size]"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      :aria-label="normalizedProps.ariaLabel ?? undefined"
      :aria-labelledby="hasHiddenLabel() ? labelId : undefined"
      v-bind="$attrs"
      :class="[className, $style['spinner__animation']]"
      :style="[
        normalizeReactStyle(attrs.style),
        noMotionPreference ? { animationDelay: `${syncDelay}ms` } : undefined,
      ]"
    >
      <circle
        cx="8"
        cy="8"
        r="7"
        stroke="currentColor"
        stroke-opacity="0.25"
        stroke-width="2"
        vector-effect="non-scaling-stroke"
      />
      <path
        d="M15 8a7.002 7.002 0 00-7-7"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        vector-effect="non-scaling-stroke"
      />
    </svg>
    <VisuallyHidden v-if="hasHiddenLabel()" :id="labelId">{{ srText }}</VisuallyHidden>
  </span>
</template>
<style module src="./Spinner.module.css" />
