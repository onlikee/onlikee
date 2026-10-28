// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, shallowRef, type Ref } from 'vue'
import { useTreeItemCache } from './useTreeItemCache'
const wrappers: VueWrapper[] = []
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
})
function fixture(empty = false) {
  let cache!: ReturnType<typeof useTreeItemCache>
  const wrapper = mount(
    defineComponent({
      setup() {
        const container: Ref<HTMLElement | null> = shallowRef(null)
        cache = useTreeItemCache(container)
        return () => h('ul', { ref: container }, empty ? [] : [h('li', { role: 'treeitem' })])
      },
    }),
  )
  wrappers.push(wrapper)
  return { wrapper, cache }
}
it.each([false, true])('caches populated and empty queries (empty=%s)', (empty) => {
  const { wrapper, cache } = fixture(empty)
  const query = vi.spyOn(wrapper.element, 'querySelectorAll')
  expect(cache.getTreeItems()).toHaveLength(empty ? 0 : 1)
  expect(cache.getTreeItems()).toHaveLength(empty ? 0 : 1)
  expect(query).toHaveBeenCalledOnce()
})
it('invalidates structural and role changes while retaining the cache for expanded changes', async () => {
  const { wrapper, cache } = fixture()
  const first = cache.getTreeItems()
  wrapper.element.firstElementChild!.setAttribute('aria-expanded', 'true')
  await Promise.resolve()
  expect(cache.getTreeItems()).toBe(first)
  const added = document.createElement('li')
  wrapper.element.append(added)
  await Promise.resolve()
  expect(cache.getTreeItems()).not.toBe(first)
  added.setAttribute('role', 'treeitem')
  await Promise.resolve()
  expect(cache.getTreeItems()).toHaveLength(2)
  added.remove()
  await Promise.resolve()
  expect(cache.getTreeItems()).toHaveLength(1)
})
