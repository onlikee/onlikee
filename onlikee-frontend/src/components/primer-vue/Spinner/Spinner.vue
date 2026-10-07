<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef, useAttrs, useId, watch } from 'vue'

defineOptions({ inheritAttrs: false })

const ANIMATION_DURATION_MS = 1000
const sizeMap = {
  small: '16px',
  medium: '32px',
  large: '64px',
}

const props = withDefaults(defineProps<{
  size?: keyof typeof sizeMap
  srText?: string | null
  delay?: boolean | 'short' | 'long' | number
}>(), {
  size: 'medium',
  srText: 'Loading',
  delay: false,
})

const attrs = useAttrs()
const labelId = useId()
const isVisible = shallowRef(!props.delay)
const syncDelay = shallowRef(isVisible.value ? computeSyncDelay() : 0)
const noMotionPreference = shallowRef(false)
const hasHiddenLabel = () => props.srText !== null && attrs['aria-label'] === undefined

watch(() => props.delay, (delay, _previous, onCleanup) => {
  if (!delay) return

  const duration = typeof delay === 'number' ? delay : delay === 'short' ? 300 : 1000
  const timeoutId = window.setTimeout(() => {
    isVisible.value = true
    syncDelay.value = computeSyncDelay()
  }, duration)
  onCleanup(() => window.clearTimeout(timeoutId))
}, { immediate: true })

let motionQuery: MediaQueryList | undefined
const updateMotionPreference = () => {
  noMotionPreference.value = motionQuery?.matches ?? false
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: no-preference)')
  updateMotionPreference()
  motionQuery.addEventListener('change', updateMotionPreference)
})

onUnmounted(() => motionQuery?.removeEventListener('change', updateMotionPreference))

function computeSyncDelay(): number {
  return -(performance.now() % ANIMATION_DURATION_MS)
}
</script>

<template>
  <span
    v-if="isVisible"
    :class="$style['spinner']"
    data-component="Spinner"
  >
    <svg
      v-bind="$attrs"
      :class="$style['spinner__animation']"
      :style="noMotionPreference ? { animationDelay: `${syncDelay}ms` } : undefined"
      :height="sizeMap[size]"
      :width="sizeMap[size]"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      :aria-labelledby="hasHiddenLabel() ? labelId : undefined"
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
    <span
      v-if="hasHiddenLabel()"
      :id="labelId"
      :class="$style['spinner__sr-only']"
    >{{ srText }}</span>
  </span>
</template>
<style module src="./Spinner.module.css" />
