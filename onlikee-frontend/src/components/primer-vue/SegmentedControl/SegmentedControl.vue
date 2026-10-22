<script lang="ts">
/* eslint-disable vue/prop-name-casing -- Preserve the source ARIA prop names. */
import {
  cloneVNode,
  defineComponent,
  h,
  isVNode,
  onBeforeUnmount,
  onUpdated,
  shallowRef,
  type PropType,
  type Slots,
  type VNode,
  type VNodeChild,
} from 'vue'
import { ActionList } from '../ActionList'
import { ActionMenu } from '../ActionMenu'
import { isSlot, useSlots } from '../composables/useSlots'
import { getResponsiveAttributes } from '../Stack/responsive'
import { renderNode } from '../internal/renderNode'
import { normalizeReactStyle } from '../internal/style'
import type { NodeProp } from '../internal/renderNode'
import Button from './SegmentedControlButton.vue'
import IconButton from './SegmentedControlIconButton.vue'
import Divider from './SegmentedControlDivider.vue'
import Action from './SegmentedControlAction.vue'
import ActionProvider from './SegmentedControlActionProvider.vue'
import classes from './SegmentedControl.module.css'
import type { SegmentedControlProps } from './types'

function validChild(child: VNodeChild): child is VNode {
  return isVNode(child) && typeof child.type !== 'symbol'
}

// VNodes from templates retain kebab-case prop names until the child resolves them.
function childProp(child: VNode, name: string): unknown {
  return child.props?.[name] ?? child.props?.[name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)]
}

function flag(value: unknown): boolean {
  return value === '' || Boolean(value)
}

function childText(child: VNode | undefined): VNodeChild {
  if (!child) return null
  if (child.type === Button || isSlot(child, Button)) {
    if (typeof child.children === 'object' && !Array.isArray(child.children))
      return (child.children as Slots | null)?.default?.() ?? null
    return child.children as VNodeChild
  }
  return child.props?.['aria-label'] ?? null
}

function textLabel(value: VNodeChild): string {
  if (Array.isArray(value)) return value.map(textLabel).join('')
  if (isVNode(value)) return textLabel(value.children as VNodeChild)
  return value == null || typeof value === 'boolean' ? '' : String(value)
}

function childIcon(child: VNode | undefined): VNode | null {
  if (!child) return null
  if (child.type === Button || isSlot(child, Button))
    return renderNode(
      (childProp(child, 'leadingVisual') ?? childProp(child, 'leadingIcon')) as NodeProp,
    ) as VNode | null
  if (child.type === IconButton || isSlot(child, IconButton))
    return renderNode(child.props?.icon) as VNode | null
  return null
}

function clickChild(child: VNode, event: MouseEvent | KeyboardEvent) {
  const handler = child.props?.onClick
  if (Array.isArray(handler)) handler.forEach((fn) => fn(event))
  else handler?.(event)
}

