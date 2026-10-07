<script setup lang="ts">
import { computed, onMounted, provide, ref, useAttrs } from 'vue'
import TextInputWrapper from '../internal/components/TextInputWrapper.vue'
import { useInputValue } from '../internal/inputValue'
import { normalizeReactStyle } from '../internal/style'
import type { SelectOptions, SelectEmits } from './types'
import { selectValueKey } from './context'
import SelectNativeOptions from './SelectNativeOptions'
// eslint-disable-next-line vue/no-reserved-component-names -- Keep the reference component name for slot diagnostics.
defineOptions({ name: 'Select', inheritAttrs: false, __SLOT__: Symbol('Select') })
const props = withDefaults(defineProps<SelectOptions>(), { disabled: undefined, required: undefined })
const emit = defineEmits<SelectEmits>()
const element = ref<HTMLSelectElement>()
const attrs = useAttrs()
const { value, commit, setUncontrolledValue } = useInputValue(props, element, (next, event) => {
  emit('update:value', next)
  emit('change', event)
})
provide(selectValueKey, computed(() => props.value !== undefined || props.defaultValue !== undefined || props.placeholder ? value.value : undefined))
function nativeAttrs() {
  const { class: _class, style: _style, ...native } = attrs
  return { ...native, width: props.width, minWidth: props.minWidth, maxWidth: props.maxWidth }
}
onMounted(() => {
  // Browser selection defaults to the first option when no default is provided.
  if (props.value === undefined && props.defaultValue === undefined && !props.placeholder && element.value) {
    const options = Array.from(element.value.options)
    const initial = options.find(option => option.defaultSelected) ?? options.find(option => !option.disabled && !(option.parentElement instanceof HTMLOptGroupElement && option.parentElement.disabled))
    if (initial) {
      element.value.value = initial.value
      setUncontrolledValue(initial.value)
    }
  }
})
defineExpose({ element, input: element, focus: (options?: FocusOptions) => element.value?.focus(options), blur: () => element.value?.blur() })
</script>

<template>
  <TextInputWrapper
    :class="[$style['select-wrapper'], className, $attrs.class]"
    :block="block"
    :disabled="disabled"
    :size="size"
    :validation-status="validationStatus"
  >
    <select
      ref="element"
      v-bind="nativeAttrs()"
      :class="[$style['select-native'], disabled && $style['select-disabled']]"
      :style="normalizeReactStyle($attrs.style)"
      :value="value"
      :disabled="disabled"
      :required="required"
      :aria-invalid="validationStatus === 'error' ? 'true' : 'false'"
      :data-hasplaceholder="Boolean(placeholder)"
      data-component="Select"
      @change="commit"
      @input="emit('input', $event)"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    >
      <option
        v-if="placeholder"
        value=""
        :disabled="required"
        :hidden="required"
        data-component="Select.Option"
      >
        {{ placeholder }}
      </option>
      <SelectNativeOptions><slot /></SelectNativeOptions>
    </select>
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      :class="$style['select-arrow']"
    ><path d="m4.074 9.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.043 9H4.251a.25.25 0 0 0-.177.427ZM4.074 7.47 7.47 4.073a.25.25 0 0 1 .354 0L11.22 7.47a.25.25 0 0 1-.177.426H4.251a.25.25 0 0 1-.177-.426Z" /></svg>
  </TextInputWrapper>
</template>
<style module src="./Select.module.css" />
