<script setup lang="ts">
import { computed, h, nextTick, onMounted, shallowRef, watch } from 'vue'
import { Button } from '../Button'
import type { ButtonInstance } from '../Button/types'
import { assignElementRef } from '../internal/assignElementRef'
import { useFeatureFlag } from '../FeatureFlags/context'
import type { DialogButtonProps } from './types'

defineOptions({ name: 'DialogButtons', displayName: 'Dialog.Buttons', inheritAttrs: false })
const props = defineProps<{ buttons: DialogButtonProps[] }>()
const button = shallowRef<ButtonInstance | null>(null)
const element = computed(() => button.value?.element ?? null)
const mergedRefEnabled = useFeatureFlag('primer_react_merged_forwarded_refs')
const providedButtonRef = computed(() => props.buttons.find((action) => action.autoFocus)?.ref)
const readRef = computed(() =>
  mergedRefEnabled.value ? element : (providedButtonRef.value ?? element),
)
function setAutoFocus(value: unknown) {
  button.value = value as ButtonInstance | null
}
watch(
  [element, providedButtonRef],
  ([node, forwardedRef], _previous, onCleanup) => {
    assignElementRef(forwardedRef, node as HTMLButtonElement | null)
    onCleanup(() => assignElementRef(forwardedRef, null))
  },
  { flush: 'sync' },
)
let hasRendered = false
watch(
  readRef,
  async (current, _previous, onCleanup) => {
    if (!hasRendered) return
    let cancelled = false
    onCleanup(() => {
      cancelled = true
    })
    await nextTick()
    if (!cancelled) current.value?.focus()
  },
  { flush: 'post' },
)
onMounted(async () => {
  // Wait for the originating overlay's focus restoration before reasserting footer focus.
  await nextTick()
  await nextTick()
  await nextTick()
  hasRendered = true
  readRef.value.value?.focus()
})
const Render = () => {
  let autoFocusCount = 0
  return props.buttons.map((action, index) => {
    const {
      content,
      buttonType = 'default',
      autoFocus = false,
      ref: _forwardedRef,
      ...rest
    } = action
    return h(
      Button,
      {
        'data-component': 'Dialog.FooterButton',
        ...rest,
        key: index,
        variant: buttonType === 'normal' ? 'default' : buttonType,
        ref: autoFocus && autoFocusCount++ === 0 ? setAutoFocus : undefined,
      },
      { default: () => content },
    )
  })
}
defineExpose({ element })
</script>

<template><Render /></template>
