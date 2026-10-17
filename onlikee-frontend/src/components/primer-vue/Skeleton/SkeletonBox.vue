<script setup lang="ts">
import {
  onBeforeUnmount,
  onMounted,
  shallowRef,
  ref,
  useAttrs,
  watch,
  type WatchStopHandle,
} from 'vue'
import type { SkeletonBoxOptions } from './types'

defineOptions({ name: 'SkeletonBox', inheritAttrs: false })
const props = defineProps<SkeletonBoxOptions>()
const attrs = useAttrs()
const element = shallowRef<HTMLDivElement | null>(null)
const isVisible = ref(!props.delay)
let stop: WatchStopHandle | undefined
onMounted(() => {
  stop = watch(
    () => props.delay,
    (delay, _previous, cleanup) => {
      if (!delay) return
      const timeout = setTimeout(
        () => (isVisible.value = true),
        typeof delay === 'number' ? delay : delay === 'short' ? 300 : 1000,
      )
      cleanup(() => clearTimeout(timeout))
    },
    { immediate: true },
  )
})
onBeforeUnmount(() => stop?.())
function length(value: string | number | undefined) {
  return typeof value === 'number' ? `${value}px` : value
}
defineExpose({ element })
</script>

<template>
  <div
    v-if="isVisible"
    ref="element"
    v-bind="attrs"
    :class="[className, $style.SkeletonBox]"
    :style="[{ height: length(height), width: length(width) }, attrs.style as never]"
    :data-component="dataComponent ?? 'SkeletonBox'"
  />
</template>

<style module src="./SkeletonBox.module.css" />
