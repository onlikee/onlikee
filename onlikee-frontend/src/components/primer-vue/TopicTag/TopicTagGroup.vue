<script setup lang="ts">
import { useAttrs, useCssModule, useTemplateRef } from 'vue'
import type { TopicTagGroupComponentProps } from './types'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'TopicTagGroup', inheritAttrs: false })
const props = defineProps<TopicTagGroupComponentProps>()
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
const styles = useCssModule()
const element = useTemplateRef<HTMLDivElement>('element')

function getRootAttrs() {
  const { class: classValue, ...rest } = attrs
  return {
    ...rest,
    class: [props.className, classValue, styles['prc-TopicTagGroup-TopicTagGroup']],
    style: normalizeReactStyle(attrs.style),
  }
}

defineExpose({ element })
</script>

<template>
  <div ref="element" v-bind="getRootAttrs()"><slot /></div>
</template>

<style module src="./TopicTagGroup.module.css" />
