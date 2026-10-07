<script lang="ts">
import { computed, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref, useId, watch, type Component, type PropType , useCssModule} from 'vue'
import { FocusKeys, focusZone } from '@primer/behaviors'
import { isFocusable } from '@primer/behaviors/utils'
import TextInputWrapper from '../internal/components/TextInputWrapper.vue'
import { useFormControlForwardedProps } from '../FormControl/context'
import { renderNode, type NodeProp } from '../internal/renderNode'
import { normalizeReactStyle } from '../internal/style'
import Token, { type TokenSizeKeys } from '../Token'
import type { TokenData } from './types'
import TextInputVisual from '../TextInput/TextInputVisual.vue'

export default defineComponent({
  name: 'TextInputWithTokens', __SLOT__: Symbol('TextInputWithTokens'), inheritAttrs: false,
  props: {
    tokens: { type: Array as PropType<TokenData[]>, required: true },
    tokenComponent: { type: [Object, Function] as PropType<Component>, default: Token },
    value: { type: [String, Number], default: undefined }, defaultValue: { type: [String, Number], default: undefined },
    disabled: { type: Boolean, default: undefined }, required: { type: Boolean, default: undefined }, id: { type: String, default: undefined },
    leadingVisual: { type: null as unknown as PropType<NodeProp>, default: undefined }, trailingVisual: { type: null as unknown as PropType<NodeProp>, default: undefined },
    icon: { type: [Object, Function] as PropType<Component>, default: undefined },
    size: { type: String as PropType<TokenSizeKeys>, default: 'xlarge' },
    loading: { type: Boolean, default: undefined },
    loaderPosition: { type: String as PropType<'auto' | 'leading' | 'trailing'>, default: 'auto' },
    preventTokenWrapping: Boolean, hideTokenRemoveButtons: Boolean, visibleTokenCount: { type: Number, default: undefined },
    block: Boolean, contrast: Boolean, className: { type: String, default: undefined },
    maxHeight: { type: [String, Number], default: undefined }, width: { type: [String, Number], default: undefined }, minWidth: { type: [String, Number], default: undefined }, maxWidth: { type: [String, Number], default: undefined },
    validationStatus: { type: String as PropType<'error' | 'success'>, default: undefined }, variant: { type: String as PropType<'small' | 'medium' | 'large'>, default: undefined }
  },
  emits: {
    'update:value': (_value: string) => true, 'token-remove': (_id: string | number) => true,
    input: (_event: Event) => true, change: (_event: Event) => true,
    focus: (_event: FocusEvent) => true, blur: (_event: FocusEvent) => true,
    keydown: (_event: KeyboardEvent) => true, keyup: (_event: KeyboardEvent) => true,
    compositionstart: (_event: CompositionEvent) => true, compositionend: (_event: CompositionEvent) => true
  },
  setup(props, { attrs, slots, emit, expose }) {
    const styles = useCssModule()
    const input = ref<HTMLInputElement | null>(null)
    const container = ref<HTMLElement | null>(null)
    const value = ref(String(props.value ?? props.defaultValue ?? ''))
    const composing = ref(false)
    let compositionCommittedValue: string | undefined
    const selectedTokenIndex = ref<number>()
    const truncated = ref(Boolean(props.visibleTokenCount))
    const descriptionId = useId()
    const timeouts = new Set<ReturnType<typeof setTimeout>>()
    const later = (callback: () => void) => { const id = setTimeout(() => { timeouts.delete(id); callback() }, 0); timeouts.add(id) }
    let form: HTMLFormElement | null | undefined
    const reset = () => {
      void nextTick(() => {
        value.value = String(props.value ?? props.defaultValue ?? '')
        if (input.value) input.value.value = value.value
        compositionCommittedValue = undefined
      })
    }
    onMounted(() => {
      form = input.value?.form
      form?.addEventListener('reset', reset)
      if (input.value) input.value.defaultValue = String(props.defaultValue ?? '')
    })
    expose({ input, element: input, focus: (options?: FocusOptions) => input.value?.focus(options), blur: () => input.value?.blur() })
    const forwarded = useFormControlForwardedProps(() => ({
      ...Object.fromEntries(Object.entries({ id: props.id, disabled: props.disabled, required: props.required }).filter(([, v]) => v !== undefined)), ...attrs
    }))
    const disabled = computed(() => !!forwarded.value.disabled)
    const visibleTokens = computed(() => truncated.value ? props.tokens.slice(0, props.visibleTokenCount) : props.tokens)
    const description = computed(() => { const texts = props.tokens.map(token => typeof token.text === 'string' && token.text.trim().length ? token.text : null).filter((text): text is string => text !== null); return texts.length ? `Selected: ${texts.join(', ')}` : '' })
    watch(() => props.value, next => { if (next !== undefined && !composing.value) { value.value = String(next); if (input.value) input.value.value = value.value } })
    const publishValue = (event: Event) => {
      emit('input', event)
      if (composing.value) return
      const nextValue = (event.target as HTMLInputElement).value
      if (event.type === 'input' && compositionCommittedValue !== undefined) {
        const committedValue = compositionCommittedValue
        compositionCommittedValue = undefined
        if (nextValue === committedValue) return
      }
      if (event.type === 'compositionend') compositionCommittedValue = nextValue
      value.value = nextValue
      emit('update:value', value.value)
      emit('change', event)
      void nextTick(() => {
        if (props.value !== undefined && input.value && !composing.value) { value.value = String(props.value); input.value.value = value.value }
      })
    }
    function remove(id: string | number | undefined) {
      const index = selectedTokenIndex.value
      emit('token-remove', id as string | number)
      later(() => {
        const children = container.value?.children
        const nextElementToFocus = children?.[index || 0] as HTMLElement | undefined
        const firstFocusable = nextElementToFocus && isFocusable(nextElementToFocus)
          ? nextElementToFocus
          : (Array.from(children ?? []) as HTMLElement[]).find(el => isFocusable(el))
        if (firstFocusable) firstFocusable.focus()
        else input.value?.focus()
      })
    }
    function collapseOnBlur() {
      later(() => { if (!container.value?.contains(document.activeElement) && props.visibleTokenCount) truncated.value = true })
    }
    let zone: AbortController | undefined
    watch([container, selectedTokenIndex], () => {
      zone?.abort()
      if (!container.value) return
      zone = focusZone(container.value, {
        focusOutBehavior: 'wrap', bindKeys: FocusKeys.ArrowHorizontal | FocusKeys.HomeAndEnd,
        focusableElementFilter: element => !element.getAttributeNames().includes('aria-hidden'),
        getNextFocusable: direction => {
          const selected = selectedTokenIndex.value
          if (!selected && selected !== 0) return undefined
          let nextIndex = selected + 1 // "+ 1" accounts for the first element: the text input wrapper div
          if (direction === 'next') nextIndex += 1
          if (direction === 'previous') nextIndex -= 1
          if (nextIndex > props.tokens.length || nextIndex < 1) return input.value || undefined
          return container.value?.children[nextIndex] as HTMLElement
        }
      })
    }, { flush: 'post' })
    onBeforeUnmount(() => { zone?.abort(); timeouts.forEach(clearTimeout); form?.removeEventListener('reset', reset) })
    return () => {
      const allAttrs = { ...forwarded.value } as Record<string, unknown>
      delete allAttrs.class; delete allAttrs.style
      const descriptionVisible = attrs.role === 'combobox' && !!description.value
      const leading = props.leadingVisual !== undefined ? renderNode(props.leadingVisual) : slots.leadingVisual?.()
      const trailing = props.trailingVisual !== undefined ? renderNode(props.trailingVisual) : slots.trailingVisual?.()
      const leadingLoading = props.loading && (props.loaderPosition === 'leading' || !!(leading && props.loaderPosition !== 'trailing'))
      const trailingLoading = props.loading && (props.loaderPosition === 'trailing' || (props.loaderPosition === 'auto' && !leading))
      const inputSize = ({ small: 'small', medium: 'small', large: 'medium', xlarge: 'medium' } as const)[props.size]
      return h(TextInputWrapper, {
        block: props.block, contrast: props.contrast, disabled: disabled.value,
        size: inputSize, variant: props.variant, validationStatus: props.validationStatus,
        width: props.width, minWidth: props.minWidth, maxWidth: props.maxWidth,
        hasLeadingVisual: !!(leading || leadingLoading), hasTrailingVisual: !!(trailing || trailingLoading),
        class: [styles['tokens-input'], props.className, attrs.class], style: normalizeReactStyle([{ maxHeight: props.maxHeight || undefined }, attrs.style]),
        'data-token-wrapping': props.preventTokenWrapping || !!props.maxHeight || undefined,
        'data-component': 'TextInputWithTokens', onClick: () => input.value?.focus()
      }, { default: () => [
        props.icon && !leading ? h(props.icon, { class: 'TextInput-icon', 'data-component': 'TextInputWithTokens.Icon' }) : null,
        h(TextInputVisual, {
          position: 'leading', hasVisual: !!leading, hasLoading: typeof props.loading === 'boolean', showLoading: !!leadingLoading,
          'data-component': 'TextInputWithTokens.LeadingVisual'
        }, { default: () => leading }),
        h('div', { ref: container, class: styles['tokens-input__container'], 'data-prevent-token-wrapping': props.preventTokenWrapping }, [
          h('div', { class: styles['tokens-input__input-wrapper'] }, [
            h('input', {
              ...allAttrs, ref: input, type: attrs.type ?? 'text', value: value.value,
              disabled: disabled.value, class: styles['tokens-input__input'],
              'aria-invalid': Object.prototype.hasOwnProperty.call(allAttrs, 'aria-invalid') ? allAttrs['aria-invalid'] : (props.validationStatus === 'error' ? 'true' : 'false'),
              'aria-describedby': [forwarded.value['aria-describedby'], descriptionVisible ? descriptionId : undefined].filter(Boolean).join(' ') || undefined,
              'data-component': 'data-component' in allAttrs ? allAttrs['data-component'] : 'TextInputWithTokens.Input',
              onInput: publishValue,
              onCompositionstart: (event: CompositionEvent) => { compositionCommittedValue = undefined; composing.value = true; emit('compositionstart', event) },
              onCompositionend: (event: CompositionEvent) => { composing.value = false; emit('compositionend', event); publishValue(event) },
              onFocus: (event: FocusEvent) => { emit('focus', event); selectedTokenIndex.value = undefined; if (props.visibleTokenCount) truncated.value = false },
              onBlur: (event: FocusEvent) => { emit('blur', event); collapseOnBlur() },
              onKeydown: (event: KeyboardEvent) => {
                emit('keydown', event)
                const last = props.tokens[props.tokens.length - 1]
                if (!disabled.value && !composing.value && !(event.isComposing || event.keyCode === 229) && !input.value?.value && event.key === 'Backspace' && last) {
                  remove(last.id)
                  value.value = `${last.text} `
                  if (input.value) input.value.value = value.value
                  later(() => input.value?.select())
                }
              }, onKeyup: (event: KeyboardEvent) => emit('keyup', event)
            }),
            descriptionVisible ? h('span', { id: descriptionId, class: styles['sr-only'] }, description.value) : null
          ]),
          ...visibleTokens.value.map(({ id, ...tokenRest }, index) => h(props.tokenComponent, {
            key: id, disabled: disabled.value, size: props.size,
            hideRemoveButton: disabled.value || props.hideTokenRemoveButtons,
            isSelected: selectedTokenIndex.value === index, tabindex: 0,
            'data-component': 'TextInputWithTokens.Token',
            onFocus: () => { if (!disabled.value) selectedTokenIndex.value = index },
            onBlur: () => { selectedTokenIndex.value = undefined; collapseOnBlur() },
            onKeyup: (event: KeyboardEvent) => { if (event.key === 'Escape') input.value?.focus() },
            onClick: (event: MouseEvent) => event.stopPropagation(), onRemove: () => remove(id),
            ...tokenRest
          })),
          truncated.value && props.tokens.length > visibleTokens.value.length ? h('span', { class: styles[`tokens-input__overflow--${props.size}`], 'data-component': 'TextInputWithTokens.OverflowCount' }, `+${props.tokens.length - visibleTokens.value.length}`) : null
        ]),
        h(TextInputVisual, {
          position: 'trailing', hasVisual: !!trailing, hasLoading: typeof props.loading === 'boolean', showLoading: !!trailingLoading,
          'data-component': 'TextInputWithTokens.TrailingVisual'
        }, { default: () => trailing })
      ] })
    }
  }
})
</script>
<style module src="./TextInputWithTokens.module.css" />
