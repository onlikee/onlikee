<script setup lang="ts">
import {
  Comment,
  Fragment,
  Text,
  cloneVNode,
  computed,
  getCurrentInstance,
  h,
  isVNode,
  shallowRef,
  toRaw,
  useAttrs,
  useId,
  useSlots,
  type Component,
  type ComponentPublicInstance,
  type VNode,
} from 'vue'
import Spinner from '../Spinner/Spinner.vue'
import CounterLabel from '../CounterLabel/CounterLabel.vue'
import VisuallyHidden from '../VisuallyHidden/VisuallyHidden.vue'
import AriaStatus from '../internal/components/AriaStatus.vue'
import type { ButtonBaseComponentProps, ButtonVisual } from './types'
import classes from './ButtonBase.module.css'

defineOptions({ name: 'ButtonBase', inheritAttrs: false })

const props = withDefaults(defineProps<ButtonBaseComponentProps>(), {
  as: 'button',
  variant: 'default',
  size: 'medium',
  alignContent: 'center',
  block: false,
  loading: undefined,
  loadingAnnouncement: 'Loading',
  inactive: undefined,
  labelWrap: undefined,
})
const attrs = useAttrs()
const slots = useSlots()
const instance = getCurrentInstance()!
const element = shallowRef<HTMLElement | null>(null)
let skipSemanticValidation = false
const generatedId = useId()
const uuid = computed(() => props.id || generatedId)

function attrsWithoutDisabled() {
  const { disabled: _disabled, children: _children, ...forwardedAttrs } = attrs
  return forwardedAttrs
}

function setElement(node: Element | ComponentPublicInstance | null) {
  const instance = node as { element?: unknown; $el?: unknown } | null
  const resolved = node instanceof HTMLElement ? node : (instance?.element ?? instance?.$el)
  const resolvedElement = resolved instanceof HTMLElement ? resolved : null
  if (element.value !== resolvedElement) skipSemanticValidation = true
  element.value = resolvedElement
}

function renderVisual(visual: ButtonVisual) {
  if (isVNode(visual)) return cloneVNode(visual)
  return visual ? h(toRaw(visual) as Component) : null
}

function moduleVisual(visual: ButtonVisual, loading: boolean, name: string, counterLabel = false) {
  return h(
    'span',
    {
      'data-component': name,
      class: [
        !counterLabel && classes.Visual,
        name === 'leadingVisual' && classes.LeadingVisual,
        loading ? classes.LoadingSpinner : classes.VisualWrap,
      ],
    },
    [loading ? h(Spinner, { size: 'small' }) : renderVisual(visual)],
  )
}

function hasContent(nodes: VNode[]): boolean {
  return nodes.some((node) => {
    if (node.type === Comment) return false
    if (node.type === Fragment) {
      return true
    }
    return node.type !== Text || node.children !== ''
  })
}

