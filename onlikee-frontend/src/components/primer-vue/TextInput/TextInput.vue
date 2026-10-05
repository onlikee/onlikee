<script setup lang="ts">
import { computed, ref, useAttrs, useId, useSlots, type InputHTMLAttributes } from 'vue'
import TextInputWrapper from '../internal/components/TextInputWrapper.vue'
import RenderVisual from '../internal/components/RenderVisual'
import CharacterCounter from '../internal/components/CharacterCounter.vue'
import TextInputVisual from './TextInputVisual.vue'
import { useInputValue } from '../internal/inputValue'
import { useCharacterCounter } from '../internal/characterCounter'
import { normalizeReactStyle } from '../internal/style'
import type { TextInputOptions, TextInputEmits } from './types'

defineOptions({ name: 'TextInput', inheritAttrs: false, __SLOT__: Symbol('TextInput') })
const props = withDefaults(defineProps<TextInputOptions>(), {
  disabled: undefined, required: undefined, loading: undefined,
  leadingVisual: undefined, trailingVisual: undefined, trailingAction: undefined, icon: undefined,
  type: 'text', loaderPosition: 'auto', loaderText: 'Loading',
})
const emit = defineEmits<TextInputEmits>()
const attrs = useAttrs()
const slots = useSlots()
const input = ref<HTMLInputElement>()
const focused = ref(false)
const { value, input: updateInput, compositionStart, compositionEnd } = useInputValue(props, input, (next, event) => {
  emit('update:value', next)
  emit('change', event)
})
// 源 TextInput.tsx:129-133：isControlled = value !== undefined；受控长度取原始 prop
// String(value).length（null → 'null' → 4 怪癖），非受控取跟踪长度（审计偏差 8）。
const counter = useCharacterCounter(() => props.value === undefined ? value.value.length : String(props.value).length, () => props.characterLimit)
const valid = computed(() => counter.value?.isOverLimit ? 'error' : props.validationStatus)
const leadingId = useId()
const trailingId = useId()
const loadingId = useId()
const counterId = useId()
const staticMessageId = useId()
const hasLeading = computed(() => props.leadingVisual !== undefined ? Boolean(props.leadingVisual) : Boolean(slots.leadingVisual))
const hasTrailing = computed(() => props.trailingVisual !== undefined ? Boolean(props.trailingVisual) : Boolean(slots.trailingVisual))
const hasAction = computed(() => props.trailingAction !== undefined ? Boolean(props.trailingAction) : Boolean(slots.trailingAction))
const leadingLoading = computed(() => Boolean(props.loading && (props.loaderPosition === 'leading' || hasLeading.value && props.loaderPosition !== 'trailing')))
const trailingLoading = computed(() => Boolean(props.loading && (props.loaderPosition === 'trailing' || props.loaderPosition === 'auto' && !hasLeading.value)))
const describedBy = computed(() => [props.characterLimit && staticMessageId, attrs['aria-describedby'], hasLeading.value && leadingId, hasTrailing.value && trailingId, props.loading && loadingId].filter(Boolean).join(' ') || undefined)
function nativeAttrs() {
  const { class: _class, style: _style, ...native } = attrs
  return native
}
function focusInput(event: MouseEvent) {
  if (event.target !== input.value || !['date', 'time', 'datetime-local'].includes(props.type)) input.value?.focus()
}
defineExpose({ input, element: input, focus: (options?: FocusOptions) => input.value?.focus(options), blur: () => input.value?.blur() })
</script>

<template>
  <TextInputWrapper
    :class="[className, $attrs.class]"
    :width="width"
    :min-width="minWidth"
    :max-width="maxWidth"
    :block="block"
    :contrast="contrast"
    :disabled="disabled"
    :monospace="monospace"
    :size="size"
    :variant="variant"
    :validation-status="valid"
    :has-leading-visual="hasLeading || leadingLoading"
    :has-trailing-visual="hasTrailing || trailingLoading"
    :has-trailing-action="hasAction"
    :is-input-focused="focused"
    :aria-busy="Boolean(loading)"
    @click="focusInput"
  >
    <span
      v-if="icon"
      class="TextInput-icon"
      data-component="TextInput.Icon"
    ><RenderVisual :visual="icon" /></span>
    <TextInputVisual
      :id="leadingId"
      position="leading"
      :has-visual="hasLeading"
      :has-loading="typeof loading === 'boolean'"
      :show-loading="leadingLoading"
    >
      <RenderVisual
        v-if="leadingVisual !== undefined"
        :visual="leadingVisual"
      /><slot
        v-else
        name="leadingVisual"
      />
    </TextInputVisual>
    <input
      ref="input"
      v-bind="nativeAttrs()"
      class="text-input-native"
      :style="normalizeReactStyle([style, $attrs.style])"
      :type="type"
      :disabled="disabled"
      :aria-required="'aria-required' in $attrs ? ($attrs['aria-required'] as InputHTMLAttributes['aria-required']) : required"
      :aria-invalid="'aria-invalid' in $attrs ? ($attrs['aria-invalid'] as InputHTMLAttributes['aria-invalid']) : valid === 'error' ? 'true' : undefined"
      :value="value"
      :aria-describedby="describedBy"
      :data-component="$attrs['data-component'] ?? 'input'"
      @input="emit('input', $event); updateInput($event)"
      @focus="focused = true; emit('focus', $event)"
      @blur="focused = false; emit('blur', $event)"
      @compositionstart="compositionStart(); emit('compositionstart', $event)"
      @compositionend="compositionEnd($event); emit('compositionend', $event)"
    >
    <span
      v-if="loading"
      :id="loadingId"
      class="text-input-hidden"
    >{{ loaderText }}</span>
    <TextInputVisual
      :id="trailingId"
      position="trailing"
      :has-visual="hasTrailing"
      :has-loading="typeof loading === 'boolean'"
      :show-loading="trailingLoading"
      data-testid="text-input-trailing-visual"
    >
      <RenderVisual
        v-if="trailingVisual !== undefined"
        :visual="trailingVisual"
      /><slot
        v-else
        name="trailingVisual"
      />
    </TextInputVisual>
    <RenderVisual
      v-if="trailingAction !== undefined"
      :visual="trailingAction"
    /><slot
      v-else
      name="trailingAction"
    />
  </TextInputWrapper>
  <CharacterCounter
    v-if="characterLimit && counter"
    :limit="characterLimit"
    :counter="counter"
    :counter-id="counterId"
    :static-message-id="staticMessageId"
    component="TextInput.CharacterCounter"
  />
  <!-- 源怪癖镜像：React `{characterLimit && ...}` 在 characterLimit=0 时渲染游离 "0" 文本节点。 -->
  <template v-else-if="typeof characterLimit === 'number' && !characterLimit">{{ characterLimit }}</template>
</template>

<style scoped>
/* Primer React 8c0b708: internal/components/UnstyledTextInput.module.css 移植。
   源不设置 flex/min-width/line-height/padding，outline 仅在 :focus 时归零；
   input 的 padding 与排布全部由 TextInputWrapper 的状态规则与 UA 默认值决定。 */
.text-input-native { width: 100%; font-family: inherit; font-size: inherit; color: inherit; background-color: transparent; border: 0; appearance: none; }
.text-input-native:focus { outline: 0; }
/* 源 _VisuallyHidden.module.css InternalVisuallyHidden（loading 说明节点）。 */
.text-input-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
</style>