export default defineComponent({
  name: 'SegmentedControl',
  inheritAttrs: false,
  props: {
    'aria-label': { type: String, default: undefined },
    'aria-labelledby': { type: String, default: undefined },
    'aria-describedby': { type: String, default: undefined },
    fullWidth: {
      type: [Boolean, Object] as PropType<SegmentedControlProps['fullWidth']>,
      default: undefined,
    },
    onChange: { type: Function as PropType<SegmentedControlProps['onChange']>, default: undefined },
    size: { type: String as PropType<SegmentedControlProps['size']>, default: undefined },
    variant: {
      type: [String, Object] as PropType<SegmentedControlProps['variant']>,
      default: 'default',
    },
    className: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    const normalizedProps = props as typeof props & {
      ariaLabel?: string
      ariaLabelledby?: string
      ariaDescribedby?: string
    }
    const container = shallowRef<HTMLUListElement | null>(null)
    const internalIndex = shallowRef<number>()
    let segmentCount = 0
    let previousSegmentCount: number | undefined
    let animationFrame: number | undefined
    onUpdated(() => {
      if (previousSegmentCount === segmentCount) return
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame)
      container.value?.setAttribute('data-disable-knob-transition', '')
      previousSegmentCount = segmentCount
      animationFrame = requestAnimationFrame(() => {
        container.value?.removeAttribute('data-disable-knob-transition')
        animationFrame = undefined
      })
    })
    onBeforeUnmount(() => {
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame)
    })

    return () => {
      const [matched, children] = useSlots(slots.default?.(), { action: Action })
      const segments = children.filter(
        (child): child is VNode => validChild(child) && !isSlot(child, Divider),
      )
      const indices = new Map(segments.map((child, index) => [child, index]))
      segmentCount = segments.length
      previousSegmentCount ??= segmentCount
      const uncontrolled =
        props.onChange === undefined ||
        segments.some((child) => childProp(child, 'defaultSelected') !== undefined)
      const selectedSegments = segments.map(
        (child) => flag(childProp(child, 'defaultSelected')) || flag(childProp(child, 'selected')),
      )
      const externalIndex = selectedSegments.includes(true) ? selectedSegments.indexOf(true) : 0
      internalIndex.value ??= externalIndex
      const selectedIndex = uncontrolled ? internalIndex.value : externalIndex
      const selectedChild = segments[selectedIndex]
      if (!normalizedProps.ariaLabel && !normalizedProps.ariaLabelledby)
        console.warn(
          'Use the `aria-label` or `aria-labelledby` prop to provide an accessible label for assistive technologies',
        )

      const variantAttrs = getResponsiveAttributes('variant', props.variant)
      const widthAttrs = getResponsiveAttributes('full-width', props.fullWidth)
      const dropdown =
        typeof props.variant === 'object' && Object.values(props.variant).includes('dropdown')
      const list = h(
        'ul',
        {
          'aria-label': normalizedProps.ariaLabel,
          'aria-labelledby': normalizedProps.ariaLabelledby,
          'aria-describedby': normalizedProps.ariaDescribedby,
          ref: container,
          class: [classes.SegmentedControl, props.className, attrs.class],
          ...widthAttrs,
          ...variantAttrs,
          'data-size': props.size,
          ...Object.fromEntries(Object.entries(attrs).filter(([key]) => key !== 'class')),
          style: normalizeReactStyle(attrs.style),
          'data-component': 'SegmentedControl',
        },
        children.map((child, index) => {
          if (!validChild(child)) return null
          if (isSlot(child, Divider))
            return cloneVNode(child, { key: child.key ?? `segmented-control-divider-${index}` })
          const segmentIndex = indices.get(child) ?? -1
          const clone = cloneVNode(child)
          // cloneVNode normally merges event listeners; source cloneElement replaces onClick.
          clone.props = {
            ...clone.props,
            key: child.key ?? `segmented-control-item-${index}`,
            selected: segmentIndex === selectedIndex,
            style: [
              {
                '--separator-color':
                  segmentIndex === selectedIndex || segmentIndex === selectedIndex - 1
                    ? 'transparent'
                    : 'var(--borderColor-default)',
              },
              child.props?.style,
            ],
            onClick: (event: MouseEvent) => {
              if (
                flag(childProp(child, 'disabled')) ||
                child.props?.['aria-disabled'] === true ||
                child.props?.['aria-disabled'] === 'true'
              )
                return
              if (props.onChange) {
                props.onChange(segmentIndex)
                if (uncontrolled) internalIndex.value = segmentIndex
                clickChild(child, event)
              } else {
                clickChild(child, event)
                if (uncontrolled) internalIndex.value = segmentIndex
              }
            },
          }
          return clone
        }),
      )
      if (!dropdown && !matched.action) return list

      return h('div', { class: classes.DropdownGroup, 'data-size': props.size, ...widthAttrs }, [
        dropdown
          ? h('div', { class: classes.DropdownContainer, ...variantAttrs }, [
              h(ActionMenu, null, {
                default: () => [
                  h(
                    ActionMenu.Button,
                    {
                      'aria-label': normalizedProps.ariaLabel
                        ? `${textLabel(childText(selectedChild))}, ${normalizedProps.ariaLabel}`
                        : undefined,
                      leadingVisual: childIcon(selectedChild),
                    },
                    { default: () => childText(selectedChild) },
                  ),
                  h(
                    ActionMenu.Overlay,
                    { 'aria-labelledby': normalizedProps.ariaLabelledby },
                    {
                      default: () =>
                        h(
                          ActionList,
                          { selectionVariant: 'single' },
                          {
                            default: () => [
                              ...children.map((child, index) => {
                                if (!validChild(child)) return null
                                if (isSlot(child, Divider))
                                  return h(ActionList.Divider, {
                                    key: child.key ?? `segmented-control-divider-${index}`,
                                    className: childProp(child, 'className') as string | undefined,
                                    class: child.props?.class,
                                    style: child.props?.style,
                                  })
                                const segmentIndex = indices.get(child) ?? -1
                                return h(
                                  ActionList.Item,
                                  {
                                    key: `segmented-control-action-btn-${index}`,
                                    selected: segmentIndex === selectedIndex,
                                    onSelect: (event: MouseEvent | KeyboardEvent) => {
                                      if (uncontrolled) internalIndex.value = segmentIndex
                                      props.onChange?.(segmentIndex)
                                      clickChild(child, event)
                                    },
                                  },
                                  { default: () => [childIcon(child), ' ', childText(child)] },
                                )
                              }),
                              matched.action
                                ? h(
                                    ActionProvider,
                                    { variant: 'menu' },
                                    { default: () => matched.action },
                                  )
                                : null,
                            ],
                          },
                        ),
                    },
                  ),
                ],
              }),
            ])
          : null,
        list,
        matched.action
          ? h('div', { class: classes.InlineAction, ...variantAttrs }, [
              h(ActionProvider, { variant: 'inline' }, { default: () => matched.action }),
            ])
          : null,
      ])
    }
  },
})
</script>
