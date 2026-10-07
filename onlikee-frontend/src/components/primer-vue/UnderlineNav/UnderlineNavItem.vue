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
    :class="[$style['underline-nav-item']]"
    :data-nav-id="id"
    :aria-hidden="overflowing ? 'true' : undefined"
  >
    <component
      :is="as"
      v-bind="$attrs"
      :class="[$style['underline-nav-link']]"
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
        :class="[$style['underline-nav-icon'], 'underline-nav-icon']"
        data-component="icon"
      >
        <component :is="leadingVisual" />
      </span>
      <span
        ref="label"
        :class="[$style['underline-nav-text']]"
        data-component="text"
        :data-content="labelText"
      >
        <slot />
      </span>
      <span
        v-if="counter !== undefined"
        :class="[$style['underline-nav-counter']]"
        data-component="counter"
      >
        <span
          v-if="context?.loadingCounters()"
          :class="[$style['underline-nav-loading']]"
        />
        <template v-else>
          <span
            :class="[$style['underline-nav-counter-value']]"
            aria-hidden="true"
          >{{ counter }}</span>
          <span :class="[$style['underline-nav-visually-hidden']]">&nbsp;({{ counter }})</span>
        </template>
      </span>
    </component>
  </li>
</template>

<style module src="./UnderlineNavItem.module.css"></style>
