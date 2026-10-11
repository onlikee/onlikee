<script setup lang="ts">
import { computed, getCurrentInstance, h, shallowRef, useAttrs, useSlots } from 'vue'
import ButtonBase from './ButtonBase.vue'
import type { ButtonComponentProps, ButtonInstance } from './types'

defineOptions({ inheritAttrs: false, __SLOT__: Symbol('Button') })
const props = withDefaults(defineProps<ButtonComponentProps>(), {
  as: 'button',
  loading: undefined,
  inactive: undefined,
  labelWrap: undefined,
})
const instance = getCurrentInstance()!
const attrs = useAttrs()
const slots = useSlots()
function nativeType() {
  return instance.vnode.props && 'type' in instance.vnode.props ? props.type : 'button'
}
const button = shallowRef<ButtonInstance | null>(null)
const element = computed(() => button.value?.element ?? null)
function buttonProps() {
  const incoming = instance.vnode.props ?? {}
  const bindings: Record<string, unknown> = { ...props, ...attrs, type: nativeType(), ref: button }
  if (Object.prototype.hasOwnProperty.call(incoming, 'disabled')) {
    bindings.disabled = incoming.disabled === undefined ? undefined : props.disabled
  } else {
    delete bindings.disabled
  }
  delete bindings.children
  return bindings
}
const Render = () =>
  h(ButtonBase, buttonProps(), slots.default ? { default: slots.default } : undefined)
defineExpose({
  element,
  focus: (options?: FocusOptions) => element.value?.focus(options),
  blur: () => element.value?.blur(),
})
</script>

<template>
  <Render />
</template>
