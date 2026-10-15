<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { CheckIcon, CopyIcon } from '@onlikee/octicons-vue'
import { IconButton } from '@/components/primer-vue/Button'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'

defineOptions({ name: 'CopyButton', inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    text: string
    label?: string
    size?: 'small' | 'medium' | 'large'
    disabled?: boolean
  }>(),
  { label: '复制', size: 'medium', disabled: false },
)
const emit = defineEmits<{
  success: [text: string]
  error: [error: unknown]
}>()

const button = shallowRef<InstanceType<typeof IconButton> | null>(null)
const element = computed(() => button.value?.element ?? null)
defineExpose({ element })

const copying = shallowRef(false)
const feedback = shallowRef<'success' | 'error' | null>(null)
const feedbackLabel = computed(() =>
  feedback.value === 'success' ? '已复制' : feedback.value === 'error' ? '复制失败' : '',
)
let feedbackTimeout: ReturnType<typeof setTimeout> | undefined
let disposed = false

function clearFeedback() {
  clearTimeout(feedbackTimeout)
  feedbackTimeout = undefined
  feedback.value = null
}

function showFeedback(state: 'success' | 'error') {
  feedback.value = state
  feedbackTimeout = setTimeout(clearFeedback, 2000)
}

async function copy() {
  if (props.disabled || copying.value) return
  clearFeedback()
  copying.value = true
  const text = props.text
  try {
    await navigator.clipboard.writeText(text)
  } catch (error) {
    if (!disposed) {
      showFeedback('error')
      emit('error', error)
    }
    return
  } finally {
    if (!disposed) copying.value = false
  }
  if (disposed) return
  showFeedback('success')
  emit('success', text)
}

onBeforeUnmount(() => {
  disposed = true
  clearFeedback()
})
</script>

<template>
  <IconButton
    v-bind="$attrs"
    ref="button"
    :class="$style.CopyButton"
    :icon="feedback === 'success' ? CheckIcon : CopyIcon"
    :aria-label="feedbackLabel || label"
    :aria-busy="copying || undefined"
    :aria-disabled="copying || undefined"
    :data-copy-state="feedback"
    :size="size"
    :disabled="disabled"
    type="button"
    variant="invisible"
    @click="copy"
  />
  <VisuallyHidden role="status">{{ feedbackLabel }}</VisuallyHidden>
</template>

<style module src="./CopyButton.module.css" />
