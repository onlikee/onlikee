<script setup lang="ts">
import { useAttrs, useCssModule } from 'vue'
import { SkeletonBox } from '../Skeleton'
import { normalizeReactStyle } from '../internal/style'
import type { SkeletonTextOptions } from './types'

defineOptions({ name: 'SkeletonText', inheritAttrs: false })
const props = withDefaults(defineProps<SkeletonTextOptions>(), { lines: 1, size: 'bodyMedium' })
const attrs = useAttrs()
const styles = useCssModule()

function getSingleLineAttrs() {
  const { class: classValue, style, ...rest } = attrs
  return {
    'data-text-skeleton-size': props.size,
    width: '100%',
    class: [props.className, classValue, styles.SkeletonText],
    style: normalizeReactStyle([style, { maxWidth: props.maxWidth }]),
    ...rest,
    'data-component': 'SkeletonText',
  }
}

function getMultilineAttrs() {
  const { class: classValue, style: _style, ...rest } = attrs
  return {
    'data-component': 'SkeletonText',
    'data-in-multiline': 'true',
    'data-text-skeleton-size': props.size,
    class: [props.className, classValue, styles.SkeletonText],
    ...rest,
  }
}
</script>

<template>
  <SkeletonBox v-if="lines < 2" v-bind="getSingleLineAttrs()" />
  <div
    v-else
    data-component="multilineContainer"
    :class="$style.SkeletonTextWrapper"
    :style="normalizeReactStyle([attrs.style, { maxWidth }])"
  >
    <SkeletonBox v-for="index in Math.floor(lines)" :key="index" v-bind="getMultilineAttrs()" />
  </div>
</template>

<style module src="./SkeletonText.module.css" />
