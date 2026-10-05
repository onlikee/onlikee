<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, shallowRef, useTemplateRef, watch, type CSSProperties, type VNode } from 'vue'
import { underlineNavKey, type UnderlineNavBreakpoint, type UnderlineNavEntry } from './context'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  as?: string
  ariaLabel?: string
  loadingCounters?: boolean
  variant?: 'inset' | 'flush'
  hideIconsBreakpoint?: UnderlineNavBreakpoint | null
}>(), {
  as: 'nav',
  ariaLabel: undefined,
  loadingCounters: false,
  variant: 'inset',
  hideIconsBreakpoint: 'medium'
})

const RenderNodes = (props: { nodes: VNode[] }) => props.nodes
const wrapperRef = useTemplateRef<HTMLElement>('wrapper')
const listRef = useTemplateRef<HTMLUListElement>('list')
const moreRef = useTemplateRef<HTMLButtonElement>('more')
const menuRef = useTemplateRef<HTMLUListElement>('menu')
const menuStyle = shallowRef<CSSProperties>({})
const entries = shallowRef<UnderlineNavEntry[]>([])
const overflowIds = shallowRef<string[]>([])
const menuOpen = shallowRef(false)
const overflowEntries = computed(() => entries.value
  .filter(entry => overflowIds.value.includes(entry.id))
  .sort((left, right) => overflowIds.value.indexOf(left.id) - overflowIds.value.indexOf(right.id)))
const overflowingCurrentItem = computed(() => overflowEntries.value.some(entry => entry.current !== undefined && entry.current !== false && entry.current !== 'false'))
let resizeObserver: ResizeObserver | undefined
let measureFrame = 0

function measureOverflow() {
  const list = listRef.value
  if (!list) return

  const items = Array.from(list.querySelectorAll<HTMLLIElement>(':scope > .underline-nav-item'))
  const firstTop = items[0]?.offsetTop
  const next = firstTop === undefined ? [] : items.filter(item => item.offsetTop > firstTop).map(item => item.dataset.navId ?? '')

  if (next.length !== overflowIds.value.length || next.some((id, index) => id !== overflowIds.value[index])) {
    overflowIds.value = next
  }
}

function scheduleMeasure() {
  if (measureFrame) cancelAnimationFrame(measureFrame)
  measureFrame = requestAnimationFrame(() => {
    measureFrame = 0
    measureOverflow()
  })
}

function register(entry: UnderlineNavEntry) {
  const index = entries.value.findIndex(item => item.id === entry.id)
  entries.value = index < 0
    ? [...entries.value, entry]
    : entries.value.map(item => item.id === entry.id ? entry : item)
  if (entry.element) resizeObserver?.observe(entry.element)
  nextTick(scheduleMeasure)
}

function unregister(id: string) {
  const element = entries.value.find(entry => entry.id === id)?.element
  if (element) resizeObserver?.unobserve(element)
  entries.value = entries.value.filter(entry => entry.id !== id)
  nextTick(scheduleMeasure)
}

provide(underlineNavKey, {
  loadingCounters: () => props.loadingCounters,
  isOverflowing: id => overflowIds.value.includes(id),
  register,
  unregister
})

function closeMenu() {
  menuOpen.value = false
}

function handleDocumentClick(event: MouseEvent) {
  if (!wrapperRef.value?.contains(event.target as Node) && !menuRef.value?.contains(event.target as Node)) closeMenu()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !menuOpen.value) return
  closeMenu()
  moreRef.value?.focus()
}

function positionMenu() {
  const anchor = moreRef.value?.getBoundingClientRect()
  if (!anchor) return
  const menuWidth = menuRef.value?.offsetWidth ?? 192
  const menuHeight = menuRef.value?.offsetHeight ?? 0
  const top = anchor.bottom + 4 + menuHeight > window.innerHeight && anchor.top - menuHeight - 4 >= 8
    ? anchor.top - menuHeight - 4
    : anchor.bottom + 4
  menuStyle.value = {
    top: `${top}px`,
    left: `${Math.max(8, Math.min(anchor.right - menuWidth, window.innerWidth - menuWidth - 8))}px`
  }
}

