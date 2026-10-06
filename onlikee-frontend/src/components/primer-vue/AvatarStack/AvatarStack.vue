<script setup lang="ts">
import { cloneVNode, Comment, Fragment, h, mergeProps, onBeforeUnmount, onMounted, shallowRef, Text, useAttrs, useSlots, type VNode } from 'vue'
import type { AvatarResponsiveSize } from '../Avatar'
import type { AvatarStackProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<AvatarStackProps>(), {
  variant: 'cascade',
  shape: 'circle',
  alignRight: false,
  disableExpand: false
})
const attrs = useAttrs()
const slots = useSlots()
const body = shallowRef<HTMLElement>()
const hasInteractiveChildren = shallowRef(false)
let observer: MutationObserver | undefined

function flatten(nodes: VNode[]): VNode[] {
  return nodes.flatMap(node => {
    if (node.type === Fragment && Array.isArray(node.children)) return flatten(node.children as VNode[])
    if (node.type === Comment || node.type === Text) return []
    return [node]
  })
}

function updateInteractiveChildren() {
  const candidates = body.value?.querySelectorAll<HTMLElement>(
    'a[href], button, summary, select, input:not([type="hidden"]), textarea, [tabindex="0"], audio[controls], video[controls], [contenteditable]'
  )
  hasInteractiveChildren.value = Array.from(candidates ?? []).some(node => {
    if (node.matches('[disabled], [hidden], [inert], [tabindex="-1"]')) return false
    const style = getComputedStyle(node)
    return style.display !== 'none' && style.visibility !== 'hidden'
  })
}

onMounted(() => {
  updateInteractiveChildren()
  observer = new MutationObserver(updateInteractiveChildren)
  if (body.value) observer.observe(body.value, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['disabled', 'hidden', 'inert', 'tabindex', 'href', 'contenteditable', 'controls', 'type']
  })
})

onBeforeUnmount(() => observer?.disconnect())

function stackStyle(children: VNode[]): Record<string, string> {
  if (typeof props.size === 'number' && props.size) return { '--avatar-stack-size': `${props.size}px` }
  const style: Record<string, string> = {}
  for (const key of ['narrow', 'regular', 'wide'] as const) {
    const childSizes = children.map(child => {
      const size = child.props?.size as number | AvatarResponsiveSize | undefined
      return (typeof size === 'object' ? size[key] : size) || 20
    })
    const size = typeof props.size === 'object'
      ? props.size[key] || 20
      : childSizes.length ? Math.min(...childSizes) : 20
    style[`--stackSize-${key}`] = `${size}px`
  }
  return style
}

// Read the slot during render so v-for/v-if changes update counts and inferred sizes.
const RenderStack = () => {
  const children = flatten(slots.default?.() ?? [])
  return h('span', mergeProps({
    class: 'avatar-stack',
    'data-component': 'AvatarStack',
    'data-variant': props.variant,
    'data-shape': props.shape,
    'data-avatar-count': children.length > 3 ? '3+' : children.length,
    'data-align-right': props.alignRight ? '' : undefined,
    'data-responsive': !props.size || typeof props.size === 'object' ? '' : undefined,
    style: stackStyle(children)
  }, attrs), [
    h('div', {
      ref: body,
      class: 'avatar-stack-body',
      'data-component': 'AvatarStack.Body',
      'data-disable-expand': props.disableExpand ? '' : undefined,
      tabindex: !hasInteractiveChildren.value && !props.disableExpand ? 0 : undefined
    }, children.map(child => cloneVNode(child, {
      class: 'avatar-stack-item',
      ...(props.shape === 'square' && typeof child.type !== 'string' ? { square: true } : {})
    })))
  ])
}
</script>

<template>
  <RenderStack />
</template>

<style scoped>
.avatar-stack {
  --avatar-border-width: 1px;
  --mask-size: calc(100% + var(--avatar-border-width, 1px) * 2);
  --mask-start: -1;
  --opacity-step: 15%;
  --overlap-size: calc(var(--avatar-stack-size, 20px) * 0.55);
  --overlap-size-avatar-three-plus: calc(var(--avatar-stack-size, 20px) * 0.85);

  position: relative;
  display: flex;
  min-width: var(--avatar-stack-size, 20px);
  height: var(--avatar-stack-size, 20px);
  isolation: isolate;
}

