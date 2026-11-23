<script setup lang="ts">
import { h, shallowRef } from 'vue'
import TriangleDownIcon from '@onlikee/octicons-vue/icons/triangle-down'
import { ActionList } from '@/components/primer-vue/ActionList'
import { AnchoredOverlay, type AnchorRenderProps } from '@/components/primer-vue/AnchoredOverlay'
import { Button } from '@/components/primer-vue/Button'
import type { FrameworkValue } from '@/modules/application/components/newForm/useCreateApplicationForm'

const props = defineProps<{
  modelValue: FrameworkValue | null
  invalid?: boolean
  describedBy?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FrameworkValue]
}>()

const frameworkOptions: { value: FrameworkValue; label: string; description: string }[] = [
  { value: 'html', label: 'HTML', description: '从一段HTML代码开始！' },
  { value: 'vue', label: 'Vue', description: '从一个Vue项目开始！' },
  { value: 'react', label: 'React', description: '从一个React项目开始！' },
]

const open = shallowRef(false)

function selectFramework(value: FrameworkValue) {
  emit('update:modelValue', value)
  open.value = false
}

const renderAnchor = (anchorProps: AnchorRenderProps) =>
  h(
    Button,
    {
      ...anchorProps,
      type: 'button',
      'aria-haspopup': 'dialog',
      'aria-invalid': props.invalid || undefined,
      'aria-describedby': props.describedBy,
      trailingVisual: TriangleDownIcon,
    },
    () => frameworkOptions.find((option) => option.value === props.modelValue)?.label ?? '请选择',
  )
</script>

<template>
  <AnchoredOverlay
    :open="open"
    :render-anchor="renderAnchor"
    width="medium"
    align="end"
    :overlay-props="{ role: 'dialog', 'aria-label': '选择前端框架' }"
    :close-button-props="{ 'aria-label': '关闭前端框架选择' }"
    :focus-zone-settings="{ disabled: true }"
    @open="open = true"
    @close="open = false"
  >
    <ActionList role="listbox" aria-label="前端框架" selection-variant="single">
      <ActionList.Item
        v-for="option in frameworkOptions"
        :key="option.value"
        :selected="modelValue === option.value"
        @select="selectFramework(option.value)"
      >
        {{ option.label }}
        <ActionList.Description variant="block">{{ option.description }}</ActionList.Description>
      </ActionList.Item>
    </ActionList>
  </AnchoredOverlay>
</template>
