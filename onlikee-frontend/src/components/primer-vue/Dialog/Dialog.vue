<script lang="ts">
let dialogScrollDisabledCount = 0
</script>

<script setup lang="ts">
import {
  h,
  onBeforeUnmount,
  onMounted,
  provide,
  shallowRef,
  useAttrs,
  useCssModule,
  useId,
  useSlots,
  watch,
  type VNodeChild,
} from 'vue'
import DialogHeader from './DialogHeader.vue'
import DialogTitle from './DialogTitle.vue'
import DialogSubtitle from './DialogSubtitle.vue'
import DialogBody from './DialogBody.vue'
import DialogFooter from './DialogFooter.vue'
import DialogCloseButton from './DialogCloseButton.vue'
import DefaultFooter from './DefaultFooter.vue'
import type { DialogComponentProps, DialogHeaderProps } from './types'
import { dialogContextKey } from './context'
import { useFocusTrap } from '../composables/useFocusTrap'
import { useSlots as extractSlots } from '../composables/useSlots'
import { registerEscapeHandler } from '../internal/documentRegistries'
import { normalizeReactStyle } from '../internal/style'
import { resolveFocusTarget } from '../internal/focusTarget'
import { Portal } from '../Portal'

defineOptions({ name: 'PrimerDialog', displayName: 'Dialog', inheritAttrs: false })
const props = withDefaults(defineProps<DialogComponentProps>(), { title: 'Dialog', subtitle: '' })
defineSlots<{ default?: () => VNodeChild }>()
const attrs = useAttrs()
const children = useSlots()
const styles = useCssModule()
provide(dialogContextKey, true)
const dialog = shallowRef<HTMLDivElement | null>(null)
const backdrop = shallowRef<HTMLDivElement | null>(null)
const body = shallowRef<HTMLDivElement | null>(null)
const autoFocusedFooterButtonRef = shallowRef<HTMLButtonElement | null>(null)
const hasOverflow = shallowRef(false)
const footerButtonLayout = shallowRef<'wrap' | 'scroll'>('wrap')
const dialogLabelId = useId()
const dialogDescriptionId = useId()
defineExpose({ element: dialog })
useFocusTrap(() => ({
  containerRef: dialog,
  initialFocusRef: props.initialFocusRef ?? autoFocusedFooterButtonRef,
  restoreFocusOnCleanUp: !resolveFocusTarget(props.returnFocusRef?.value),
  returnFocusRef: props.returnFocusRef,
}))

