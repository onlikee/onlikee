<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef, toValue, useAttrs, useId, watch, watchEffect } from 'vue'
import { focusTrap } from '@primer/behaviors'
import { iterateFocusableElements } from '@primer/behaviors/utils'
import { useAnchoredPosition } from '../../composables/useAnchoredPosition'
import { useFeatureFlag } from '../../FeatureFlags'
import { registerEscapeHandler, registerOutsideClickHandler } from '../documentRegistries'
import type { OverlayProps, OverlayCloseGesture } from './overlayTypes'
import { normalizeReactStyle } from '../style'

// 移植自 React Overlay/Overlay.tsx（BaseOverlay 样式与动画）+ AnchoredOverlay/AnchoredOverlay.tsx
// （定位/visibility/focus trap 门控）+ hooks/useOverlay.tsx（文档级注册表见 ../documentRegistries）。
defineOptions({ name: 'Overlay', inheritAttrs: false })
const props = withDefaults(defineProps<OverlayProps>(), {
  open: true, anchor: null, side: 'outside-bottom', align: 'start', width: 'auto', height: 'auto',
  preventFocusOnOpen: false, trapFocus: false, initialFocusRef: null, returnFocusRef: null,
  allowOutOfBounds: false, displayInViewport: false, pinPosition: false, preventOverflow: true,
  role: 'none' // React Overlay.tsx:149 默认 role='none'（审计 L7）
})
const emit = defineEmits<{
  close: [event: KeyboardEvent | MouseEvent, gesture: OverlayCloseGesture]
}>()
const mounted = shallowRef(false)
const portalRoot = shallowRef<HTMLElement>()
const cssAnchorName = `--primer-overlay-${useId().replace(/[^a-zA-Z0-9_-]/g, '-')}`
const attrs = useAttrs()
// React BaseOverlay 不渲染 data-component（'AnchoredOverlay' 等值由上层经 attrs/rest 传入；
// 裸 Overlay 无该属性，审计 G5-10）。
const dataComponent = computed(() => attrs['data-component'])
const element = shallowRef<HTMLElement | null>(null)
const anchor = computed(() => props.anchor)
const cssAnchorEnabled = useFeatureFlag('primer_react_css_anchor_positioning')
// React AnchoredOverlay.tsx:186-194 的一次性特征检测（style 属性存在性，而非 CSS.supports）
const supportsCssAnchorPositioning = typeof document !== 'undefined' &&
  'anchorName' in document.documentElement.style &&
  'positionTryFallbacks' in document.documentElement.style &&
  'positionVisibility' in document.documentElement.style
const cssAnchor = computed(() => cssAnchorEnabled.value && supportsCssAnchorPositioning && !props.cssAnchorPositioningSettings?.disable)
const { position } = useAnchoredPosition(() => ({
  floatingElementRef: element, anchorElementRef: anchor,
  side: props.side, align: props.align, anchorOffset: props.anchorOffset, alignmentOffset: props.alignmentOffset,
  allowOutOfBounds: props.allowOutOfBounds, displayInViewport: props.displayInViewport, pinPosition: props.pinPosition,
  onPositionChange: props.onPositionChange,
  // React AnchoredOverlay.tsx:271 enabled: open && !cssAnchorPositioning —— modal/显式 top 场景同样计算定位
  //（驱动 visibility/anchorSide/滑入动画；top/left props 在样式层覆盖定位结果，与 React 的 spread 覆盖等价）
  enabled: props.open && !cssAnchor.value
}))
// React AnchoredOverlay.tsx:427 visibility = cssAnchor || position ? 'visible' : 'hidden'；
// 非锚定直用时对应 React BaseOverlay 默认 'visible'（审计 M6 的 trap/zone 门控也依赖它）
const overlayVisibility = computed(() => props.visibility ?? (props.anchor ? (cssAnchor.value || position.value ? 'visible' : 'hidden') : 'visible'))
// React BaseOverlay:96-105,206-216 —— top/left/right/bottom 走 --top/--left CSS 变量（数字补 px），
// 非锚定且未传 top 时变量缺省 → CSS top:auto（审计 M7）；left 保留 React 的向后兼容规则（Overlay.tsx:215）。
const px = (value: number | string | undefined) => typeof value === 'number' ? `${value}px` : value
const effectiveTop = computed(() => props.top ?? (cssAnchor.value || !props.anchor ? undefined : position.value?.top || 0))
const effectiveLeft = computed(() => {
  const left = props.left ?? (cssAnchor.value || !props.anchor ? undefined : position.value?.left || 0)
  return left === undefined && props.right === undefined ? 0 : left
})
const overlayStyle = computed(() => normalizeReactStyle([{
  '--top': px(effectiveTop.value), '--left': px(effectiveLeft.value),
  '--right': px(props.right), '--bottom': px(props.bottom),
  position: props.position
}, props.style]))

