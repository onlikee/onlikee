<script setup lang="ts">
import { h, shallowRef } from 'vue'
import LockIcon from '@onlikee/octicons-vue/icons/lock'
import RepoIcon from '@onlikee/octicons-vue/icons/repo'
import TriangleDownIcon from '@onlikee/octicons-vue/icons/triangle-down'
import { ActionList } from '@/components/primer-vue/ActionList'
import { AnchoredOverlay, type AnchorRenderProps } from '@/components/primer-vue/AnchoredOverlay'
import { Button } from '@/components/primer-vue/Button'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const visibilityOptions = [
  {
    label: '公开的',
    description: '你的应用被公开，所有人都能够在应用广场上看见它。',
    icon: RepoIcon,
  },
  {
    label: '私有的',
    description: '你可以在个人应用中查看和管理它。当然别人也可以通过URL进行访问。',
    icon: LockIcon,
  },
]

const visibilityOpen = shallowRef(false)

function selectVisibility(value: string) {
  emit('update:modelValue', value)
  visibilityOpen.value = false
}

const renderVisibilityAnchor = (anchorProps: AnchorRenderProps) =>
  h(
    Button,
    {
      ...anchorProps,
      type: 'button',
      'aria-haspopup': 'dialog',
      leadingVisual: props.modelValue === '私有的' ? LockIcon : RepoIcon,
      trailingVisual: TriangleDownIcon,
    },
    () => props.modelValue,
  )
</script>

<template>
  <AnchoredOverlay
    :open="visibilityOpen"
    :render-anchor="renderVisibilityAnchor"
    width="medium"
    align="end"
    :overlay-props="{ role: 'dialog', 'aria-label': '选择可见性' }"
    :close-button-props="{ 'aria-label': '关闭可见性选择' }"
    :focus-zone-settings="{ disabled: true }"
    @open="visibilityOpen = true"
    @close="visibilityOpen = false"
  >
    <ActionList role="listbox" aria-label="选择选项" selection-variant="single">
      <ActionList.Item
        v-for="option in visibilityOptions"
        :key="option.label"
        :selected="modelValue === option.label"
        @select="selectVisibility(option.label)"
      >
        <ActionList.LeadingVisual><component :is="option.icon" /></ActionList.LeadingVisual>
        {{ option.label }}
        <ActionList.Description variant="block">{{ option.description }}</ActionList.Description>
      </ActionList.Item>
    </ActionList>
  </AnchoredOverlay>
</template>
