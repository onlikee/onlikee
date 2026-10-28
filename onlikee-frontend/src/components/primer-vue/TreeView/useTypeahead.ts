import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import { getAccessibleName } from './shared'
import { useTreeItemCache } from './useTreeItemCache'

export function useTypeahead({
  containerRef,
  onFocusChange,
}: {
  containerRef: Ref<HTMLElement | null>
  onFocusChange: (element: HTMLElement) => void
}) {
  let searchValue = ''
  let timeout: ReturnType<typeof setTimeout> | undefined
  const { getTreeItems } = useTreeItemCache(containerRef)
  function onKeyDown(event: KeyboardEvent) {
    if (!event.key || event.key.length > 1 || event.key === ' ') return
    if (event.ctrlKey || event.altKey || event.metaKey) return
    searchValue += event.key
    const elements = getTreeItems()
    const activeIndex = elements.findIndex((element) => element === document.activeElement)
    let sorted = elements.map((_, index) => elements[(activeIndex + index) % elements.length]!)
    if (searchValue.length === 1) sorted = sorted.slice(1)
    const match = sorted.find((element) =>
      getAccessibleName(element).toLowerCase().startsWith(searchValue.toLowerCase()),
    )
    if (match) onFocusChange(match)
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      searchValue = ''
    }, 300)
    event.preventDefault()
    event.stopPropagation()
  }
  onMounted(() => containerRef.value?.addEventListener('keydown', onKeyDown))
  onBeforeUnmount(() => {
    containerRef.value?.removeEventListener('keydown', onKeyDown)
    clearTimeout(timeout)
  })
}
