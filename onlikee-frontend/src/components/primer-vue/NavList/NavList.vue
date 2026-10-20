<script lang="ts">
/* eslint-disable vue/one-component-per-file -- The inner provider scopes ActionList context to the list. */
import { cloneVNode, defineComponent, h, provide, shallowRef, useId } from 'vue'
import { ActionList } from '../ActionList'
import { ActionListContainerContext } from '../ActionList/context'
import { useSlots } from '../composables/useSlots'
import { normalizeReactStyle } from '../internal/style'
import { headingLevelKey } from './context'
import Heading from './NavListHeading.vue'

const Items = defineComponent({
  name: 'NavListItems',
  props: { disableItemGap: Boolean },
  setup(props, { slots }) {
    provide(ActionListContainerContext, { container: 'NavList' })
    return () => h(ActionList, { disableItemGap: props.disableItemGap }, slots)
  },
})

export default defineComponent({
  name: 'NavList',
  inheritAttrs: false,
  props: { disableItemGap: Boolean, className: { type: String, default: undefined } },
  setup(props, { attrs, slots, expose }) {
    const element = shallowRef<HTMLElement | null>(null)
    const headingLevel = shallowRef<number | null>(null)
    const fallbackHeadingId = useId()
    provide(headingLevelKey, headingLevel)
    expose({ element })
    return () => {
      const [matched, rest] = useSlots(slots.default?.(), { heading: Heading })
      const heading = matched.heading
      const headingId = heading ? (heading.props?.id ?? fallbackHeadingId) : undefined
      headingLevel.value = heading ? (heading.props?.as === 'h3' ? 3 : 2) : null
      const { 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, ...rootAttrs } = attrs
      return h(
        'nav',
        {
          ...rootAttrs,
          class: [props.className, attrs.class],
          style: normalizeReactStyle(attrs.style),
          'aria-label': ariaLabel,
          'aria-labelledby': ariaLabelledby ?? (ariaLabel ? undefined : headingId),
          ref: element,
          'data-component': 'NavList',
        },
        [
          heading ? cloneVNode(heading, { id: headingId }) : null,
          h(Items, { disableItemGap: props.disableItemGap }, { default: () => rest }),
        ],
      )
    }
  },
})
</script>
