<script setup lang="ts">
import { computed, getCurrentInstance, shallowRef } from 'vue'
import ButtonBase from './ButtonBase.vue'
import type { LinkButtonComponentProps, ButtonInstance } from './types'

defineOptions({ name: 'LinkButton', inheritAttrs: false })
const props = withDefaults(defineProps<LinkButtonComponentProps>(), {
  as: 'a',
  loading: undefined,
  inactive: undefined,
  labelWrap: undefined,
})
const instance = getCurrentInstance()!
const button = shallowRef<ButtonInstance | null>(null)
const element = computed(() => button.value?.element ?? null)
function buttonProps() {
  const incoming = instance.vnode.props ?? {}
  const bindings: Record<string, unknown> = {
    'data-component': 'LinkButton',
    ...props,
    ...instance.attrs,
  }
  if (Object.prototype.hasOwnProperty.call(incoming, 'type')) {
    bindings.type = props.type
  } else {
    delete bindings.type
  }
  if (Object.prototype.hasOwnProperty.call(incoming, 'disabled')) {
    bindings.disabled = incoming.disabled === undefined ? undefined : props.disabled
  } else {
    delete bindings.disabled
  }
  delete bindings.children
  return bindings
}
defineExpose({
  element,
  focus: (options?: FocusOptions) => element.value?.focus(options),
  blur: () => element.value?.blur(),
})
</script>

<template>
  <ButtonBase v-bind="buttonProps()" ref="button">
    <slot />
  </ButtonBase>
</template>
