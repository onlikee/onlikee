import { onBeforeUnmount, onMounted, type Ref } from 'vue'

export function useTreeItemCache(containerRef: Ref<HTMLElement | null>) {
  let cache: HTMLElement[] | null = null
  let observer: MutationObserver | undefined
  onMounted(() => {
    if (!containerRef.value) return
    observer = new MutationObserver((mutations) => {
      if (
        mutations.some(
          (mutation) => mutation.type === 'childList' || mutation.attributeName === 'role',
        )
      )
        cache = null
    })
    observer.observe(containerRef.value, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['role'],
    })
    cache = null
  })
  onBeforeUnmount(() => observer?.disconnect())
  return {
    getTreeItems(): HTMLElement[] {
      if (!containerRef.value) return []
      return (cache ??= Array.from(
        containerRef.value.querySelectorAll<HTMLElement>('[role="treeitem"]'),
      ))
    },
  }
}
