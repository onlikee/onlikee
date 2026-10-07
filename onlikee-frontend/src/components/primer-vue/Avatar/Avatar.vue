<template>
  <img
    v-if="src"
    :src="src"
    :alt="alt"
    :width="typeof size === 'number' ? size : undefined"
    :height="typeof size === 'number' ? size : undefined"
    :class="[$style['avatar']]"
    data-component="Avatar"
    :data-square="square ? '' : undefined"
    :data-responsive="isResponsive ? '' : undefined"
    :style="avatarStyle"
    v-bind="$attrs"
  >
  <span
    v-else
    :class="[$style['avatar'], $style['avatar-placeholder'], 'avatar-placeholder']"
    data-component="Avatar"
    :data-square="square ? '' : undefined"
    :data-responsive="isResponsive ? '' : undefined"
    :style="avatarStyle"
    :role="alt ? 'img' : undefined"
    :aria-label="alt || undefined"
    v-bind="$attrs"
  >{{ placeholder }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AvatarProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<AvatarProps>(), {
  size: 20,
  square: false,
  alt: '',
  placeholder: ''
})

const isResponsive = computed(() => typeof props.size === 'object')
const avatarStyle = computed(() => {
  const variables: Record<string, string> = {}
  if (typeof props.size === 'number') {
    variables['--avatarSize-regular'] = `${props.size}px`
  } else {
    for (const [key, value] of Object.entries(props.size)) {
      variables[`--avatarSize-${key}`] = `${value}px`
    }
  }
  return variables
})
</script>

<style module src="./Avatar.module.css"></style>
