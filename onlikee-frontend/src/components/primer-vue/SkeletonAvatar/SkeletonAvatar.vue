<script setup lang="ts">
import { computed, useAttrs, useCssModule } from 'vue'
import { SkeletonBox } from '../Skeleton'
import { normalizeReactStyle } from '../internal/style'
import type { SkeletonAvatarOptions } from './types'

defineOptions({ name: 'SkeletonAvatar', inheritAttrs: false })
const props = withDefaults(defineProps<SkeletonAvatarOptions>(), { size: 20 })
const attrs = useAttrs()
const styles = useCssModule()
const responsive = computed(
  () =>
    typeof props.size === 'object' &&
    Object.keys(props.size).some((key) => ['narrow', 'regular', 'wide'].includes(key)),
)
const cssSizeVars = computed(() => {
  const variables: Record<string, string> = {}
  if (responsive.value) {
    for (const [key, value] of Object.entries(props.size)) {
      variables[`--avatarSize-${key}`] = `${value}px`
    }
  } else {
    variables['--avatarSize-regular'] = `${props.size}px`
  }
  return variables
})

function getAvatarAttrs() {
  const { class: classValue, style, ...rest } = attrs
  return {
    class: [props.className, classValue, styles.SkeletonAvatar],
    ...rest,
    'data-component': 'SkeletonAvatar',
    'data-responsive': responsive.value ? '' : undefined,
    'data-square': props.square ? '' : undefined,
    style: normalizeReactStyle([style, cssSizeVars.value]),
  }
}
</script>

<template>
  <SkeletonBox v-bind="getAvatarAttrs()" />
</template>

<style module src="./SkeletonAvatar.module.css" />
