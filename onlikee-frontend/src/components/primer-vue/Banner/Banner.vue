<script setup lang="ts">
import {
  Comment,
  Fragment,
  h,
  provide,
  shallowRef,
  useAttrs,
  useCssModule,
  useId,
  useSlots,
  watchPostEffect,
  type VNode,
} from 'vue'
import { AlertIcon, CheckCircleIcon, InfoIcon, StopIcon, XIcon } from '@onlikee/octicons-vue'
import { IconButton } from '../Button'
import { VisuallyHidden } from '../VisuallyHidden'
import { renderNode } from '../internal/renderNode'
import { normalizeReactStyle } from '../internal/style'
import BannerTitle from './BannerTitle.vue'
import BannerDescription from './BannerDescription.vue'
import { bannerContextKey } from './context'
import type { BannerComponentProps } from './types'

defineOptions({ name: 'Banner', inheritAttrs: false })
const props = withDefaults(defineProps<BannerComponentProps>(), {
  variant: 'info',
  actionsLayout: 'default',
  flush: false,
  icon: undefined,
  leadingVisual: undefined,
})
defineSlots<{
  default?: () => unknown
  title?: () => unknown
  description?: () => unknown
  icon?: () => unknown
  leadingVisual?: () => unknown
  primaryAction?: () => unknown
  secondaryAction?: () => unknown
}>()
const attrs = useAttrs()
const slots = useSlots()
const classes = useCssModule()
const element = shallowRef<HTMLElement | null>(null)
const titleId = useId()
provide(bannerContextKey, { titleId })
const iconForVariant = {
  critical: StopIcon,
  info: InfoIcon,
  success: CheckCircleIcon,
  upsell: InfoIcon,
  warning: AlertIcon,
}

if (import.meta.env.DEV) {
  watchPostEffect(() => {
    if (props.title || !element.value) return
    if (!element.value.querySelector('[data-banner-title]')) {
      throw new Error(
        'Expected a title to be provided to the <Banner> component with the `title` prop or through `<Banner.Title>` but no title was found',
      )
    }
  })
}

function hasSlotContent(nodes: VNode[]): boolean {
  return nodes.some((node) =>
    node.type === Fragment ? hasSlotContent(node.children as VNode[]) : node.type !== Comment,
  )
}

function slotContent(name: keyof typeof slots) {
  const nodes = slots[name]?.()
  return nodes && hasSlotContent(nodes) ? nodes : undefined
}

const Render = () => {
  const title = slots.title ? slotContent('title') : props.title
  const description = slots.description ? slotContent('description') : props.description
  const primaryAction = slots.primaryAction ? slotContent('primaryAction') : props.primaryAction
  const secondaryAction = slots.secondaryAction
    ? slotContent('secondaryAction')
    : props.secondaryAction
  const hasActions = primaryAction || secondaryAction
  const leadingVisual = slots.leadingVisual ? slotContent('leadingVisual') : props.leadingVisual
  const visual = leadingVisual ?? (slots.icon ? slotContent('icon') : props.icon)
  const supportsCustomIcon = props.variant === 'info' || props.variant === 'upsell'
  const { class: classValue, 'aria-label': label, 'aria-labelledby': labelledBy, ...rest } = attrs

  return h(
    'section',
    {
      'data-component': 'Banner',
      ...rest,
      layout: props.layout,
      'aria-labelledby': labelledBy ?? (label ? undefined : titleId),
      'aria-label': labelledBy ? undefined : label,
      class: [props.className, classValue, classes.Banner],
      style: normalizeReactStyle(attrs.style),
      'data-dismissible': props.onDismiss ? '' : undefined,
      'data-has-actions': hasActions ? '' : undefined,
      'data-title-hidden': props.hideTitle ? '' : undefined,
      'data-variant': props.variant,
      'data-actions-layout': props.actionsLayout,
      tabindex: -1,
      ref: element,
      'data-layout': props.layout || 'default',
      'data-flush': props.flush ? '' : undefined,
    },
    [
      h('div', { 'data-component': 'Banner.Icon', class: classes.BannerIcon }, [
        visual && supportsCustomIcon ? renderNode(visual) : h(iconForVariant[props.variant]),
      ]),
      h('div', { class: classes.BannerContainer }, [
        h('div', { 'data-component': 'Banner.Content', class: classes.BannerContent }, [
          title
            ? props.hideTitle
              ? h(VisuallyHidden, null, {
                  default: () => h(BannerTitle, null, { default: () => title }),
                })
              : h(BannerTitle, null, { default: () => title })
            : null,
          description ? h(BannerDescription, null, { default: () => description }) : null,
          slots.default?.(),
        ]),
        hasActions
          ? h('div', { class: classes.BannerActions, 'data-component': 'Banner.Actions' }, [
              h(
                'div',
                { class: classes.BannerActionsContainer, 'data-primary-action': 'trailing' },
                [secondaryAction ?? null, primaryAction ?? null],
              ),
              h(
                'div',
                { class: classes.BannerActionsContainer, 'data-primary-action': 'leading' },
                [primaryAction ?? null, secondaryAction ?? null],
              ),
            ])
          : null,
      ]),
      props.onDismiss
        ? h(IconButton, {
            'aria-label': 'Dismiss banner',
            onClick: props.onDismiss,
            className: classes.BannerDismiss,
            icon: XIcon,
            variant: 'invisible',
          })
        : null,
    ],
  )
}

defineExpose({ element })
</script>

<template>
  <Render />
</template>

<style module src="./Banner.module.css" />
