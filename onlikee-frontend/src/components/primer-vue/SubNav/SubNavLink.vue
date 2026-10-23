<script setup lang="ts">
import { shallowRef } from 'vue'
import { normalizeReactStyle } from '../internal/style'
import type { SubNavLinkOptions } from './types'

defineOptions({ name: 'SubNavLink', inheritAttrs: false, __SLOT__: Symbol('SubNav.Link') })
withDefaults(defineProps<SubNavLinkOptions>(), { selected: undefined })
const element = shallowRef<HTMLAnchorElement | null>(null)
defineExpose({ element })
</script>

<template>
  <a
    ref="element"
    :class="[className, $style.Link]"
    :data-selected="selected"
    :aria-current="selected"
    :to="typeof to === 'object' ? String(to) : to"
    v-bind="$attrs"
    :style="normalizeReactStyle($attrs.style)"
    data-component="SubNav.Link"
    ><slot
  /></a>
</template>

<style module src="./SubNav.module.css" />