let lastMouseDownIsBackdrop = false
function handleBackdropMouseDown(event: MouseEvent) {
  lastMouseDownIsBackdrop = event.target === event.currentTarget
}
function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget && lastMouseDownIsBackdrop) props.onClose('escape')
}
function handleCloseKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  event.stopPropagation()
  props.onClose('escape')
}
function defaultHeader(headerProps: DialogHeaderProps) {
  return h(DialogHeader<'div'>, null, {
    default: () =>
      h('div', { class: styles.HeaderInner }, [
        h('div', { class: styles.HeaderContent }, [
          h(DialogTitle, { id: dialogLabelId }, { default: () => headerProps.title ?? 'Dialog' }),
          headerProps.subtitle
            ? h(
                DialogSubtitle,
                { id: dialogDescriptionId },
                { default: () => headerProps.subtitle },
              )
            : headerProps.subtitle,
        ]),
        h(DialogCloseButton, {
          onClose: () => props.onClose('close-button'),
          onKeydown: handleCloseKeydown,
        }),
      ]),
  })
}
const Render = () => {
  for (const button of props.footerButtons ?? []) {
    if (button.autoFocus) button.ref = autoFocusedFooterButtonRef
  }
  const allChildren = children.default?.() ?? []
  const [slots, rest] = extractSlots(allChildren, {
    header: DialogHeader,
    body: DialogBody,
    footer: DialogFooter,
  })
  const defaultedProps = {
    ...props,
    'data-component': attrs['data-component'] as string | undefined,
    children: allChildren,
    title: props.title === undefined ? 'Dialog' : props.title,
    subtitle: props.subtitle === undefined ? '' : props.subtitle,
    role: props.role ?? 'dialog',
    dialogLabelId,
    dialogDescriptionId,
  }
  const header = slots.header ?? (props.renderHeader ?? defaultHeader)(defaultedProps)
  const content =
    slots.body ??
    (props.renderBody
      ? props.renderBody({ ...defaultedProps, children: rest })
      : h(DialogBody<'div'>, null, { default: () => rest }))
  const footer =
    slots.footer ??
    (props.renderFooter
      ? props.renderFooter(defaultedProps)
      : props.footerButtons
        ? h(DefaultFooter, { buttons: props.footerButtons })
        : null)
  const hasFooter = footer != null
  const width = props.width ?? 'xlarge'
  const isPresetWidth =
    typeof width === 'string' && ['small', 'medium', 'large', 'xlarge'].includes(width)
  const position = props.position ?? { narrow: 'center', regular: 'center' }
  const positionAttrs =
    typeof position === 'string'
      ? { 'data-position-regular': position }
      : Object.fromEntries(
          Object.entries(position).map(([key, value]) => [`data-position-${key}`, value]),
        )
  const alignAttrs = props.align ? { 'data-align': props.align } : {}
  return h(Portal, null, {
    default: () =>
      h(
        'div',
        {
          ref: backdrop,
          class: styles.Backdrop,
          ...positionAttrs,
          ...alignAttrs,
          onMousedown: handleBackdropMouseDown,
          onClick: handleBackdropClick,
        },
        [
          h(
            'div',
            {
              ref: dialog,
              role: defaultedProps.role,
              'aria-labelledby': dialogLabelId,
              'aria-describedby': dialogDescriptionId,
              'aria-modal': 'true',
              ...positionAttrs,
              ...alignAttrs,
              'data-width': isPresetWidth ? width : undefined,
              'data-height': props.height ?? 'auto',
              'data-has-footer': hasFooter ? '' : undefined,
              'data-footer-button-layout': hasFooter ? footerButtonLayout.value : undefined,
              class: [props.className, attrs.class, styles.Dialog],
              style: normalizeReactStyle({
                ...props.style,
                ...(!isPresetWidth
                  ? { '--dialog-width': typeof width === 'number' ? `${width}px` : width }
                  : {}),
              }),
              'data-component': attrs['data-component'] ?? 'Dialog',
            },
            [
              header,
              h(
                'div',
                {
                  ref: body,
                  class: [styles.DialogOverflowWrapper, styles.ScrollableRegion],
                  role: hasOverflow.value ? 'region' : undefined,
                  tabindex: hasOverflow.value ? 0 : undefined,
                  'aria-labelledby': hasOverflow.value ? dialogLabelId : undefined,
                  'data-component': 'ScrollableRegion',
                },
                [content],
              ),
              footer,
            ],
          ),
        ],
      ),
  })
}
function updateFooterButtonLayout() {
  if (!dialog.value?.hasAttribute('data-has-footer') || !body.value) return
  dialog.value.setAttribute('data-footer-button-layout', 'wrap')
  footerButtonLayout.value = body.value.clientHeight >= 48 ? 'wrap' : 'scroll'
  dialog.value.setAttribute('data-footer-button-layout', footerButtonLayout.value)
}
watch([body, backdrop], ([region, backdropElement], _previous, onCleanup) => {
  if (!region || !backdropElement) return
  const overflowObserver = new ResizeObserver((entries) => {
    hasOverflow.value = entries.some(
      ({ target }) =>
        target.scrollHeight > target.clientHeight || target.scrollWidth > target.clientWidth,
    )
  })
  overflowObserver.observe(region)
  const layoutObserver = new ResizeObserver(updateFooterButtonLayout)
  layoutObserver.observe(backdropElement)
  onCleanup(() => {
    overflowObserver.disconnect()
    layoutObserver.disconnect()
  })
})
let unregisterEscape: (() => void) | undefined
onMounted(() => {
  dialogScrollDisabledCount++
  document.body.style.setProperty(
    '--prc-dialog-scrollgutter',
    `${window.innerWidth - document.body.clientWidth}px`,
  )
  document.body.setAttribute('data-dialog-scroll-disabled', '')
  unregisterEscape = registerEscapeHandler((event) => {
    props.onClose('escape')
    event.preventDefault()
  })
})
onBeforeUnmount(() => {
  unregisterEscape?.()
  dialogScrollDisabledCount--
  if (dialogScrollDisabledCount === 0) {
    document.body.style.removeProperty('--prc-dialog-scrollgutter')
    document.body.removeAttribute('data-dialog-scroll-disabled')
  }
})
</script>

<template><Render /></template>

<style module src="./Dialog.module.css"></style>
