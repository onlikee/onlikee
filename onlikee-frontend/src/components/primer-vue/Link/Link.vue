<script setup lang="ts" generic="As extends keyof NativeElements | Component = 'a'">
import { onMounted, shallowRef, useAttrs, useCssModule } from 'vue'
import type { Component, ComponentPublicInstance, NativeElements } from 'vue'
import type { LinkComponentProps } from './types'

// eslint-disable-next-line vue/no-reserved-component-names -- Keep the public component name.
defineOptions({ name: 'Link', inheritAttrs: false })

const props = withDefaults(defineProps<LinkComponentProps<As>>(), {
  muted: undefined,
  inline: undefined,
})
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
const styles = useCssModule()
const element = shallowRef<HTMLElement | SVGElement | null>(null)

function setElement(node: Element | ComponentPublicInstance | null) {
  const instance = node as {
    element?: HTMLElement | SVGElement
    $el?: HTMLElement | SVGElement
  } | null
  element.value =
    node instanceof HTMLElement || node instanceof SVGElement
      ? node
      : (instance?.element ?? instance?.$el ?? null)
}

function getRootAttrs() {
  const { class: classValue, ...rest } = attrs
  return {
    class: [props.className, classValue, styles['prc-Link-Link']],
    'data-component': 'Link',
    'data-muted': props.muted,
    'data-inline': props.inline,
    ...rest,
  }
}

if (import.meta.env.DEV) {
  onMounted(() => {
    if (
      element.value &&
      !(element.value instanceof HTMLButtonElement) &&
      !(element.value instanceof HTMLAnchorElement)
    ) {
      console.error(
        'Error: Found `Link` component that renders an inaccessible element',
        element.value,
        'Please ensure `Link` always renders as <a> or <button>',
      )
    }
  })
}

defineExpose({ element })
</script>

<template>
  <component :is="as ?? 'a'" :ref="setElement" v-bind="getRootAttrs()">
    <slot />
  </component>
</template>

<style module src="./Link.module.css" />
