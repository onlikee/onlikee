<script setup lang="ts">
import { h, shallowRef } from 'vue'
import TriangleDownIcon from '@onlikee/octicons-vue/icons/triangle-down'
import { ActionList } from '@/components/primer-vue/ActionList'
import { AnchoredOverlay, type AnchorRenderProps } from '@/components/primer-vue/AnchoredOverlay'
import { Button } from '@/components/primer-vue/Button'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const frameworkOptions = [
  {
    label: 'HTML',
    description: '从一段HTML代码开始！',
  },
  {
    label: 'Vue',
    description: '从一个Vue项目开始！',
  },
  {
    label: 'React',
    description: '从一个React项目开始！',
  },
  {
    label: 'Svelte',
    description: '从一个Svelte项目开始！',
  },
  {
    label: 'Astro',
    description: '从一个Astro项目开始！',
  },
  {
    label: 'Other',
    description: '任何带有index.html的构建目录',
  },
]

const frameworkOpen = shallowRef(false)

function selectFramework(value: string) {
  emit('update:modelValue', value)
  frameworkOpen.value = false
}

const renderFrameworkAnchor = (anchorProps: AnchorRenderProps) =>
  h(
    Button,
    {
      ...anchorProps,
      type: 'button',
      'aria-haspopup': 'dialog',
      trailingVisual: TriangleDownIcon,
    },
    () => props.modelValue,
  )
</script>

<template>
  <AnchoredOverlay
    :open="frameworkOpen"
    :render-anchor="renderFrameworkAnchor"
    width="medium"
    align="end"
    :overlay-props="{ role: 'dialog', 'aria-label': '选择前端框架' }"
    :close-button-props="{ 'aria-label': '关闭前端框架选择' }"
    :focus-zone-settings="{ disabled: true }"
    @open="frameworkOpen = true"
    @close="frameworkOpen = false"
  >
    <ActionList role="listbox" aria-label="前端框架" selection-variant="single">
      <ActionList.Item
        v-for="option in frameworkOptions"
        :key="option.label"
        :selected="modelValue === option.label"
        @select="selectFramework(option.label)"
      >
        {{ option.label }}
        <ActionList.Description variant="block">{{ option.description }}</ActionList.Description>
      </ActionList.Item>
    </ActionList>
  </AnchoredOverlay>
</template>