let previousFocus: HTMLElement | null = null

// React Overlay.tsx:192-196 height='initial' 锁定初始内容高度
watch([element, () => props.height], ([overlay, height]) => {
  if (overlay && height === 'initial' && overlay.clientHeight) overlay.style.height = `${overlay.clientHeight}px`
}, { flush: 'post' })

// focus trap（React AnchoredOverlay.tsx:290-294 + useFocusTrap.ts:84-99）：
// 门控 = open && visibility!=='hidden'（即定位就绪），deps 仅 container/disabled —— initialFocusRef 元素
// 身份变化不再引发重建（审计 M1/M10）。注册在焦点 watch 之前，保证关闭时先 abort trap 再恢复焦点。
const trapArmed = computed(() => props.open && props.trapFocus && props.focusTrapSettings?.disabled !== true && overlayVisibility.value !== 'hidden')
watch([element, trapArmed], ([overlay, armed], _previous, onCleanup) => {
  if (!overlay || !armed) return
  // React useFocusTrap.ts:96 `focusTrap(container, initialFocusRef.current ?? undefined)`，其中
  // initialFocusRef = useProvidedRefOrCreate(settings?.initialFocusRef)——仅取 focusTrapSettings
  // 的 initialFocusRef，不回退到顶层 prop（审计偏差 #3：移除旧 `?? toValue(props.initialFocusRef)`）。
  // 打开时的初始焦点另由下方 open/close watch（镜像 useOpenAndCloseFocus）处理。
  const initialFocus = toValue(props.focusTrapSettings?.initialFocusRef)
  const controller = focusTrap(overlay, initialFocus ?? undefined)
  onCleanup(() => controller?.abort())
}, { flush: 'post' })

// 打开/关闭焦点（React useOpenAndCloseFocus.ts:18-35）：
// - 每个 open 周期只在元素挂载时尝试一次初始焦点（visibility:hidden 时静默失败，与源一致的怪癖，
//   锚定浮层随后由 focus trap / SelectPanel 自身 effect 补齐焦点）；
// - 首焦点用 behaviors 的 iterateFocusableElements（含可见性过滤，审计 M2），不再回退聚焦容器；
// - 清理时聚焦 returnFocusRef（Vue 防御性回退 previousFocus；React 仅 returnFocusRef）。
watch([element, () => props.preventFocusOnOpen], ([overlay], _previous, onCleanup) => {
  if (!overlay || !props.open) return
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  if (!props.preventFocusOnOpen) {
    const initialFocus = toValue(props.initialFocusRef)
    if (initialFocus) {
      initialFocus.focus()
    } else {
      const firstItem = iterateFocusableElements(overlay).next().value
      firstItem?.focus()
    }
  }
  onCleanup(() => {
    const returnTo = toValue(props.returnFocusRef) ?? previousFocus
    if (returnTo?.isConnected) returnTo.focus()
  })
}, { flush: 'post' })

