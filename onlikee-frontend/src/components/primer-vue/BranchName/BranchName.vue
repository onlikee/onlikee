<script setup lang="ts" generic="As extends keyof NativeElements | Component = 'a'">
import { shallowRef, useAttrs, useCssModule } from 'vue'
import type { Component, ComponentPublicInstance, NativeElements } from 'vue'
import type { BranchNameComponentProps, BranchNameElement } from './types'

defineOptions({ name: 'BranchName', inheritAttrs: false })
const props = defineProps<BranchNameComponentProps<As>>()
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
const styles = useCssModule()
const element = shallowRef<BranchNameElement<As> | null>(null)

function setElement(node: Element | ComponentPublicInstance | null) {
  element.value = node as BranchNameElement<As> | null
}
function getRootAttrs() {
  const { class: classValue, ...rest } = attrs
  return {
    ...rest,
    class: [props.className, classValue, styles['prc-BranchName-BranchName']],
    'data-component': 'BranchName',
  }
}

defineExpose({ element })
</script>

<template>
  <component :is="as ?? 'a'" :ref="setElement" v-bind="getRootAttrs()">
    <slot />
  </component>
</template>

<style module src="./BranchName.module.css" />
