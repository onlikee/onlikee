<template>
  <input
    ref="input"
    v-bind="getInputAttrs()"
    @change="onChange"
  >
</template>
<script setup lang="ts">
import { inject, nextTick, onMounted, onUpdated, ref, ssrContextKey, useAttrs } from 'vue'
import { useCheckboxGroupContext } from '../CheckboxGroup/context'
import type { CheckboxEmits } from './types'
import { normalizeReactStyle } from '../internal/style'
defineOptions({ name: 'Checkbox', __SLOT__: Symbol('Checkbox'), inheritAttrs: false })
const props = withDefaults(defineProps<{
  checked?: boolean
  defaultChecked?: boolean
  indeterminate?: boolean
  disabled?: boolean
  required?: boolean
  validationStatus?: 'error' | 'success'
  value?: string
  className?: string
}>(), { checked: undefined, defaultChecked: undefined, indeterminate: false, disabled: undefined, required: undefined, validationStatus: undefined, value: undefined, className: undefined })
const emit = defineEmits<CheckboxEmits>()
const attrs = useAttrs()
const serverRendering = inject(ssrContextKey, null) !== null
const input = ref<HTMLInputElement | null>(null)
const group = useCheckboxGroupContext()
function getInputAttrs() {
  return {
    type: 'checkbox', disabled: props.disabled, required: props.required,
    ...(props.indeterminate || props.checked !== undefined ? { checked: props.indeterminate ? false : props.checked } : {}),
    // react-dom initWrapperState:1793 initialChecked = (indeterminate?false:checked) != null ? … : defaultChecked；
    // postMountWrapper:1924 checked 属性 = !!initialChecked（checked 优先）。SSR 直接渲染 checked
    // 属性；客户端以 defaultChecked 镜像之（审计偏差 9：旧 `defaultChecked ?? checked` 优先级相反）。
    ...(serverRendering
      ? { checked: props.indeterminate ? false : props.checked ?? props.defaultChecked ?? false }
      : { defaultChecked: props.indeterminate ? false : (props.checked !== undefined ? props.checked : props.defaultChecked ?? false) }),
    'aria-required': props.required ? 'true' as const : 'false' as const,
    'aria-invalid': props.validationStatus === 'error' ? 'true' as const : 'false' as const,
    // 源 Checkbox.tsx:118-127 aria-checked 仅由 useEffect/onChange 客户端 setAttribute，
    // SSR HTML 中不存在（审计偏差 10：serverRendering 省略，避免与 checked 属性冲突）。
    ...(serverRendering ? {} : { 'aria-checked': props.indeterminate ? 'mixed' as const : props.checked ? 'true' as const : 'false' as const }),
    value: props.value, name: props.value, ...attrs,
    style: normalizeReactStyle(attrs.style),
    class: [attrs.class, props.className, 'checkbox-input'],
    'data-component': attrs['data-component'] ?? 'Checkbox'
  }
}
function synchronize() {
  const node = input.value
  if (!node) return
  node.indeterminate = props.indeterminate
  if (props.indeterminate) node.checked = false
  else if (props.checked !== undefined) node.checked = props.checked
  node.setAttribute('aria-checked', props.indeterminate ? 'mixed' : String(node.checked))
}
onMounted(synchronize)
onUpdated(synchronize)
function onChange(event: Event) {
  const node = event.currentTarget as HTMLInputElement
  group?.onChange(event)
  emit('change', event)
  emit('update:checked', node.checked)
  if (props.indeterminate) { node.indeterminate = true; node.setAttribute('aria-checked', 'mixed') }
  void nextTick(synchronize)
}
defineExpose({ input, element: input, focus: (options?: FocusOptions) => input.value?.focus(options), blur: () => input.value?.blur() })
</script>
<style scoped>
.checkbox-input { position: relative; display: grid; width: var(--base-size-16, 16px); height: var(--base-size-16, 16px); margin: 0; margin-top: var(--base-size-2, 2px); cursor: pointer; background-color: var(--bgColor-default, #ffffff); border: var(--borderWidth-thin, 1px) solid var(--control-borderColor-emphasis, #818b98); appearance: none; place-content: center; }
.checkbox-input:disabled { background-color: var(--control-bgColor-disabled, #eff2f5); border-color: var(--control-borderColor-disabled, #818b981a); }
.checkbox-input {
  border-radius: var(--borderRadius-small, 3px);

  /* checked -> unchecked - add 120ms delay to fully see animation-out */
  transition:
    background-color,
    border-color 80ms cubic-bezier(0.33, 1, 0.68, 1);

  &::before {
    width: var(--base-size-16, 16px);
    height: var(--base-size-16, 16px);
    visibility: hidden;
    content: '';
    /* stylelint-disable-next-line primer/colors */
    background-color: var(--fgColor-onEmphasis, #ffffff);
    transition: visibility 0s linear 230ms;
    clip-path: inset(var(--base-size-16, 16px) 0 0 0);
    mask-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDEyIDkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTEuNzgwMyAwLjIxOTYyNUMxMS45MjEgMC4zNjA0MjcgMTIgMC41NTEzMDUgMTIgMC43NTAzMTNDMTIgMC45NDkzMjEgMTEuOTIxIDEuMTQwMTkgMTEuNzgwMyAxLjI4MUw0LjUxODYgOC41NDA0MkM0LjM3Nzc1IDguNjgxIDQuMTg2ODIgOC43NiAzLjk4Nzc0IDguNzZDMy43ODg2NyA4Ljc2IDMuNTk3NzMgOC42ODEgMy40NTY4OSA4LjU0MDQyTDAuMjAxNjIyIDUuMjg2MkMwLjA2ODkyNzcgNS4xNDM4MyAtMC4wMDMzMDkwNSA0Ljk1NTU1IDAuMDAwMTE2NDkzIDQuNzYwOThDMC4wMDM1NTIwNSA0LjU2NjQzIDAuMDgyMzg5NCA0LjM4MDgxIDAuMjIwMDMyIDQuMjQzMjFDMC4zNTc2NjUgNC4xMDU2MiAwLjU0MzM1NSA0LjAyNjgxIDAuNzM3OTcgNC4wMjMzOEMwLjkzMjU4NCA0LjAxOTk0IDEuMTIwOTMgNC4wOTIxNyAxLjI2MzM0IDQuMjI0ODJMMy45ODc3NCA2Ljk0ODM1TDEwLjcxODYgMC4yMTk2MjVDMTAuODU5NSAwLjA3ODk5MjMgMTEuMDUwNCAwIDExLjI0OTUgMEMxMS40NDg1IDAgMTEuNjM5NSAwLjA3ODk5MjMgMTEuNzgwMyAwLjIxOTYyNVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=');
    mask-size: 75%;
    mask-repeat: no-repeat;
    mask-position: center;
    animation: checkmarkOut 80ms cubic-bezier(0.65, 0, 0.35, 1) forwards;
  }

  &:checked,
  &:indeterminate {
    background: var(--control-checked-bgColor-rest, #0969da);

    /* using bgColor here to avoid a border change in dark high contrast */
    /* stylelint-disable-next-line primer/colors */
    border-color: var(--control-checked-bgColor-rest, #0969da);

    /* Windows High Contrast mode */
    @media (forced-colors: active) {
      background-color: canvastext;
      border-color: canvastext;
    }
  }

  &:checked::before,
  &:indeterminate::before {
    animation: checkmarkIn 80ms cubic-bezier(0.65, 0, 0.35, 1) forwards 80ms;
  }

  &:checked:disabled,
  &:indeterminate:disabled {
    background-color: var(--control-checked-bgColor-disabled, #818b98);
    border-color: var(--control-checked-borderColor-disabled, #818b98);
    opacity: 1;
  }

  &:checked:disabled::before,
  &:indeterminate:disabled::before {
    /* stylelint-disable-next-line primer/colors */
    background-color: var(--control-checked-fgColor-disabled, #ffffff);
  }

  &:disabled {
    cursor: not-allowed;
  }

  &:checked {
    transition:
      background-color,
      border-color 80ms cubic-bezier(0.32, 0, 0.67, 0) 0ms;

    &::before {
      visibility: visible;
      transition: visibility 0s linear 0s;
    }
  }

  &:indeterminate {
    background: var(--control-checked-bgColor-rest, #0969da);

    &::before {
      mask-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMiIgdmlld0JveD0iMCAwIDEwIDIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMCAxQzAgMC40NDc3MTUgMC40NDc3MTUgMCAxIDBIOUM5LjU1MjI5IDAgMTAgMC40NDc3MTUgMTAgMUMxMCAxLjU1MjI4IDkuNTUyMjkgMiA5IDJIMUMwLjQ0NzcxNSAyIDAgMS41NTIyOCAwIDFaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K');
      visibility: visible;
    }
  }

  &:focus-visible:not(:disabled) {
    /* 源 Checkbox.module.css:82-84 @mixin focusOutline 2px 展开（focusOutline.css:1-5 +
       preset 注入 #0969da 内层回退）：双跳 var + box-shadow:none（审计偏差 4）。 */
    outline: 2px solid var(--focus-outline-color, var(--focus-outlineColor, #0969da));
    outline-offset: 2px;
    box-shadow: none;
  }
}

@keyframes checkmarkIn {
  from {
    clip-path: inset(var(--base-size-16, 16px) 0 0 0);
  }

  to {
    clip-path: inset(0 0 0 0);
  }
}

@keyframes checkmarkOut {
  from {
    clip-path: inset(0 0 0 0);
  }

  to {
    clip-path: inset(var(--base-size-16, 16px) 0 0 0);
  }
}
</style>