// 文档级 Escape / 外点（React useOnEscapePress / useOnOutsideClick 注册表语义，见 documentRegistries.ts）：
// - Escape：先 emit 再 preventDefault（React useOverlay.tsx:35-38 顺序，审计 L13），阻断更老的浮层；
// - 外点：辅助键/容器内/ignoreClickRefs/anchor 内 → 返回哨兵中断；否则 emit 后继续穿透更老浮层（审计 M9）。
watch([element, () => props.open], ([overlay, open], _previous, onCleanup) => {
  if (!overlay || !open) return
  const unregisterEscape = registerEscapeHandler(event => {
    if (event.key !== 'Escape') return
    // React useOverlay：仅回调 onEscape prop（React 无 emit 通道；Vue 的 emit('escape') 会命中同名
    // 声明 prop 造成双调用，故不提供）
    props.onEscape?.(event)
    emit('close', event, 'escape')
    event.preventDefault()
  })
  const unregisterOutside = registerOutsideClickHandler(event => {
    // don't call click handler if the mouse event was triggered by an auxiliary button (right click/wheel button/etc)
    if (event.button > 0) return true
    const target = event.target as Node
    // don't call handler if the click happened inside of the container
    if (overlay.contains(target)) return true
    // don't call handler if click happened on an ignored ref —— 锚点豁免不在本层：
    // React 由 AnchoredOverlay 传 ignoreClickRefs=[anchorRef]，且 overlayProps.ignoreClickRefs
    // 可整体替换（消费者可取消锚点豁免，源怪癖，审计 G5-8）；裸 Overlay 无锚点豁免。
    if (props.ignoreClickRefs?.some(ref => toValue(ref)?.contains(target))) return true
    // React useOverlay：仅回调 onClickOutside prop（同 escape，避免与声明 prop 双调用）
    props.onClickOutside?.(event)
    emit('close', event, 'click-outside')
    return undefined
  })
  onCleanup(() => {
    unregisterEscape()
    unregisterOutside()
  })
}, { flush: 'post' })

// 滑入动画（React Overlay.tsx:198-212）：deps=[anchorSide, visibility]；无 prefers-reduced-motion 守卫、
// 不 cancel（源怪癖，审计 L5）。anchorSide 由上层（AnchoredOverlay）按 React 规则传入。
watch(() => [element.value, props.anchorSide, overlayVisibility.value] as const, ([overlay, side, visibility]) => {
  if (!overlay?.animate || visibility === 'hidden') return
  const { x, y } = getSlideAnimationStartingVector(side)
  if (!x && !y) return
  overlay.animate(
    { transform: [`translate(${8 * x}px, ${8 * y}px)`, 'translate(0, 0)'] },
    { duration: 200, easing: 'cubic-bezier(0.33, 1, 0.68, 1)' }
  )
}, { flush: 'post' })

function getSlideAnimationStartingVector(anchorSide?: string): { x: number; y: number } {
  if (anchorSide?.endsWith('bottom')) return { x: 0, y: -1 }
  else if (anchorSide?.endsWith('top')) return { x: 0, y: 1 }
  else if (anchorSide?.endsWith('right')) return { x: -1, y: 0 }
  else if (anchorSide?.endsWith('left')) return { x: 1, y: 0 }
  return { x: 0, y: 0 }
}

// CSS anchor positioning 的 JS 侧（H3 暂缓区：保持 Vue 既有实现，仅特征检测已对齐 React
// AnchoredOverlay.tsx:186-194 的 style 属性存在性检查）：管理 anchor-name/position-anchor/
// position-try-fallbacks，并在 rAF/resize 时计算 cssAlign 与行内偏移。
watchEffect(onCleanup => {
  if (!cssAnchor.value || !props.anchor || !element.value) return
  const anchorElement = props.anchor
  const overlay = element.value
  const name = cssAnchorName
  const old = anchorElement.style.getPropertyValue('anchor-name')
  anchorElement.style.setProperty('anchor-name', name)
  overlay.style.setProperty('position-anchor', name)
  const fallback = props.cssAnchorPositioningSettings?.fallbackStrategy ?? 'default'
  const horizontalSide = props.side.endsWith('left') || props.side.endsWith('right')
  overlay.style.setProperty('position-try-fallbacks', fallback === 'none' ? 'none'
    : fallback === 'opposite-side' ? horizontalSide ? 'flip-inline' : 'flip-block'
    : horizontalSide ? `flip-inline, flip-block, flip-start, --outside-${props.side.endsWith('left') ? 'left' : 'right'}-to-bottom`
      : 'flip-block, flip-inline, flip-block flip-inline, --inline-end-center, --inline-start-center, --fit-block-bottom, --fit-block-top')
  overlay.style.setProperty('--primer-overlay-anchor-offset', `${props.anchorOffset ?? 4}px`)
  const updateAlignment = () => {
    const rect = anchorElement.getBoundingClientRect()
    const width = overlay.getBoundingClientRect().width
    const leftRoom = rect.left
    const rightRoom = window.innerWidth - rect.right
    overlay.dataset.cssAlign = leftRoom > rightRoom ? 'left' : 'right'
    overlay.style.setProperty('--primer-overlay-inline-offset', `${Math.max(0, rect.left + width - window.innerWidth + 8)}px`)
  }
  const frame = requestAnimationFrame(updateAlignment)
  window.addEventListener('resize', updateAlignment)
  onCleanup(() => {
    cancelAnimationFrame(frame)
    window.removeEventListener('resize', updateAlignment)
    anchorElement.style.setProperty('anchor-name', old)
  })
}, { flush: 'post' })

