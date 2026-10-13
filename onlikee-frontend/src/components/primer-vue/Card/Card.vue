<script lang="ts">
import {
  Comment,
  Fragment,
  computed,
  defineComponent,
  h,
  provide,
  shallowRef,
  useId,
  type PropType,
  type VNode,
} from 'vue'
import CardIcon from './CardIcon.vue'
import CardImage from './CardImage.vue'
import CardHeading from './CardHeading.vue'
import CardDescription from './CardDescription.vue'
import CardMetadata from './CardMetadata.vue'
import CardAction from './CardAction.vue'
import classes from './Card.module.css'
import { cardContextKey } from './context'
import { normalizeReactStyle } from '../internal/style'
import type { CardProps } from './types'

// Flatten Vue template/v-for groups, but preserve explicitly supplied Fragments.
function flattenChildren(nodes: VNode[]): VNode[] {
  return nodes.flatMap((node) => {
    if (node.type === Fragment && node.patchFlag !== 0 && Array.isArray(node.children))
      return flattenChildren(node.children as VNode[])
    return node.type === Comment ? [] : [node]
  })
}

export default defineComponent({
  name: 'Card',
  inheritAttrs: false,
  props: {
    as: { type: String as PropType<CardProps['as']>, default: 'div' },
    className: { type: String, default: undefined },
    padding: { type: String as PropType<CardProps['padding']>, default: 'normal' },
    borderRadius: { type: String as PropType<CardProps['borderRadius']>, default: 'large' },
    layout: { type: String as PropType<CardProps['layout']>, default: 'default' },
  },
  setup(props, { attrs, slots, expose }) {
    const generatedId = useId()
    const titleId = computed(() => (props.as === 'section' ? generatedId : undefined))
    provide(cardContextKey, { titleId })
    const element = shallowRef<HTMLElement | null>(null)
    expose({ element })

    return () => {
      const children = flattenChildren(slots.default?.() ?? [])
      let icon: VNode | undefined
      let image: VNode | undefined
      let heading: VNode | undefined
      let description: VNode | undefined
      let metadata: VNode | undefined
      let action: VNode | undefined
      for (const child of children) {
        if (child.type === CardIcon) icon = child
        else if (child.type === CardImage) image = child
        else if (child.type === CardHeading) heading = child
        else if (child.type === CardDescription) description = child
        else if (child.type === CardMetadata) metadata = child
        else if (child.type === CardAction) action = child
      }

      const hasSubcomponents = icon || image || heading || description || metadata || action
      if (!hasSubcomponents && children.length === 0) return null

      const { class: classValue, style, ...rest } = attrs
      const automaticLabel =
        props.as === 'section' && !('aria-label' in attrs) && !('aria-labelledby' in attrs)
          ? { 'aria-labelledby': titleId.value }
          : {}

      return h(
        props.as,
        {
          class: [classes.Card, props.className, classValue],
          'data-component': 'Card',
          'data-padding': props.padding,
          'data-border-radius': props.borderRadius,
          'data-layout': props.layout,
          ...automaticLabel,
          ...rest,
          style: normalizeReactStyle(style),
          ref: element,
        },
        hasSubcomponents
          ? [
              image || icon
                ? h('div', { class: [classes.CardHeader, image && classes.CardHeaderEdgeToEdge] }, [
                    image || icon,
                  ])
                : null,
              h('div', { class: classes.CardBody }, [
                h('div', { class: classes.CardContent }, [heading, description]),
                metadata ? h('div', { class: classes.CardMetadataContainer }, [metadata]) : null,
              ]),
              action ? h('div', { class: classes.CardAction }, [action]) : null,
            ]
          : children,
      )
    }
  },
})
</script>
