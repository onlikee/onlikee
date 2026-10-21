import { onMounted, onBeforeUnmount, shallowRef, watchEffect, type Ref } from 'vue'
import { usePaneWidth, updateAriaValues, type UsePaneWidthOptions } from './usePaneWidth'

/** Shared gesture math for the source's Pane and Sidebar dividers. */
export function useResizablePane(
  getOptions: () => UsePaneWidthOptions,
  getPosition: () => 'start' | 'end',
  sidebar = false,
) {
  const sizing = usePaneWidth(getOptions)
  let dragStartClientX = 0
  let dragStartWidth = 0
  let dragMaxWidth = 0
  function onDragStart(clientX: number) {
    dragStartClientX = clientX
    dragStartWidth =
      getOptions().paneRef.value?.getBoundingClientRect().width ?? sizing.currentWidthRef.value
    dragMaxWidth = sizing.getMaxPaneWidth()
  }
  function onDrag(value: number, keyboard: boolean) {
    const { paneRef, handleRef } = getOptions()
    const maxWidth = keyboard ? sizing.getMaxPaneWidth() : dragMaxWidth
    if (keyboard) {
      const delta = sidebar && getPosition() === 'end' ? -value : value
      const newWidth = Math.max(
        sizing.minPaneWidth.value,
        Math.min(maxWidth, sizing.currentWidthRef.value + delta),
      )
      if (newWidth !== sizing.currentWidthRef.value) {
        sizing.currentWidthRef.value = newWidth
        paneRef.value?.style.setProperty('--pane-width', `${newWidth}px`)
        updateAriaValues(handleRef.value, { current: newWidth, max: maxWidth })
      }
    } else if (paneRef.value) {
      const deltaX = value - dragStartClientX
      const directedDelta = getPosition() === 'end' ? -deltaX : deltaX
      const clamped = Math.max(
        sizing.minPaneWidth.value,
        Math.min(maxWidth, dragStartWidth + directedDelta),
      )
      if (Math.round(clamped) !== Math.round(sizing.currentWidthRef.value)) {
        paneRef.value.style.setProperty('--pane-width', `${clamped}px`)
        sizing.currentWidthRef.value = clamped
        updateAriaValues(handleRef.value, { current: Math.round(clamped), max: maxWidth })
      }
    }
  }
  function onDragEnd() {
    sizing.saveWidth(sizing.currentWidthRef.value)
  }
  function onDoubleClick() {
    const { paneRef, handleRef } = getOptions()
    const reset = sizing.getDefaultWidth()
    if (paneRef.value) {
      paneRef.value.style.setProperty('--pane-width', `${reset}px`)
      sizing.currentWidthRef.value = reset
      updateAriaValues(handleRef.value, { current: reset })
    }
    sizing.saveWidth(reset)
  }
  return { ...sizing, onDragStart, onDrag, onDragEnd, onDoubleClick }
}

export function useOverflow(
  element: Ref<HTMLElement | null>,
  label: () => string | undefined,
  labelledBy: () => string | undefined,
  name: 'Pane' | 'Sidebar',
) {
  const hasOverflow = shallowRef(false)
  let observer: ResizeObserver | undefined
  onMounted(() => {
    if (!element.value) return
    observer = new ResizeObserver((entries) => {
      hasOverflow.value = entries.some(
        ({ target }) =>
          target.scrollHeight > target.clientHeight || target.scrollWidth > target.clientWidth,
      )
    })
    observer.observe(element.value)
  })
  onBeforeUnmount(() => observer?.disconnect())
  watchEffect(() => {
    if (
      import.meta.env.DEV &&
      hasOverflow.value &&
      label() === undefined &&
      labelledBy() === undefined
    ) {
      console.warn(
        `The <PageLayout.${name}> has overflow and \`aria-label\` or \`aria-labelledby\` has not been set. ` +
          `Please provide \`aria-label\` or \`aria-labelledby\` to <PageLayout.${name}> in order to label this region.`,
      )
    }
  })
  return hasOverflow
}
