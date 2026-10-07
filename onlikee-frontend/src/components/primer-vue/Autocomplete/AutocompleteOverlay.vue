<script lang="ts">
import { computed, defineComponent, h, isRef, onBeforeUnmount, onMounted, ref, shallowRef, useCssModule, watch, type Component, type PropType, type Ref } from 'vue'
import Overlay from '../internal/components/Overlay.vue'
import { useAnchoredPosition } from '../composables/useAnchoredPosition'
import { useAutocompleteContext } from './context'
import { normalizeReactStyle } from '../internal/style'

export default defineComponent({
  name: 'AutocompleteOverlay', __SLOT__: Symbol('Autocomplete.Overlay'), inheritAttrs: false,
  props: {
    menuAnchorRef: { type: Object as PropType<Ref<HTMLElement | null> | HTMLElement>, default: undefined },
    overlayProps: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) }, className: { type: String, default: undefined }
  },
  setup(props, { attrs, slots, expose }) {
    const classes = useCssModule()
    const context = useAutocompleteContext()
    const overlay = ref<{ element?: HTMLElement | null } | null>(null)
    const computedAnchorRef = shallowRef<HTMLElement | null>(null)
    const computeAnchor = () => {
      const explicit = (isRef(props.menuAnchorRef) ? props.menuAnchorRef.value : props.menuAnchorRef) ?? null
      const tokensContainer = context.inputRef.value
        ? (context.inputRef.value.closest('[data-prevent-token-wrapping]') as HTMLElement | null)
        : null
      const tokensRoot = tokensContainer?.parentElement ?? null
      computedAnchorRef.value = explicit ?? tokensRoot ?? context.inputRef.value
    }
    watch([() => props.menuAnchorRef, context.inputRef], computeAnchor, { flush: 'post' })
    onMounted(computeAnchor)

    const floatingElement = computed<HTMLElement | null>(() => overlay.value?.element ?? null)
    const { position, updatePosition } = useAnchoredPosition(() => ({
      side: 'outside-bottom',
      align: 'start',
      anchorElementRef: computedAnchorRef,
      floatingElementRef: floatingElement
    }))
    watch(floatingElement, element => { context.scrollContainerRef.value = element }, { flush: 'post' })
    watch([context.showMenu, context.selectedItemLength], () => updatePosition(), { flush: 'post' })

    expose({ element: context.scrollContainerRef })
    onBeforeUnmount(() => { context.scrollContainerRef.value = null })
    return () => {
      if (typeof window === 'undefined') return null
      const closeOptionList = () => context.setShowMenu(false) // :62-64
      const { class: attrsClass, style: attrsStyle, ...newOverlayProps } = attrs
      // :38 —— {...oldOverlayProps, ...newOverlayProps}：顶层额外 attrs 覆盖 overlayProps 同名字段
      const overlayProps = { ...props.overlayProps, ...newOverlayProps }
      return context.showMenu.value
        ? h(Overlay as Component, {
            returnFocusRef: context.inputRef,
            preventFocusOnOpen: true, // :73
            onClickOutside: closeOptionList, // :74
            onEscape: closeOptionList, // :75
            ref: overlay, // :76 mergedScrollContainerRef
            top: position.value?.top, // :77
            left: position.value?.left, // :78
            class: [classes['autocomplete-overlay'], props.className, attrsClass], // :79 clsx(classes.Overlay, className) + attrs class 合并（Vue fallthrough）
            ...overlayProps,
            style: normalizeReactStyle(Object.prototype.hasOwnProperty.call(attrs, 'style') ? attrsStyle : props.overlayProps.style),
            'data-component': 'Autocomplete.Overlay' // :81 —— 始终最后
          }, slots)
        : // :85-89 HACK —— VisuallyHidden(span) 保持 AutocompleteMenu 挂载（内部 hooks 全部继续调用）
          h('span', { class: classes['autocomplete-overlay__hidden'], 'aria-hidden': 'true' }, slots.default?.())
    }
  }
})
</script>

<style module src="./AutocompleteOverlay.module.css"></style>