function handleMenuKeydown(event: KeyboardEvent) {
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
  const links = Array.from(menuRef.value?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
  if (!links.length) return
  event.preventDefault()
  const index = links.indexOf(document.activeElement as HTMLAnchorElement)
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1
    : (index + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length
  links[next]?.focus()
}

function selectOverflowItem(entry: UnderlineNavEntry, event: MouseEvent) {
  entry.select(event)
  closeMenu()
  moreRef.value?.focus()
}

watch(overflowEntries, items => {
  if (!items.length) closeMenu()
})

watch(menuOpen, async open => {
  if (!open) {
    window.removeEventListener('resize', positionMenu)
    window.removeEventListener('scroll', positionMenu, true)
    return
  }
  await nextTick()
  positionMenu()
  window.addEventListener('resize', positionMenu)
  window.addEventListener('scroll', positionMenu, true)
  menuRef.value?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
})

onMounted(() => {
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(scheduleMeasure)
    if (wrapperRef.value) resizeObserver.observe(wrapperRef.value)
    if (listRef.value) resizeObserver.observe(listRef.value)
    for (const entry of entries.value) {
      if (entry.element) resizeObserver.observe(entry.element)
    }
  }
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleKeydown)
  scheduleMeasure()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  if (measureFrame) cancelAnimationFrame(measureFrame)
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', positionMenu)
  window.removeEventListener('scroll', positionMenu, true)
})
</script>

<template>
  <h2
    v-if="ariaLabel"
    class="underline-nav-visually-hidden"
  >
    {{ ariaLabel }} navigation
  </h2>
  <component
    :is="as"
    v-bind="$attrs"
    ref="wrapper"
    class="underline-nav"
    :aria-label="ariaLabel"
    :data-variant="variant"
    :data-hide-icons-breakpoint="hideIconsBreakpoint"
    :data-has-overflow="overflowEntries.length ? 'true' : undefined"
    @keydown="handleKeydown"
  >
    <ul
      ref="list"
      class="underline-nav-list"
      role="list"
    >
      <li
        class="underline-nav-spacer"
        role="presentation"
        aria-hidden="true"
      />
      <slot />
    </ul>
    <div
      v-if="overflowEntries.length"
      class="underline-nav-more-container"
    >
      <span
        class="underline-nav-divider"
        aria-hidden="true"
      />
      <button
        ref="more"
        type="button"
        class="underline-nav-more"
        :data-current="overflowingCurrentItem || undefined"
        :aria-label="overflowingCurrentItem ? 'More items, including current item' : 'More items'"
        :aria-expanded="menuOpen"
        aria-haspopup="menu"
        @click="menuOpen = !menuOpen"
      >
        More
      </button>
      <Teleport to="body">
        <ul
          v-if="menuOpen"
          ref="menu"
          class="underline-nav-menu"
          role="menu"
          :style="menuStyle"
          @keydown="handleMenuKeydown"
        >
          <li
            v-for="entry in overflowEntries"
            :key="entry.id"
            role="none"
          >
            <component
              :is="entry.as"
              v-bind="entry.attrs"
              class="underline-nav-menu-item"
              role="menuitem"
              :type="entry.as === 'button' ? 'button' : undefined"
              :href="entry.as === 'a' ? entry.href ?? '#' : entry.href"
              :target="entry.target"
              :rel="entry.rel"
              :aria-current="entry.current"
              @click="selectOverflowItem(entry, $event)"
            >
              <span><RenderNodes :nodes="entry.label()" /></span>
              <span
                v-if="entry.counter !== undefined"
                class="underline-nav-menu-counter"
              >
                <span
                  v-if="loadingCounters"
                  class="underline-nav-loading"
                />
                <template v-else>
                  <span aria-hidden="true">{{ entry.counter }}</span>
                  <span class="underline-nav-visually-hidden">&nbsp;({{ entry.counter }})</span>
                </template>
              </span>
            </component>
          </li>
        </ul>
      </Teleport>
    </div>
  </component>
</template>