.avatar-stack[data-variant='stack'] {
  --overlap-size-avatar-three-plus: calc(var(--avatar-stack-size, 20px) * 0.55);
}

.avatar-stack[data-align-right] {
  --mask-start: 1;

  direction: rtl;
}

.avatar-stack[data-avatar-count='2'] {
  min-width: calc(var(--avatar-stack-size, 20px) + var(--avatar-stack-size, 20px) - var(--overlap-size, calc(var(--avatar-stack-size, 20px) * 0.55)));
}

.avatar-stack[data-avatar-count='3'][data-variant='cascade'] {
  min-width: calc(var(--avatar-stack-size, 20px) * 3 - var(--overlap-size, calc(var(--avatar-stack-size, 20px) * 0.55)) - var(--overlap-size-avatar-three-plus, calc(var(--avatar-stack-size, 20px) * 0.85)));
}

.avatar-stack[data-avatar-count='3'][data-variant='stack'] {
  min-width: calc(var(--avatar-stack-size, 20px) + (var(--avatar-stack-size, 20px) - var(--overlap-size-avatar-three-plus, calc(var(--avatar-stack-size, 20px) * 0.85))) * 2);
}

.avatar-stack[data-avatar-count='3+'][data-variant='cascade'] {
  min-width: calc(var(--avatar-stack-size, 20px) * 4 - var(--overlap-size, calc(var(--avatar-stack-size, 20px) * 0.55)) - var(--overlap-size-avatar-three-plus, calc(var(--avatar-stack-size, 20px) * 0.85)) * 2);
}

.avatar-stack[data-avatar-count='3+'][data-variant='stack'] {
  min-width: calc(var(--avatar-stack-size, 20px) + (var(--avatar-stack-size, 20px) - var(--overlap-size-avatar-three-plus, calc(var(--avatar-stack-size, 20px) * 0.85))) * 3);
}

.avatar-stack :deep(.avatar-stack-body) {
  position: absolute;
  display: flex;
}

.avatar-stack :deep(.avatar-stack-body[data-disable-expand]) {
  position: relative;
}

.avatar-stack :deep(.avatar-stack-item) {
  --avatarSize-regular: var(--avatar-stack-size, 20px);

  position: relative;
  display: flex;
  width: var(--avatar-stack-size, 20px);
  height: var(--avatar-stack-size, 20px);
  overflow: hidden;
  flex-shrink: 0;
  transition: margin 0.2s ease-in-out, opacity 0.2s ease-in-out, mask-position 0.2s ease-in-out, mask-size 0.2s ease-in-out;
}

.avatar-stack :deep(.avatar-stack-item:not([data-component='Avatar']):not(:has([data-square]))) {
  border-radius: 50%;
}

.avatar-stack[data-shape='circle'] :deep(img.avatar-stack-item) {
  box-shadow: 0 0 0 var(--avatar-border-width, 1px) transparent;
}

.avatar-stack[data-shape='square'] :deep(img.avatar-stack-item) {
  box-shadow: 1px 0 white;
}

.avatar-stack[data-shape='square'][data-align-right] :deep(img.avatar-stack-item) {
  box-shadow: -1px 0 white;
}

