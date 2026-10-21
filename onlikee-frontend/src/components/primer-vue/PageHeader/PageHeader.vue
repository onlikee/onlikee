<script setup lang="ts" generic="As extends keyof NativeElements | Component = 'div'">
import {
  Fragment,
  h,
  isVNode,
  onMounted,
  onUpdated,
  shallowRef,
  useAttrs,
  useCssModule,
  useSlots,
} from 'vue'
import type { Component, ComponentPublicInstance, NativeElements, VNode, VNodeChild } from 'vue'
import type { HeaderElement } from '../Header/types'
import type { NavigationProps, PageHeaderComponentProps, TitleAreaProps } from './types'
import TitleArea from './PageHeaderTitleArea.vue'
import Navigation from './PageHeaderNavigation.vue'
import ContextArea from './PageHeaderContextArea.vue'
import LeadingAction from './PageHeaderLeadingAction.vue'
import ParentLink from './PageHeaderParentLink.vue'
import ContextBar from './PageHeaderContextBar.vue'
import ContextAreaActions from './PageHeaderContextAreaActions.vue'
import Breadcrumbs from './PageHeaderBreadcrumbs.vue'
import LeadingVisual from './PageHeaderLeadingVisual.vue'
import Title from './PageHeaderTitle.vue'
import TrailingVisual from './PageHeaderTrailingVisual.vue'
import TrailingAction from './PageHeaderTrailingAction.vue'
import Actions from './PageHeaderActions.vue'
import Description from './PageHeaderDescription.vue'
import { getHiddenDataAttributes, getResponsiveAttributes } from './responsive'
import { isSlot } from '../composables/useSlots'

// Keep compound members on the SFC itself so Vue's hot reload preserves them.
defineOptions({
  name: 'PageHeader',
  inheritAttrs: false,
  ContextArea,
  ParentLink,
  ContextBar,
  TitleArea,
  ContextAreaActions,
  LeadingAction,
  Breadcrumbs,
  LeadingVisual,
  Title,
  TrailingVisual,
  TrailingAction,
  Actions,
  Description,
  Navigation,
})
const props = defineProps<PageHeaderComponentProps<As>>()
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
const slots = useSlots()
const styles = useCssModule()
const element = shallowRef<HeaderElement<As> | null>(null)
let directChildren: VNode[] = []

function flatten(nodes: VNodeChild, fragments = true): VNode[] {
  if (Array.isArray(nodes)) return nodes.flatMap((node) => flatten(node, fragments))
  if (!isVNode(nodes)) return []
  if (fragments && nodes.type === Fragment) return flatten(nodes.children as VNodeChild)
  return [nodes]
}
function setElement(node: Element | ComponentPublicInstance | null) {
  element.value = node as HeaderElement<As> | null
}
function validateInteractiveElementsInTitle() {
  if (!import.meta.env.DEV) return
  const root =
    element.value instanceof HTMLElement
      ? element.value
      : (element.value as ComponentPublicInstance | null)?.$el
  if (!(root instanceof HTMLElement)) return
  const title = Array.from(root.children).find(
    (child) => child.getAttribute('data-component') === 'TitleArea',
  )
  if (!title) return
  const isInteractive = (node: Node) =>
    node instanceof HTMLElement &&
    node.matches('a, button, [role="button"], [link][role="link"], [tabindex]')
  const interactive = Array.from(title.childNodes).some(
    (child) => isInteractive(child) || Array.from(child.childNodes).some(isInteractive),
  )
  if (
    interactive &&
    directChildren.some(
      (child) =>
        child.type === ContextArea ||
        isSlot(child, ContextArea) ||
        child.type === LeadingAction ||
        isSlot(child, LeadingAction),
    )
  ) {
    console.warn(
      'Warning:',
      'When PageHeader.ContextArea or PageHeader.LeadingAction is present, we recommended not to include any interactive items in the PageHeader.TitleArea to make sure the focus order is logical.',
    )
  }
}
onMounted(validateInteractiveElementsInTitle)
onUpdated(validateInteractiveElementsInTitle)

const Render = () => {
  const children = slots.default?.()
  directChildren = flatten(children as VNodeChild, false)
  let titleVariant: TitleAreaProps['variant']
  let navigationHidden: NavigationProps['hidden']
  let hasNavigation = false
  for (const child of flatten(children as VNodeChild)) {
    if (child.type === TitleArea)
      titleVariant = (child.props as TitleAreaProps | null)?.variant ?? 'medium'
    if (child.type === Navigation) {
      hasNavigation = true
      navigationHidden = (child.props as NavigationProps | null)?.hidden ?? false
    }
  }
  const { class: classValue, ...rest } = attrs
  const component = props.as ?? 'div'
  return h(
    component,
    {
      ...rest,
      class: [styles.PageHeader, props.className, classValue],
      'data-component': 'PageHeader',
      'data-has-border': props.hasBorder ? 'true' : undefined,
      'data-has-nav': hasNavigation ? '' : undefined,
      ...getResponsiveAttributes('title-size-variant', titleVariant),
      ...(navigationHidden === undefined
        ? {}
        : getHiddenDataAttributes(navigationHidden, 'nav-hidden')),
      ref: setElement,
    },
    typeof component === 'string' ? children : { default: () => children },
  )
}
defineExpose({ element })
</script>

<template><Render /></template>

<style module src="./PageHeader.module.css" />
