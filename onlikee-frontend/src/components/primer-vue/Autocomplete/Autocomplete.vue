<script lang="ts">
import { computed, defineComponent, h, Fragment, nextTick, provide, ref, shallowRef, useId, watch } from 'vue'
import { AutocompleteContext, type AutocompleteContextValue } from './context'

export default defineComponent({
  name: 'Autocomplete', __SLOT__: Symbol('Autocomplete'), inheritAttrs: false,
  props: { id: { type: String, default: undefined } },
  setup(props, { slots, expose }) {
    const generatedId = useId()
    const inputValue = ref('')
    const deferredInputValue = ref('')
    const showMenu = ref(false)
    const inputRef = shallowRef<HTMLInputElement | null>(null)
    const context: AutocompleteContextValue = {
      id: computed(() => props.id ?? generatedId), inputRef,
      activeDescendantRef: shallowRef(null), scrollContainerRef: shallowRef(null),
      inputValue, deferredInputValue, showMenu,
      autocompleteSuggestion: ref(''), isMenuDirectlyActivated: ref(false), selectedItemLength: ref(0), composing: ref(false),
      setInputValue: value => { inputValue.value = value }, setShowMenu: value => { showMenu.value = value },
      setAutocompleteSuggestion: value => { context.autocompleteSuggestion.value = value },
      setIsMenuDirectlyActivated: value => { context.isMenuDirectlyActivated.value = value },
      setSelectedItemLength: value => { context.selectedItemLength.value = value },
      navigate: () => false, notifyControlFocus: () => {}, notifyControlBlur: () => {}
    }
    // Vue batches updates after native input dispatch, keeping typing ahead of menu filtering.
    watch(inputValue, value => { if (!context.composing.value) deferredInputValue.value = value }, { flush: 'post' })
    watch(context.composing, composing => { if (!composing) deferredInputValue.value = inputValue.value })
    watch(showMenu, shown => { if (!shown) { context.activeDescendantRef.value = null; inputRef.value?.removeAttribute('aria-activedescendant') } })
    provide(AutocompleteContext, context)
    expose({ context, input: inputRef, element: inputRef, focus: (options?: FocusOptions) => inputRef.value?.focus(options), blur: () => inputRef.value?.blur(), open: () => { showMenu.value = true; void nextTick(() => inputRef.value?.focus()) } })
    return () => h(Fragment, slots.default?.())
  }
})
</script>