.avatar-stack[data-avatar-count='1'][data-shape='circle'] :deep(.avatar-stack-item[data-component='Avatar']) {
  box-shadow: 0 0 0 var(--avatar-border-width, 1px) var(--avatar-borderColor, #1f232826);
}

.avatar-stack[data-avatar-count='1'][data-shape='square'] :deep(.avatar-stack-item) {
  box-shadow: 1px 0 black;
}

.avatar-stack[data-avatar-count='1'][data-shape='square'][data-align-right] :deep(.avatar-stack-item) {
  box-shadow: -1px 0 black;
}

.avatar-stack :deep(.avatar-stack-item:first-child) {
  margin-inline-start: 0;
}

.avatar-stack :deep(.avatar-stack-item:nth-child(n + 2)) {
  margin-inline-start: calc(var(--overlap-size, calc(var(--avatar-stack-size, 20px) * 0.55)) * -1);
  mask-repeat: no-repeat, no-repeat;
  mask-size: var(--mask-size, calc(100% + var(--avatar-border-width, 1px) * 2)) var(--mask-size, calc(100% + var(--avatar-border-width, 1px) * 2)), auto;
  mask-composite: exclude;
  mask-position: calc((var(--avatar-stack-size, 20px) - var(--overlap-size, calc(var(--avatar-stack-size, 20px) * 0.55))) * var(--mask-start, -1) - var(--avatar-border-width, 1px)) center, 0 0;
  padding: 0.1px;
}

.avatar-stack[data-shape='circle'] :deep(.avatar-stack-item:nth-child(n + 2)) {
  mask-image: radial-gradient(at 50% 50%, black 70%, transparent 71%), linear-gradient(black 0 0);
}

.avatar-stack[data-shape='square'] :deep(.avatar-stack-item:nth-child(n + 2)) {
  mask-image: linear-gradient(black 0 0), linear-gradient(black 0 0);
}

.avatar-stack[data-variant='cascade'] :deep(.avatar-stack-item:nth-child(n + 3)) {
  --overlap-size: var(--overlap-size-avatar-three-plus, calc(var(--avatar-stack-size, 20px) * 0.85));

  opacity: calc(100% - 2 * var(--opacity-step, 15%));
}

.avatar-stack[data-variant='cascade'] :deep(.avatar-stack-item:nth-child(n + 4)) {
  opacity: calc(100% - 3 * var(--opacity-step, 15%));
}

.avatar-stack[data-variant='cascade'] :deep(.avatar-stack-item:nth-child(n + 5)) {
  opacity: calc(100% - 4 * var(--opacity-step, 15%));
}

.avatar-stack :deep(.avatar-stack-item:nth-child(1)) { z-index: 5; }
.avatar-stack :deep(.avatar-stack-item:nth-child(2)) { z-index: 4; }
.avatar-stack :deep(.avatar-stack-item:nth-child(3)) { z-index: 3; }
.avatar-stack :deep(.avatar-stack-item:nth-child(4)) { z-index: 2; }
.avatar-stack :deep(.avatar-stack-item:nth-child(5)) { z-index: 1; }

.avatar-stack :deep(.avatar-stack-item:nth-child(n + 6)) {
  position: absolute;
  visibility: hidden;
  opacity: 0;
}

.avatar-stack :deep(.avatar-stack-body:not([data-disable-expand]):is(:hover, :focus-within)) {
  width: auto;
}

.avatar-stack :deep(.avatar-stack-body:not([data-disable-expand]):is(:hover, :focus-within) .avatar-stack-item) {
  --mask-size: 100%;

  position: relative;
  margin-inline-start: var(--base-size-4, 4px);
  visibility: visible;
  opacity: 1;
  mask-position: calc(var(--avatar-stack-size, 20px) * var(--mask-start, -1)) center, 0 0;
}

.avatar-stack :deep(.avatar-stack-body:not([data-disable-expand]):is(:hover, :focus-within) .avatar-stack-item:first-child) {
  margin-inline-start: 0;
}

/* Keep placeholder text and linked avatars at the effective stack size. */
.avatar-stack :deep(.avatar-placeholder) {
  font-size: calc(var(--avatar-stack-size, 20px) * 0.35);
}

.avatar-stack :deep(.avatar-stack-item [data-component='Avatar']) {
  width: var(--avatar-stack-size, 20px);
  height: var(--avatar-stack-size, 20px);
}

.avatar-stack[data-shape='square'] :deep(.avatar-stack-item) {
  border-radius: clamp(4px, calc(var(--avatar-stack-size, 20px) - 24px), var(--borderRadius-medium, 6px));
}

@media (width < 768px) {
  .avatar-stack[data-responsive] { --avatar-stack-size: var(--stackSize-narrow, 20px); }
}

@media (min-width: 768px) {
  .avatar-stack[data-responsive] { --avatar-stack-size: var(--stackSize-regular, 20px); }
}

@media (min-width: 1400px) {
  .avatar-stack[data-responsive] { --avatar-stack-size: var(--stackSize-wide, 20px); }
}
</style>
