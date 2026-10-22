<script setup lang="ts">
import { computed, nextTick, onMounted, onUpdated, provide, ref, useAttrs } from 'vue'
import TextInputWrapper from '../internal/components/TextInputWrapper.vue'
import { normalizeReactStyle } from '../internal/style'
import type { SelectOptions, SelectEmits } from './types'
import { selectValueKey } from './context'
import SelectNativeOptions from './SelectNativeOptions'
// eslint-disable-next-line vue/no-reserved-component-names -- Keep the reference component name for slot diagnostics.
defineOptions({ name: 'Select', inheritAttrs: false, __SLOT__: Symbol('Select') })
const props = withDefaults(defineProps<SelectOptions>(), {
  disabled: undefined,
  required: undefined,
  monospace: undefined,
  hasTrailingAction: undefined,
  isInputFocused: undefined,
})
const emit = defineEmits<SelectEmits>()
const element = ref<HTMLSelectElement>()
const attrs = useAttrs()
const initialValue = props.value ?? props.defaultValue ?? props.placeholder
provide(
  selectValueKey,
  computed(() => (initialValue == null ? undefined : String(initialValue))),
)
const vSelectPlaceholder = {
  getSSRProps: () => ({ selected: initialValue === '' }),
}
function nativeAttrs() {
  const { class: _class, style: _style, ...native } = attrs
  return {
    ...native,
    width: props.width,
    minWidth: props.minWidth,
    maxWidth: props.maxWidth,
  }
}
function updateSelection(value: string | number | readonly string[], setDefaultSelected = false) {
  const options = Array.from(element.value!.options)
  const selected =
    options.find((option) => option.value === String(value)) ??
    options.find((option) => !option.disabled)
  if (selected) {
    selected.selected = true
    if (setDefaultSelected && selected.value === String(value)) selected.defaultSelected = true
  }
}
onMounted(() => {
  if (initialValue != null) updateSelection(initialValue, props.value == null)
})
function syncControlledSelection() {
  if (element.value && props.value != null) updateSelection(props.value)
}
onUpdated(syncControlledSelection)
function change(event: Event) {
  emit('update:value', (event.target as HTMLSelectElement).value)
  emit('change', event)
  void nextTick(syncControlledSelection)
}
defineExpose({
  element,
  input: element,
  focus: (options?: FocusOptions) => element.value?.focus(options),
  blur: () => element.value?.blur(),
})
</script>

<template>
  <TextInputWrapper
    :class="[$style.TextInputWrapper, className, $attrs.class]"
    :block="block"
    :disabled="disabled"
    :size="size"
    :validation-status="validationStatus"
  >
    <select
      ref="element"
      v-bind="nativeAttrs()"
      :class="[$style.Select, disabled && $style.Disabled]"
      :style="normalizeReactStyle($attrs.style)"
      :disabled="disabled"
      :required="required"
      :aria-invalid="validationStatus === 'error' ? 'true' : 'false'"
      :data-hasplaceholder="Boolean(placeholder)"
      data-component="Select"
      @change="change"
      @input="emit('input', $event)"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    >
      <option
        v-if="placeholder"
        v-select-placeholder
        value=""
        :disabled="required"
        :hidden="required"
        data-component="Select.Option"
      >
        {{ placeholder }}
      </option>
      <SelectNativeOptions @vue:updated="syncControlledSelection"><slot /></SelectNativeOptions>
    </select>
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      :class="$style.ArrowIndicator"
    >
      <path
        d="m4.074 9.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.043 9H4.251a.25.25 0 0 0-.177.427ZM4.074 7.47 7.47 4.073a.25.25 0 0 1 .354 0L11.22 7.47a.25.25 0 0 1-.177.426H4.251a.25.25 0 0 1-.177-.426Z"
      />
    </svg>
  </TextInputWrapper>
</template>
<style module src="./Select.module.css" />
