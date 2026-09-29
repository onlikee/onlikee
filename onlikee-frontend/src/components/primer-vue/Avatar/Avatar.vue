<template>
  <img
    v-if="src"
    :src="src"
    :alt="alt"
    :width="typeof size === 'number' ? size : undefined"
    :height="typeof size === 'number' ? size : undefined"
    class="avatar"
    data-component="Avatar"
    :data-square="square ? '' : undefined"
    :data-responsive="isResponsive ? '' : undefined"
    :style="avatarStyle"
    v-bind="$attrs"
  >
  <span
    v-else
    class="avatar avatar-placeholder"
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

<style scoped>
:where(.avatar) {
  display: inline-block;
  width: var(--avatarSize-regular);
  height: var(--avatarSize-regular);
  overflow: hidden;
  line-height: 1;
  vertical-align: middle;
  border-radius: 50%;
  box-shadow: 0 0 0 1px var(--avatar-borderColor, #1f232826);
}

:where(.avatar[data-square]) {
  border-radius: clamp(4px, calc(var(--avatarSize-regular) - 24px), var(--borderRadius-medium, 6px));
}

:where(.avatar-placeholder) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: calc(var(--avatarSize-regular) * 0.35);
  font-weight: 600;
  color: var(--fgColor-default, #1f2328);
}

@media (width < 768px) {
  :where(.avatar[data-responsive]) {
    width: var(--avatarSize-narrow);
    height: var(--avatarSize-narrow);
  }

  :where(.avatar-placeholder[data-responsive]) {
    font-size: calc(var(--avatarSize-narrow) * 0.35);
  }
}

@media (min-width: 768px) {
  :where(.avatar[data-responsive]) {
    width: var(--avatarSize-regular);
    height: var(--avatarSize-regular);
  }
}

@media (min-width: 1400px) {
  :where(.avatar[data-responsive]) {
    width: var(--avatarSize-wide);
    height: var(--avatarSize-wide);
  }

  :where(.avatar-placeholder[data-responsive]) {
    font-size: calc(var(--avatarSize-wide) * 0.35);
  }
}
</style>