onMounted(() => {
  let container = document.getElementById('__primerVuePortalRoot__')
  if (!container) {
    container = document.createElement('div')
    container.id = '__primerVuePortalRoot__'
    Object.assign(container.style, { position: 'absolute', top: '0', left: '0', width: '100%' })
    ;(document.querySelector('[data-portal-root]') ?? document.body).appendChild(container)
  }
  portalRoot.value = container
  mounted.value = true
})
onBeforeUnmount(() => { mounted.value = false })
defineExpose({ element, position, visibility: overlayVisibility, cssAnchor, focus: () => element.value?.focus() })
</script>
<template>
  <Teleport
    v-if="mounted && open"
    :to="portalRoot!"
  >
    <div
      data-component="Portal"
      style="position: relative; z-index: 1"
    >
      <div
        ref="element"
        v-bind="$attrs"
        :class="['primer-overlay', className]"
        :style="overlayStyle"
        :data-width="width"
        :data-height="height"
        :data-max-height="maxHeight"
        :data-max-width="maxWidth"
        :overflow="overflow"
        :[`data-overflow-${overflow}`]="overflow ? '' : undefined"
        :data-css-anchor="cssAnchor || undefined"
        :data-side="cssAnchor ? side : position?.anchorSide"
        :data-anchor-position="anchor ? (cssAnchor ? 'true' : 'false') : undefined"
        :data-responsive="responsiveVariant"
        :data-visibility="overlayVisibility"
        :data-reflow-container="preventOverflow === false ? 'true' : undefined"
        :role="role"
        :data-component="dataComponent"
      >
        <slot />
      </div>
    </div>
  </Teleport>
</template>
<style scoped>
/* React Overlay.module.css 移植（选择器改为本端口 data-* 命名，见审计 L6 记录）。
 * z-index 为有意偏离（审计 M3）：React 不设 z-index（靠 Portal wrapper z-index:1 + DOM 顺序），
 * 但本应用 chrome 使用 9999/10000 层级（Header/ComponentLayout/Dialog），需要压过它们；
 * SelectPanel.css:2-7 将 SelectPanel 场景归一回 auto/100 以保持对照脚本像素一致。 */
