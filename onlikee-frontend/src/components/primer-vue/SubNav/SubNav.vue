<script setup lang="ts">
import { shallowRef } from 'vue'
import RenderVisual from '../internal/components/RenderVisual'
import { normalizeReactStyle } from '../internal/style'
import type { SubNavOptions } from './types'

defineOptions({ name: 'SubNav', inheritAttrs: false, __SLOT__: Symbol('SubNav') })
withDefaults(defineProps<SubNavOptions>(), { actions: undefined })
const element = shallowRef<HTMLElement | null>(null)
defineExpose({ element })
</script>

<template>
  <nav
    ref="element"
    :class="[className, 'SubNav', $style.SubNav]"
    :aria-label="label"
    :align="align"
    v-bind="$attrs"
    :style="normalizeReactStyle($attrs.style)"
    data-component="SubNav"
  >
    <div :class="['SubNav-body', $style.Body]"><slot /></div>
    <div
      v-if="actions || (actions === undefined && $slots.actions)"
      :class="['SubNav-actions', $style.Actions]"
    >
      <RenderVisual v-if="actions !== undefined" :visual="actions" /><slot v-else name="actions" />
    </div>
    <template v-else-if="typeof actions === 'number' && !actions">{{ actions }}</template>
  </nav>
</template>

<style module src="./SubNav.module.css" />
