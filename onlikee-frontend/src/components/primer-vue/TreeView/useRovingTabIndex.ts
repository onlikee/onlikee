import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import { focusZone, FocusKeys } from '@primer/behaviors'
import { getNextFocusableElement } from './navigation'
export * from './navigation'

export function useRovingTabIndex({
  containerRef,
  mouseDownRef,
  preventScroll = true,
}: {
  containerRef: Ref<HTMLElement | null>
  mouseDownRef?: Ref<boolean>
  preventScroll?: boolean
}) {
  let controller: AbortController | undefined
  onMounted(() => {
    if (!containerRef.value) return
    controller = focusZone(containerRef.value, {
      bindKeys:
        FocusKeys.ArrowVertical |
        FocusKeys.ArrowHorizontal |
        FocusKeys.HomeAndEnd |
        FocusKeys.Backspace |
        FocusKeys.PageUpDown,
      preventScroll,
      getNextFocusable: (_direction, from, event) => {
        if (!(from instanceof HTMLElement)) return
        // Some supported DOM environments do not implement :modal.
        try {
          if (from.closest('dialog:modal')) return
        } catch {
          /* Continue navigation. */
        }
        return getNextFocusableElement(from, event) ?? from
      },
      focusInStrategy: () => {
        if (mouseDownRef?.value) return
        const current = containerRef.value?.querySelector('[aria-current]')
        if (current instanceof HTMLElement) return current
        if (
          document.activeElement instanceof HTMLElement &&
          containerRef.value?.contains(document.activeElement) &&
          document.activeElement.getAttribute('role') === 'treeitem'
        )
          return document.activeElement
        const first = containerRef.value?.querySelector('[role="treeitem"]')
        return first instanceof HTMLElement ? first : undefined
      },
    })
  })
  onBeforeUnmount(() => controller?.abort())
}
