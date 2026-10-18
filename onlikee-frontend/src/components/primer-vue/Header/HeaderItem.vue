<script setup lang="ts">
import { shallowRef, useAttrs, useCssModule } from 'vue'
import type { HeaderItemOptions } from './types'

defineOptions({ name: 'HeaderItem', inheritAttrs: false })
const props = withDefaults(defineProps<HeaderItemOptions>(), { full: undefined })
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
const styles = useCssModule()
const element = shallowRef<HTMLDivElement | null>(null)

function getRootAttrs() {
  const { class: classValue, ...rest } = attrs
  return {
    'data-full': props.full,
    ...rest,
    class: [props.className, classValue, styles['prc-Header-HeaderItem']],
    'data-component': 'Header.Item',
  }
}

defineExpose({ element })
</script>

<template>
  <div ref="element" v-bind="getRootAttrs()"><slot /></div>
</template>

<style module src="./Header.module.css" />