.primer-overlay { position: absolute; z-index: var(--zIndex-overlay, 10001); box-sizing: border-box; min-width: 192px; width: auto; height: auto; max-width: calc(100vw - 2rem); max-height: 100vh; border-radius: var(--borderRadius-large, 12px); background: var(--overlay-bgColor, #fff); box-shadow: var(--shadow-floating-small, 0 0 0 1px #d1d9e080, 0 6px 12px -3px #25292e0a, 0 6px 18px 0 #25292e1f); outline: none; overflow: auto; }
/* React Overlay.module.css:23-44 —— 定位走 --top/--left/--right/--bottom 变量（fallback auto） */
.primer-overlay[data-anchor-position='false'],
.primer-overlay:not([data-anchor-position]):not([data-variant='modal']) { right: var(--right, auto); bottom: var(--bottom, auto); }
.primer-overlay[data-anchor-position='false']:not([data-variant]),
.primer-overlay:not([data-anchor-position]):not([data-variant='modal']):not([data-variant]) { top: var(--top, auto); left: var(--left, auto); }
.primer-overlay:focus { outline: none; }
/* React Overlay.module.css:55-57 —— preventOverflow=false 时的 reflow 容器标记（与基础 max-width 同值，源即冗余，忠实保留） */
.primer-overlay:where([data-reflow-container='true']) { max-width: calc(100vw - 2rem); }
/* React Overlay.module.css:59-73 —— overflow prop 渲染为非法 HTML 属性 + data-overflow-* 标记，
   由 :where 规则设 overflow（源怪癖，审计 G5-13；基础规则 overflow:auto 在其之前，同特异度按序覆盖）。 */
.primer-overlay:where([data-overflow-auto]) { overflow: auto; }
.primer-overlay:where([data-overflow-hidden]) { overflow: hidden; }
.primer-overlay:where([data-overflow-scroll]) { overflow: scroll; }
.primer-overlay:where([data-overflow-visible]) { overflow: visible; }
.primer-overlay[data-width='small'] { width: 256px; }.primer-overlay[data-width='medium'] { width: 320px; }.primer-overlay[data-width='large'] { width: 480px; }.primer-overlay[data-width='xlarge'] { width: 640px; }.primer-overlay[data-width='xxlarge'] { width: 960px; }
.primer-overlay[data-height='small'] { height: 256px; }.primer-overlay[data-height='medium'] { height: 320px; }.primer-overlay[data-height='large'] { height: 432px; }.primer-overlay[data-height='xlarge'] { height: 600px; }
.primer-overlay[data-height='xsmall'] { height: 192px; }.primer-overlay[data-height='fit-content'] { height: fit-content; }
.primer-overlay[data-max-height='xsmall'] { max-height: min(192px, 100vh); }.primer-overlay[data-max-height='small'] { max-height: min(256px, 100vh); }.primer-overlay[data-max-height='medium'] { max-height: min(320px, 100vh); }.primer-overlay[data-max-height='large'] { max-height: min(432px, 100vh); }.primer-overlay[data-max-height='xlarge'] { max-height: min(600px, 100vh); }.primer-overlay[data-max-height='fit-content'] { max-height: fit-content; }
@supports (height: 100dvh) {
  .primer-overlay[data-max-height='xsmall'] { max-height: min(192px, 100dvh); }.primer-overlay[data-max-height='small'] { max-height: min(256px, 100dvh); }.primer-overlay[data-max-height='medium'] { max-height: min(320px, 100dvh); }.primer-overlay[data-max-height='large'] { max-height: min(432px, 100dvh); }.primer-overlay[data-max-height='xlarge'] { max-height: min(600px, 100dvh); }
}
.primer-overlay[data-max-width='small'] { max-width: 256px; }.primer-overlay[data-max-width='medium'] { max-width: 320px; }.primer-overlay[data-max-width='large'] { max-width: 480px; }.primer-overlay[data-max-width='xlarge'] { max-width: 640px; }.primer-overlay[data-max-width='xxlarge'] { max-width: 960px; }
/* React Overlay.module.css:195-201 —— visibility 由 data 属性驱动（:where 保持零特异性） */
.primer-overlay:where([data-visibility='visible']) { visibility: visible; }
.primer-overlay:where([data-visibility='hidden']) { visibility: hidden; }
/* React Overlay.module.css:26-53 fullscreen 响应式：JS 只负责 data-responsive 标记，
 * 是否全屏完全由 narrow 媒体查询决定（审计 M4：字符串 variant 不再于桌面端触发全屏）。
 * 本端口断点适配：48rem → 768px（根字号 16px 下等价，记录于 SELECT_PANEL_PARITY.md）。 */
@media screen and (max-width: calc(768px - 0.02px)) {
  .primer-overlay[data-anchor-position='false'][data-responsive='fullscreen']:not([data-variant]),
  .primer-overlay:not([data-anchor-position]):not([data-variant='modal'])[data-responsive='fullscreen']:not([data-variant]) { top: 0; left: 0; }
  .primer-overlay:where([data-responsive='fullscreen']),
  .primer-overlay[data-responsive='fullscreen'][data-anchor-position='true'],
  .primer-overlay[data-component='AnchoredOverlay'][data-responsive='fullscreen'][data-anchor-position='true'] {
    position: fixed; top: 0; left: 0; width: 100vw; max-width: none; height: 100vh; max-height: none;
    margin: 0; border-radius: unset; padding-bottom: env(safe-area-inset-bottom);
  }
}
@supports (height: 100dvh) {
  @media screen and (max-width: calc(768px - 0.02px)) {
    .primer-overlay:where([data-responsive='fullscreen']),
    .primer-overlay[data-responsive='fullscreen'][data-anchor-position='true'],
    .primer-overlay[data-component='AnchoredOverlay'][data-responsive='fullscreen'][data-anchor-position='true'] { height: 100dvh; }
  }
}
/* React Overlay.module.css:226-231 —— legacy fullscreen dvh 修正（data-variant 由消费者经 attrs 传入，审计 G5-12）。 */
@supports (height: 100dvh) {
  .primer-overlay:where([data-variant='fullscreen']) { height: 100dvh; }
}
/* CSS anchor positioning（flag 关闭时 inert；React AnchoredOverlay.module.css:16-27 对应） */
.primer-overlay[data-css-anchor] { position: fixed; position-visibility: anchors-visible; z-index: 100; }
.primer-overlay[data-css-anchor][data-side='outside-bottom'],.primer-overlay[data-css-anchor][data-side='inside-bottom'] { top: calc(anchor(bottom) + var(--primer-overlay-anchor-offset, 4px)); left: calc(anchor(left) - var(--primer-overlay-inline-offset, 0px)); }
.primer-overlay[data-css-anchor][data-side='outside-top'],.primer-overlay[data-css-anchor][data-side='inside-top'] { bottom: anchor(top); margin-bottom: var(--primer-overlay-anchor-offset, 4px); left: calc(anchor(left) - var(--primer-overlay-inline-offset, 0px)); }
.primer-overlay[data-css-anchor][data-css-align='left']:is([data-side='outside-bottom'],[data-side='inside-bottom'],[data-side='outside-top'],[data-side='inside-top']) { left: auto; right: anchor(right); }
.primer-overlay[data-css-anchor][data-side='outside-left'],.primer-overlay[data-css-anchor][data-side='inside-left'] { right: anchor(left); top: anchor(top); margin-right: var(--primer-overlay-anchor-offset, 4px); }
.primer-overlay[data-css-anchor][data-side='outside-right'],.primer-overlay[data-css-anchor][data-side='inside-right'] { left: anchor(right); top: anchor(top); margin-left: var(--primer-overlay-anchor-offset, 4px); }
.primer-overlay[data-css-anchor][data-side='inside-center'] { position-area: center; }
@position-try --inline-end-center { left: anchor(right); top: auto; bottom: auto; margin-left: var(--base-size-4, 4px); align-self: anchor-center; }
@position-try --inline-start-center { right: anchor(left); left: auto; top: auto; bottom: auto; margin-right: var(--base-size-4, 4px); align-self: anchor-center; }
@position-try --fit-block-bottom { top: calc(anchor(bottom) + var(--base-size-4, 4px)); bottom: var(--base-size-8, 8px); height: auto; max-height: none; }
@position-try --fit-block-top { top: var(--base-size-8, 8px); bottom: calc(100vh - anchor(top) + var(--base-size-4, 4px)); height: auto; max-height: none; }
@position-try --outside-left-to-bottom { right: anchor(right); top: calc(anchor(bottom) + var(--base-size-4, 4px)); margin: 0; width: auto; }
@position-try --outside-right-to-bottom { left: anchor(left); top: calc(anchor(bottom) + var(--base-size-4, 4px)); margin: 0; width: auto; }
@media (prefers-reduced-motion: no-preference) { .primer-overlay { animation: overlay-in 200ms cubic-bezier(0.33, 1, 0.68, 1); } }
@media (forced-colors: active) { .primer-overlay { outline: 1px solid transparent; } }
@keyframes overlay-in { from { opacity: 0; } to { opacity: 1; } }
</style>