<style scoped>
.underline-nav { position: relative; display: flex; box-sizing: border-box; align-items: flex-start; width: 100%; min-height: 48px; max-height: 48px; overflow: hidden; padding: 8px 16px 0; box-shadow: inset 0 -1px var(--borderColor-muted, #d1d9e0b3); container-type: inline-size; }
.underline-nav[data-variant='flush'] { padding-inline: 0; }
.underline-nav-list { position: relative; display: flex; flex: 1 1 auto; flex-wrap: wrap; align-items: center; gap: 8px; min-width: 0; margin: 0; padding: 0; list-style: none; white-space: nowrap; }
.underline-nav-spacer { margin-inline-end: -8px; }
.underline-nav-more-container { display: flex; flex: 0 0 auto; align-items: center; height: 40px; }
.underline-nav-divider { width: 0; height: 24px; margin-inline: 16px; border-inline-start: 1px solid var(--borderColor-muted, #d1d9e0b3); }
.underline-nav-more { position: relative; box-sizing: border-box; height: 32px; margin: 0; padding: 6px 8px; border: 0; border-radius: var(--borderRadius-medium, 6px); background: transparent; color: var(--fgColor-default, #1f2328); font: inherit; font-size: 14px; cursor: pointer; }
.underline-nav-more:hover { background: var(--bgColor-neutral-muted, #818b981f); }
.underline-nav-more:focus-visible { outline: 2px solid var(--fgColor-accent, #0969da); outline-offset: -2px; }
.underline-nav-more[data-current] { font-weight: 600; }
.underline-nav-more[data-current]::after { position: absolute; inset: auto 0 0; height: 2px; margin-bottom: -8px; content: ''; background: var(--underlineNav-borderColor-active, #fd8c73); }
.underline-nav-menu { position: fixed; z-index: 9999; min-width: 192px; max-height: min(320px, 80vh); margin: 0; padding: 8px; overflow: auto; border-radius: 12px; background: var(--overlay-bgColor, #fff); box-shadow: var(--shadow-floating-small, 0 0 0 1px #d1d9e080, 0 6px 12px -3px #25292e0a, 0 6px 18px 0 #25292e1f); list-style: none; }
.underline-nav-menu-item { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 6px 8px; border-radius: 6px; color: var(--fgColor-default, #1f2328); font-size: 14px; text-decoration: none; }
.underline-nav-menu-item:hover, .underline-nav-menu-item:focus-visible { background: var(--bgColor-neutral-muted, #818b981f); }
.underline-nav-menu-item[aria-current]:not([aria-current='false']) { border-inline-start: 2px solid var(--underlineNav-borderColor-active, #fd8c73); font-weight: 600; }
.underline-nav-menu-counter { padding: 0 6px; border-radius: 20px; background: var(--bgColor-neutral-muted, #818b981f); color: var(--fgColor-muted, #59636e); font-size: 12px; }
.underline-nav-loading { display: inline-block; width: 24px; height: 16px; border-radius: 20px; background: var(--bgColor-neutral-muted, #818b981f); animation: underline-nav-loading 1.2s ease-in-out infinite alternate; }
@keyframes underline-nav-loading { to { opacity: .2; } }
.underline-nav-visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@container (width < 20rem) { .underline-nav[data-hide-icons-breakpoint='xsmall'] :deep(.underline-nav-icon) { display: none; } }
@container (width < 34rem) { .underline-nav[data-hide-icons-breakpoint='small'] :deep(.underline-nav-icon) { display: none; } }
@container (width < 48rem) { .underline-nav[data-hide-icons-breakpoint='medium'] :deep(.underline-nav-icon) { display: none; } }
@container (width < 63.25rem) { .underline-nav[data-hide-icons-breakpoint='large'] :deep(.underline-nav-icon) { display: none; } }
@container (width < 80rem) { .underline-nav[data-hide-icons-breakpoint='xlarge'] :deep(.underline-nav-icon) { display: none; } }
@container (width < 87.5rem) { .underline-nav[data-hide-icons-breakpoint='xxlarge'] :deep(.underline-nav-icon) { display: none; } }
</style>
