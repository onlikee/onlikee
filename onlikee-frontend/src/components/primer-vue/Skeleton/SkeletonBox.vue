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
import { normalizeReactStyle } from '../internal/style'

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
defineExpose({ element })
</script>

<template>
  <div
    v-if="isVisible"
    ref="element"
    v-bind="attrs"
    :class="[className, $style.SkeletonBox]"
    :style="normalizeReactStyle([{ height, width }, attrs.style])"
    :data-component="
      attrs['data-component'] === undefined ? 'SkeletonBox' : attrs['data-component']
    "
  />
</template>

<style module src="./SkeletonBox.module.css" />
