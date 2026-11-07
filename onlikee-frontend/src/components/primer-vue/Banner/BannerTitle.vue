<script setup lang="ts" generic="As extends BannerHeadingElement = 'h2'">
import { inject, useAttrs } from 'vue'
import { bannerContextKey } from './context'
import type { BannerHeadingElement, BannerTitleComponentProps } from './types'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'BannerTitle', inheritAttrs: false })
defineProps<BannerTitleComponentProps<As>>()
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
const context = inject(bannerContextKey, undefined)
</script>

<template>
  <component
    :is="as ?? 'h2'"
    v-bind="attrs"
    :id="attrs.id ?? context?.titleId"
    :class="[className, attrs.class, $style.BannerTitle]"
    :style="normalizeReactStyle(attrs.style)"
    data-component="Banner.Title"
    data-banner-title=""
  >
    <slot />
  </component>
</template>

<style module src="./Banner.module.css" />
