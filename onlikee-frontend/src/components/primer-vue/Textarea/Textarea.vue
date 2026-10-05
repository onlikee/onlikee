<script setup lang="ts">
import { computed, nextTick, normalizeStyle, onMounted, ref, useAttrs, useId, watch, type CSSProperties, type TextareaHTMLAttributes } from 'vue'
import TextInputWrapper from '../internal/components/TextInputWrapper.vue'
import CharacterCounter from '../internal/components/CharacterCounter.vue'
import { useCharacterCounter } from '../internal/characterCounter'
import { useInputValue } from '../internal/inputValue'
import { normalizeReactStyle } from '../internal/style'
import type { TextareaOptions, TextareaEmits } from './types'
// eslint-disable-next-line vue/no-reserved-component-names -- Keep the reference component name for slot diagnostics.
defineOptions({ name: 'Textarea', inheritAttrs: false, __SLOT__: Symbol('Textarea') })
const props = withDefaults(defineProps<TextareaOptions>(), { disabled: undefined, required: undefined, rows: 7, cols: 30, resize: 'both' })
const emit = defineEmits<TextareaEmits>()
const attrs = useAttrs()
const element = ref<HTMLTextAreaElement>()
const { value, input, compositionStart, compositionEnd } = useInputValue(props, element, (next, event) => {
  emit('update:value', next)
  emit('change', event)
})
// 源 Textarea.tsx:105-107：isControlled = value !== undefined；受控长度取原始 prop
// String(value).length（null → 'null' → 4 怪癖），非受控取跟踪长度（审计偏差 8）。
const counter = useCharacterCounter(() => props.value === undefined ? value.value.length : String(props.value).length, () => props.characterLimit)
const validation = computed(() => counter.value?.isOverLimit ? 'error' : props.validationStatus)
const counterId = useId()
const staticMessageId = useId()
const describedBy = computed(() => [props.characterLimit && staticMessageId, attrs['aria-describedby']].filter(Boolean).join(' ') || undefined)
function nativeAttrs() {
  const { class: _class, style: _style, ...native } = attrs
  return native
}
const textareaStyle = computed(() => normalizeStyle(normalizeReactStyle([{ minHeight: props.minHeight, maxHeight: props.maxHeight }, props.style, attrs.style])) as CSSProperties)
const autoSizeEnabled = computed(() => 'data-auto-size' in attrs ? attrs['data-auto-size'] === true || attrs['data-auto-size'] === 'true' : props.autoSize)
/* 文档化适配：源 autoSize 为纯 CSS（field-sizing: content），零 JS 干预。
   JS 自动高度仅在浏览器不支持 field-sizing 时执行（与迁移文档登记一致）；
   autoSize 关闭时不触碰 height——保留 UA 拖拽 resize 写入的内联高度（源行为），
   仅当 JS 曾写过内联高度且 autoSize 被关闭时，一次性恢复调用方显式高度。 */
const supportsFieldSizing = typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('field-sizing', 'content')
let jsAutoSized = false
function resizeToContent() {
  if (!element.value) return
  if (!autoSizeEnabled.value) {
    if (!jsAutoSized) return
    const height = textareaStyle.value.height
    element.value.style.height = typeof height === 'number' ? `${height}px` : height ?? ''
    jsAutoSized = false
    return
  }
  if (supportsFieldSizing) return
  element.value.style.height = 'auto'
  jsAutoSized = true
  const styles = element.value.ownerDocument.defaultView?.getComputedStyle(element.value)
  const parsedMin = Number.parseFloat(styles?.minHeight ?? '')
  const parsedMax = Number.parseFloat(styles?.maxHeight ?? '')
  const min = Number.isFinite(parsedMin) ? parsedMin : props.minHeight ?? 0
  const max = Number.isFinite(parsedMax) ? parsedMax : props.maxHeight ?? Infinity
  const height = Math.max(min, Math.min(max, element.value.scrollHeight))
  if (height > 0) element.value.style.height = `${height}px`
}
watch([value, autoSizeEnabled, textareaStyle, () => props.minHeight, () => props.maxHeight], resizeToContent, { flush: 'post' })
onMounted(resizeToContent)
defineExpose({ element, input: element, focus: (options?: FocusOptions) => element.value?.focus(options), blur: () => element.value?.blur() })
</script>

<template>
  <TextInputWrapper
    base-only
    :class="[className, $attrs.class]"
    :block="block"
    :contrast="contrast"
    :disabled="disabled"
    :validation-status="validation"
  >
    <textarea
      ref="element"
      v-bind="nativeAttrs()"
      class="textarea-native"
      :value="value"
      :disabled="disabled"
      :rows="rows"
      :cols="cols"
      :data-resize="'data-resize' in $attrs ? $attrs['data-resize'] : resize"
      :data-auto-size="'data-auto-size' in $attrs ? $attrs['data-auto-size'] : autoSize || undefined"
      :aria-required="'aria-required' in $attrs ? ($attrs['aria-required'] as TextareaHTMLAttributes['aria-required']) : required"
      :aria-invalid="'aria-invalid' in $attrs ? ($attrs['aria-invalid'] as TextareaHTMLAttributes['aria-invalid']) : validation === 'error' ? 'true' : 'false'"
      :aria-describedby="describedBy"
      :style="textareaStyle"
      :data-component="'data-component' in $attrs ? $attrs['data-component'] : 'Textarea'"
      @input="emit('input', $event); input($event); resizeToContent(); nextTick(resizeToContent)"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
      @compositionstart="compositionStart(); emit('compositionstart', $event)"
      @compositionend="compositionEnd($event); emit('compositionend', $event)"
    />
  </TextInputWrapper>
  <CharacterCounter
    v-if="characterLimit && counter"
    :limit="characterLimit"
    :counter="counter"
    :counter-id="counterId"
    :static-message-id="staticMessageId"
  />
  <!-- 源怪癖镜像：React `{characterLimit && ...}` 在 characterLimit=0 时渲染游离 "0" 文本节点。 -->
  <template v-else-if="typeof characterLimit === 'number' && !characterLimit">{{ characterLimit }}</template>
</template>

<style scoped>
/* Primer React 8c0b708: Textarea.module.css 移植。padding 12px 按源由
   TextInputWrapper 的 `> textarea` 规则提供；line-height 不继承（源仅 inherit family/size）。
   autoSize 的 JS 兜底为文档化适配（field-sizing 不支持时），样式层保持源定义。 */
.textarea-native { width: 100%; font-family: inherit; font-size: inherit; color: inherit; resize: both; background-color: transparent; border: 0; appearance: none; }
.textarea-native:focus { outline: 0; }
.textarea-native[data-resize='none'] { resize: none; }
.textarea-native[data-resize='both'] { resize: both; }
.textarea-native[data-resize='horizontal'] { resize: horizontal; }
.textarea-native[data-resize='vertical'] { resize: vertical; }
.textarea-native[data-auto-size='true'] { field-sizing: content; }
.textarea-native:disabled { resize: none; }
</style>
