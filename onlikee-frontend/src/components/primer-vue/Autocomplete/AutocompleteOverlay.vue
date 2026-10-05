<script lang="ts">
import { computed, defineComponent, h, isRef, onBeforeUnmount, onMounted, ref, shallowRef, watch, type Component, type PropType, type Ref } from 'vue'
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
    const context = useAutocompleteContext()
    const overlay = ref<{ element?: HTMLElement | null } | null>(null)
    // AutocompleteOverlay.tsx:41-49 —— effect deps [menuAnchorRef, inputRef]：React 在 commit 后运行，
    // refs 必然已就绪；Vue 中 inputRef 由 Input 的 post watcher 稍后写入，故把它加入依赖，
    // 到达时重算一次（等价 post-commit 时机；onMounted 兜底显式 menuAnchorRef/无 Input 场景）。
    // registered：Vue 类型允许传裸元素（源只解析 .current，裸元素在源中等于 null）
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

    // AutocompleteOverlay.tsx:51-60 —— useAnchoredPosition({side, align, anchorElementRef}, [showMenu, selectedItemLength])
    // + useMergedRefs(scrollContainerRef, floatingElementRef)。定位由本层计算后以 top/left 传给裸 Overlay
    //（源不再传 anchor/side/align —— 内部 Overlay 自身定位保持关闭，避免双重定位）
    const floatingElement = computed<HTMLElement | null>(() => overlay.value?.element ?? null)
    const { position, updatePosition } = useAnchoredPosition(() => ({
      side: 'outside-bottom',
      align: 'start',
      anchorElementRef: computedAnchorRef,
      floatingElementRef: floatingElement
    }))
    watch(floatingElement, element => { context.scrollContainerRef.value = element }, { flush: 'post' })
    // 源 hook 第二参 deps [showMenu, selectedItemLength] → 打开/选中长度变化时重算位置（M-12）。
    // registered：内部 Overlay 经 Teleport 延迟一帧挂载，floatingElement 到达时由 useAnchoredPosition
    // 内部 watch 自行补算，无需在此重复。
    watch([context.showMenu, context.selectedItemLength], () => updatePosition(), { flush: 'post' })

    expose({ element: context.scrollContainerRef })
    onBeforeUnmount(() => { context.scrollContainerRef.value = null })
    return () => {
      if (typeof window === 'undefined') return null // AutocompleteOverlay.tsx:66-68
      const closeOptionList = () => context.setShowMenu(false) // :62-64
      const { class: attrsClass, style: attrsStyle, ...newOverlayProps } = attrs
      // :38 —— {...oldOverlayProps, ...newOverlayProps}：顶层额外 attrs 覆盖 overlayProps 同名字段
      const overlayProps = { ...props.overlayProps, ...newOverlayProps }
      return context.showMenu.value
        ? h(Overlay as Component, {
            returnFocusRef: context.inputRef, // :72 —— ref 对象（源按 ref 传递）
            preventFocusOnOpen: true, // :73
            onClickOutside: closeOptionList, // :74
            onEscape: closeOptionList, // :75
            ref: overlay, // :76 mergedScrollContainerRef
            top: position.value?.top, // :77
            left: position.value?.left, // :78
            class: ['autocomplete-overlay', props.className, attrsClass], // :79 clsx(classes.Overlay, className) + attrs class 合并（Vue fallthrough）
            ...overlayProps, // :80 —— 可覆盖以上 top/left/class（源 spread 顺序怪癖，原样保留）
            style: normalizeReactStyle(Object.prototype.hasOwnProperty.call(attrs, 'style') ? attrsStyle : props.overlayProps.style),
            'data-component': 'Autocomplete.Overlay' // :81 —— 始终最后
          }, slots)
        : // :85-89 HACK —— VisuallyHidden(span) 保持 AutocompleteMenu 挂载（内部 hooks 全部继续调用）
          h('span', { class: 'autocomplete-overlay__hidden', 'aria-hidden': 'true' }, slots.default?.())
    }
  }
})
</script>

<style scoped>
/* AutocompleteOverlay.module.css —— 仅 overflow: auto（M-7：移除捏造的 max-height:300px；
   min-width:192px 属 React Overlay.module.css 基础层，由 internal Overlay .primer-overlay 提供） */
.autocomplete-overlay { overflow: auto; }
/* _VisuallyHidden.module.css .InternalVisuallyHidden */
.autocomplete-overlay__hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
</style>
