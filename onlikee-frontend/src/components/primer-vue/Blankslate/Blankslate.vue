<script setup lang="ts">
import { computed, provide, useAttrs } from 'vue'
import { blankslateContextKey } from './context'
import type { BlankslateComponentProps } from './types'

defineOptions({ name: 'Blankslate', inheritAttrs: false })
const props = withDefaults(defineProps<BlankslateComponentProps>(), { size: 'medium' })
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
provide(blankslateContextKey, { size: computed(() => props.size) })
function outerAttrs() {
  const { class: _class, ...rest } = attrs
  return rest
}
</script>

<template>
  <div v-bind="outerAttrs()" :class="$style.Container">
    <div
      :class="[$style.Blankslate, className, attrs.class]"
      data-component="Blankslate"
      :data-border="border ? '' : undefined"
      :data-narrow="narrow ? '' : undefined"
      :data-spacious="spacious ? '' : undefined"
      :data-size="size"
    >
      <slot />
    </div>
  </div>
</template>

<style module src="./Blankslate.module.css" />
