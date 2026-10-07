<script setup lang="ts">
import { computed } from 'vue'
import { getResponsiveAttributes } from './responsive'
import type { StackProps } from './types'

const props = withDefaults(defineProps<StackProps>(), {
  as: 'div', direction: 'vertical', align: 'stretch', wrap: 'nowrap',
  justify: 'start', padding: 'none'
})
const responsiveAttributes = computed(() => ({
  ...getResponsiveAttributes('gap', props.gap),
  ...getResponsiveAttributes('direction', props.direction),
  ...getResponsiveAttributes('align', props.align),
  ...getResponsiveAttributes('wrap', props.wrap),
  ...getResponsiveAttributes('justify', props.justify),
  ...getResponsiveAttributes('padding', props.padding),
  ...getResponsiveAttributes('padding-block', props.paddingBlock),
  ...getResponsiveAttributes('padding-inline', props.paddingInline)
}))
</script>

<template>
  <component
    :is="as"
    :class="$style['stack']"
    data-component="Stack"
    v-bind="responsiveAttributes"
  >
    <slot />
  </component>
</template>
<style module src="./Stack.module.css" />