const Render = () => {
  const incomingProps = instance.vnode.props ?? {}
  const children = slots.default?.() ?? []
  const hasChildren = hasContent(children)
  const { leadingVisual, trailingVisual, trailingAction, icon, count, loading } = props
  const disabledWasPassed = Object.prototype.hasOwnProperty.call(incomingProps, 'disabled')
  const disabledProps =
    typeof props.as === 'string'
      ? props.disabled
        ? { disabled: true }
        : {}
      : disabledWasPassed
        ? { disabled: incomingProps.disabled }
        : {}
  const typeProps = Object.prototype.hasOwnProperty.call(incomingProps, 'type')
    ? { type: props.type }
    : {}
  const labelId = `${uuid.value}-label`
  const announcementId = `${uuid.value}-loading-announcement`
  const node = element.value
  const shouldValidate = !skipSemanticValidation
  skipSemanticValidation = false
  if (import.meta.env.DEV) {
    if (props.notificationIndicator === 'leadingVisual' && !leadingVisual)
      console.warn(
        'Button: `notificationIndicator="leadingVisual"` requires a `leadingVisual` prop.',
      )
    if (
      shouldValidate &&
      node &&
      !(node instanceof HTMLButtonElement) &&
      !(node instanceof HTMLAnchorElement) &&
      node.tagName !== 'SUMMARY'
    )
      console.warn('This component should be an instanceof a semantic button or anchor')
  }
  const describedBy =
    [loading ? announcementId : undefined, attrs['aria-describedby']].filter(Boolean).join(' ') ||
    undefined
  const content = icon
    ? [loading ? h(Spinner, { size: 'small' }) : renderVisual(icon)]
    : [
        h(
          'span',
          {
            'data-component': 'buttonContent',
            'data-align': props.alignContent,
            class: classes.ButtonContent,
          },
          [
            loading && !leadingVisual && !trailingVisual && !trailingAction && count === undefined
              ? moduleVisual(Spinner, true, 'loadingSpinner')
              : null,
            leadingVisual ? moduleVisual(leadingVisual, Boolean(loading), 'leadingVisual') : null,
            hasChildren
              ? h(
                  'span',
                  {
                    'data-component': 'text',
                    class: classes.Label,
                    id: loading ? labelId : undefined,
                  },
                  children,
                )
              : null,
            count !== undefined && !trailingVisual
              ? moduleVisual(
                  h(
                    CounterLabel,
                    {
                      class: classes.CounterLabel,
                      dataComponent: 'ButtonCounter',
                    },
                    { default: () => count },
                  ),
                  Boolean(loading) && !leadingVisual,
                  'trailingVisual',
                  true,
                )
              : trailingVisual
                ? moduleVisual(trailingVisual, Boolean(loading) && !leadingVisual, 'trailingVisual')
                : null,
          ],
        ),
        trailingAction
          ? moduleVisual(
              trailingAction,
              Boolean(loading) && !leadingVisual && !trailingVisual,
              'trailingAction',
            )
          : null,
      ]
  const button = h(
    props.as as Component,
    {
      'aria-disabled': loading ? true : undefined,
      'data-component': 'Button',
      ...attrsWithoutDisabled(),
      ref: setElement,
      class: [classes.ButtonBase, props.className, attrs.class],
      ...typeProps,
      ...disabledProps,
      'data-block': props.block ? 'block' : null,
      'data-inactive': props.inactive ? true : undefined,
      'data-loading': Boolean(loading),
      'data-no-visuals': !leadingVisual && !trailingVisual && !trailingAction ? true : undefined,
      'data-size': props.size,
      'data-variant': props.variant,
      'data-label-wrap': props.labelWrap,
      'data-notification-indicator': props.notificationIndicator,
      'data-has-count': count !== undefined ? true : undefined,
      'data-icon-only-counter':
        count !== undefined && leadingVisual && !hasChildren ? true : undefined,
      'aria-describedby': describedBy,
      'aria-labelledby': loading
        ? [labelId, attrs['aria-labelledby']].filter(Boolean).join(' ')
        : attrs['aria-labelledby'],
      id: props.id,
      onClick: loading ? undefined : attrs.onClick,
    },
    typeof props.as === 'string' ? content : { default: () => content },
  )
  const nodes = [
    button,
    loading
      ? h(VisuallyHidden, null, {
          default: () =>
            h(AriaStatus, { id: announcementId }, { default: () => props.loadingAnnouncement }),
        })
      : null,
  ]
  return props.loading !== undefined
    ? h(
        'div',
        {
          'data-loading-wrapper': true,
          class: props.block
            ? classes.ConditionalWrapper
            : props.variant === 'link'
              ? classes.ConditionalWrapperLink
              : undefined,
        },
        nodes,
      )
    : nodes
}

defineExpose({
  element,
  focus: (options?: FocusOptions) => element.value?.focus(options),
  blur: () => element.value?.blur(),
})
</script>

<template>
  <Render />
</template>
