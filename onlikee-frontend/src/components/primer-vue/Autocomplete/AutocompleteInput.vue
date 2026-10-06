<script lang="ts">
import { defineComponent, h, nextTick, onBeforeUnmount, ref, watch, type Component, type PropType } from 'vue'
import { TextInput } from '../TextInput'
import { useFormControlForwardedProps } from '../FormControl/context'
import { useAutocompleteContext } from './context'
import { normalizeReactStyle } from '../internal/style'

const ARROW_KEYS_NAV = new Set(['ArrowUp', 'ArrowDown'])

export default defineComponent({
  name: 'AutocompleteInput', __SLOT__: Symbol('Autocomplete.Input'), inheritAttrs: false,
  props: {
    as: { type: [Object, Function] as PropType<Component>, default: TextInput },
    openOnFocus: Boolean, value: { type: [String, Number], default: undefined }, defaultValue: { type: [String, Number], default: undefined }
  },
  emits: {
    'update:value': (_value: string) => true, change: (_event: Event) => true, input: (_event: Event) => true,
    focus: (_event: FocusEvent) => true, blur: (_event: FocusEvent) => true,
    keydown: (_event: KeyboardEvent) => true, 'keydown-capture': (_event: KeyboardEvent) => true,
    keyup: (_event: KeyboardEvent) => true, keypress: (_event: KeyboardEvent) => true,
    compositionstart: (_event: CompositionEvent) => true, compositionend: (_event: CompositionEvent) => true
  },
  setup(props, { attrs, slots, emit, expose }) {
    const context = useAutocompleteContext()
    const highlightRemainingText = ref(true)
    const displayedValue = ref(String(props.value ?? props.defaultValue ?? ''))
    const component = ref<{ input?: HTMLInputElement, element?: HTMLInputElement } | HTMLInputElement | null>(null)
    const forwarded = useFormControlForwardedProps(() => ({ id: context.id.value, ...attrs }))
    const timeouts = new Set<ReturnType<typeof setTimeout>>()
    const handledChanges = new WeakSet<Event>()
    let compositionCommittedValue: string | undefined
    const later = (callback: () => void) => { const id = setTimeout(() => { timeouts.delete(id); callback() }, 0); timeouts.add(id) }
    let form: HTMLFormElement | null | undefined
    const reset = () => {
      void nextTick(() => {
        const value = String(props.value ?? props.defaultValue ?? '')
        context.setAutocompleteSuggestion('')
        context.setInputValue(value)
        context.setShowMenu(false)
        displayedValue.value = value
        if (context.inputRef.value) context.inputRef.value.value = value
        compositionCommittedValue = undefined
      })
    }
    watch(component, instance => {
      form?.removeEventListener('reset', reset)
      context.inputRef.value = instance instanceof HTMLInputElement ? instance : instance?.input ?? instance?.element ?? null
      form = context.inputRef.value?.form
      form?.addEventListener('reset', reset)
      if (context.inputRef.value) context.inputRef.value.defaultValue = String(props.defaultValue ?? '')
    }, { flush: 'post' })
    expose({ input: context.inputRef, element: context.inputRef, focus: (options?: FocusOptions) => context.inputRef.value?.focus(options), blur: () => context.inputRef.value?.blur() })
    watch(() => props.value, value => context.setInputValue(value !== undefined ? String(value) : ''), { immediate: true })
    watch([context.autocompleteSuggestion, context.inputValue, context.isMenuDirectlyActivated, context.composing], () => {
      const input = context.inputRef.value
      if (!input || context.composing.value) return
      const suggestion = context.autocompleteSuggestion.value
      const value = context.inputValue.value
      displayedValue.value = value
      if (!suggestion) input.value = value
      if (document.activeElement === input && highlightRemainingText.value && suggestion && (value || context.isMenuDirectlyActivated.value)) {
        input.value = suggestion
        displayedValue.value = suggestion
        if (suggestion.toLowerCase().startsWith(value.toLowerCase())) input.setSelectionRange(value.length, suggestion.length)
      }
    }, { flush: 'post' })
    onBeforeUnmount(() => { timeouts.forEach(clearTimeout); form?.removeEventListener('reset', reset); context.inputRef.value = null })
    const change = (event: Event) => {
      if (handledChanges.has(event)) return
      emit('input', event)
      if (context.composing.value) return
      handledChanges.add(event)
      const value = (event.target as HTMLInputElement).value
      if (event.type === 'input' && compositionCommittedValue !== undefined) {
        const committedValue = compositionCommittedValue
        compositionCommittedValue = undefined
        if (value === committedValue) return
      }
      if (event.type === 'compositionend') compositionCommittedValue = value
      emit('change', event)
      emit('update:value', value)
      context.setInputValue(value)
      context.setShowMenu(true)
      if (props.value !== undefined) void nextTick(() => { context.setInputValue(String(props.value)) })
    }
    return () => h(props.as ?? TextInput, {
      ref: component,
      value: displayedValue.value, defaultValue: props.defaultValue,
      'aria-controls': `${context.id.value}-listbox`, 'aria-autocomplete': 'both',
      role: 'combobox', 'aria-expanded': context.showMenu.value, 'aria-haspopup': 'listbox',
      'aria-owns': `${context.id.value}-listbox`, autocomplete: 'off', ...forwarded.value,
      style: normalizeReactStyle(forwarded.value.style), 'data-component': 'Autocomplete.Input',
      onInput: change,
      onFocus: (event: FocusEvent) => {
        context.notifyControlFocus()
        emit('focus', event)
        if (props.openOnFocus) context.setShowMenu(true)
      },
      onBlur: (event: FocusEvent) => {
        context.notifyControlBlur()
        emit('blur', event)
        later(() => {
          const target = event.relatedTarget as Node | null
          const menu = document.getElementById(`${context.id.value}-listbox`)
          if (!target || (target !== menu && !menu?.contains(target))) {
            context.setShowMenu(false)
            // :79-81 —— 仅当建议文本与状态不一致时还原输入（registered：Vue 受控 TextInput 需同步 displayedValue）
            const input = context.inputRef.value
            if (input && context.autocompleteSuggestion.value && input.value !== context.inputValue.value) {
              input.value = context.inputValue.value
              displayedValue.value = context.inputValue.value
            }
          }
        })
      },
      onKeydownCapture: (event: KeyboardEvent) => { emit('keydown-capture', event); if (!context.showMenu.value && ARROW_KEYS_NAV.has(event.key) && !event.altKey) event.preventDefault() },
      onKeydown: (event: KeyboardEvent) => {
        if (context.composing.value || event.isComposing || event.keyCode === 229) { emit('keydown', event); return } // Vue IME 增补（registered）
        if (context.navigate(event)) event.preventDefault()
        emit('keydown', event)
        if (event.key === 'Backspace') highlightRemainingText.value = false // :100-102
        if (event.key === 'Escape' && context.inputRef.value?.value) {
          context.setInputValue('')
          context.inputRef.value.value = ''
          displayedValue.value = '' // Vue glue：受控 TextInput 同步（registered）
        }
        if (!context.showMenu.value && ARROW_KEYS_NAV.has(event.key) && !event.altKey) context.setShowMenu(true) // :108-110
      },
      onKeyup: (event: KeyboardEvent) => { emit('keyup', event); if (event.key === 'Backspace') highlightRemainingText.value = true },
      onKeypress: (event: KeyboardEvent) => {
        emit('keypress', event)
        if (!context.composing.value && !event.isComposing && context.showMenu.value && event.key === 'Enter' && context.activeDescendantRef.value) {
          event.preventDefault()
          event.stopImmediatePropagation()
          context.activeDescendantRef.value.dispatchEvent(new KeyboardEvent(event.type, event))
        }
      },
      onCompositionstart: (event: CompositionEvent) => { compositionCommittedValue = undefined; context.composing.value = true; emit('compositionstart', event) },
      onCompositionend: (event: CompositionEvent) => { context.composing.value = false; emit('compositionend', event); change(event) }
    }, slots)
  }
})
</script>
