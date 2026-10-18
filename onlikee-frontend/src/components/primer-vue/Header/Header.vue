<script setup lang="ts" generic="As extends keyof NativeElements | Component = 'header'">
import { shallowRef, useAttrs, useCssModule } from 'vue'
import type { Component, ComponentPublicInstance, NativeElements } from 'vue'
import type { HeaderComponentProps, HeaderElement } from './types'

defineOptions({ name: 'PrimerHeader', inheritAttrs: false })
const props = defineProps<HeaderComponentProps<As>>()
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
const styles = useCssModule()
const element = shallowRef<HeaderElement<As> | null>(null)

function setElement(node: Element | ComponentPublicInstance | null) {
  element.value = node as HeaderElement<As> | null
}
function getRootAttrs() {
  const { class: classValue, ...rest } = attrs
  return {
    ...rest,
    class: [props.className, classValue, styles['prc-Header-Header']],
    'data-component': 'Header',
  }
}

defineExpose({ element })
</script>

<template>
  <component :is="as ?? 'header'" :ref="setElement" v-bind="getRootAttrs()">
    <slot />
  </component>
</template>

<style module src="./Header.module.css" />
