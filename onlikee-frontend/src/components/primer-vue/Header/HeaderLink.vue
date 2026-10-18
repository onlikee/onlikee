<script setup lang="ts" generic="As extends keyof NativeElements | Component = 'a'">
import { shallowRef, useAttrs, useCssModule } from 'vue'
import type { Component, ComponentPublicInstance, NativeElements } from 'vue'
import type { HeaderElement, HeaderLinkComponentProps } from './types'

defineOptions({ name: 'HeaderLink', inheritAttrs: false })
const props = defineProps<HeaderLinkComponentProps<As>>()
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
    class: [props.className, classValue, styles['prc-Header-HeaderLink']],
    'data-component': 'Header.Link',
  }
}

defineExpose({ element })
</script>

<template>
  <component :is="as ?? 'a'" :ref="setElement" v-bind="getRootAttrs()">
    <slot />
  </component>
</template>

<style module src="./Header.module.css" />
