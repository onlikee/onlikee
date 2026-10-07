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
      :class="$style['text-input-native']"
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
      :class="$style['text-input-hidden']"
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
  <template v-else-if="typeof characterLimit === 'number' && !characterLimit">{{ characterLimit }}</template>
</template>
<style module src="./TextInput.module.css" />
