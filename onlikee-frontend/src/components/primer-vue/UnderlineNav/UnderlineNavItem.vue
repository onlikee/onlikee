<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, useAttrs, useId, useSlots, useTemplateRef, watch, type Component } from 'vue'
import { underlineNavKey, type UnderlineNavCurrent } from './context'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  as?: string | Component
  href?: string
  target?: string
  rel?: string
  ariaCurrent?: UnderlineNavCurrent
  counter?: number | string
  leadingVisual?: Component
}>(), {
  as: 'a',
  href: undefined,
  target: undefined,
  rel: undefined,
  ariaCurrent: undefined,
  counter: undefined,
  leadingVisual: undefined
})

const emit = defineEmits<{ select: [event: MouseEvent | KeyboardEvent] }>()
const context = inject(underlineNavKey)
const slots = useSlots()
const attrs = useAttrs()
const id = useId()
const itemRef = useTemplateRef<HTMLLIElement>('item')
const labelRef = useTemplateRef<HTMLSpanElement>('label')
const overflowing = computed(() => context?.isOverflowing(id) ?? false)
const linkHref = computed(() => props.as === 'a' ? (props.href ?? '#') : props.href)
const labelText = computed(() => labelRef.value?.textContent?.trim() || undefined)

function select(event: MouseEvent | KeyboardEvent) {
  if (!event.defaultPrevented) emit('select', event)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === ' ' || event.key === 'Enter') select(event)
}

function register() {
  context?.register({
    id,
    element: itemRef.value,
    as: props.as,
    attrs: { ...attrs },
    href: linkHref.value,
    target: props.target,
    rel: props.rel,
    current: props.ariaCurrent,
    counter: props.counter,
    label: () => slots.default?.() ?? [],
    select
  })
}

watch(() => [props.as, props.href, props.target, props.rel, props.ariaCurrent, props.counter], register, { flush: 'post' })
onMounted(register)

onBeforeUnmount(() => context?.unregister(id))
</script>

<template>
  <li
    ref="item"
    class="underline-nav-item"
    :data-nav-id="id"
    :aria-hidden="overflowing ? 'true' : undefined"
  >
    <component
      :is="as"
      v-bind="$attrs"
      class="underline-nav-link"
      :type="as === 'button' ? 'button' : undefined"
      :href="linkHref"
      :target="target"
      :rel="rel"
      :aria-current="ariaCurrent"
      :tabindex="overflowing ? -1 : undefined"
      @click="select"
      @keydown="handleKeydown"
    >
      <span
        v-if="leadingVisual"
        class="underline-nav-icon"
        data-component="icon"
      >
        <component :is="leadingVisual" />
      </span>
      <span
        ref="label"
        class="underline-nav-text"
        data-component="text"
        :data-content="labelText"
      >
        <slot />
      </span>
      <span
        v-if="counter !== undefined"
        class="underline-nav-counter"
        data-component="counter"
      >
        <span
          v-if="context?.loadingCounters()"
          class="underline-nav-loading"
        />
        <template v-else>
          <span
            class="underline-nav-counter-value"
            aria-hidden="true"
          >{{ counter }}</span>
          <span class="underline-nav-visually-hidden">&nbsp;({{ counter }})</span>
        </template>
      </span>
    </component>
  </li>
</template>

<style scoped>
.underline-nav-item { display: flex; flex-direction: column; align-items: center; overflow: hidden; }
.underline-nav-item[aria-hidden] { visibility: hidden; }
.underline-nav-link { position: relative; display: inline-flex; box-sizing: border-box; align-items: center; max-width: 100%; height: 32px; margin-bottom: 8px; padding: 6px 8px; border: 0; border-radius: var(--borderRadius-medium, 6px); background: transparent; color: var(--fgColor-default, #1f2328); font: inherit; font-size: 14px; line-height: 20px; text-align: center; text-decoration: none; cursor: pointer; }
.underline-nav-link:hover { background: var(--bgColor-neutral-muted, #818b981a); text-decoration: none; }
.underline-nav-link:focus-visible { outline: 2px solid transparent; box-shadow: inset 0 0 0 2px var(--fgColor-accent, #0969da); }
.underline-nav-link::after { position: absolute; inset: auto 0 0; height: 2px; margin-bottom: -8px; content: ''; background: transparent; pointer-events: none; }
.underline-nav-link[aria-current]:not([aria-current='false'])::after { background: var(--underlineNav-borderColor-active, #fd8c73); }
.underline-nav-link[aria-current]:not([aria-current='false']) .underline-nav-text { font-weight: 600; }
.underline-nav-icon { display: inline-flex; align-items: center; margin-inline-end: 8px; color: var(--fgColor-muted, #59636e); }
.underline-nav-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.underline-nav-text[data-content]::before { display: block; height: 0; font-weight: 600; white-space: nowrap; visibility: hidden; content: attr(data-content); }
.underline-nav-counter { display: flex; align-items: center; margin-inline-start: 8px; }
.underline-nav-counter-value { padding: 0 6px; border-radius: 20px; background: var(--bgColor-neutral-muted, #818b981a); color: var(--fgColor-muted, #59636e); font-size: 12px; font-weight: 500; line-height: 18px; }
.underline-nav-visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
.underline-nav-loading { display: inline-block; width: 24px; height: 16px; border-radius: 20px; background: var(--bgColor-neutral-muted, #818b981a); animation: underline-nav-loading 1.2s ease-in-out infinite alternate; }
@keyframes underline-nav-loading { to { opacity: .2; } }
@media (forced-colors: active) { .underline-nav-link[aria-current]:not([aria-current='false'])::after { background: LinkText; } }
</style>
