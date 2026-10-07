<script lang="ts">
import classes from './ActionList.module.css'
import { Comment, Text, defineComponent, h, isVNode, provide, reactive, useId, type PropType } from 'vue'
import { ActionListGroupContext, useContext } from './context'
import type { ActionListGroupContextValue, ActionListSelectionVariant } from './types'
import GroupHeading from './ActionListGroupHeading.vue'
import { slotChildren, useSlots } from '../composables/useSlots'
import { normalizeReactStyle } from '../internal/style'
export default defineComponent({
  name: 'ActionListGroup', __SLOT__: Symbol('ActionList.Group'), inheritAttrs: false,
  props: {
    title: { type: String, default: undefined }, variant: { type: String as PropType<'filled' | 'subtle'>, default: 'subtle' },
    auxiliaryText: { type: String, default: undefined },
    selectionVariant: { type: [String, Boolean] as PropType<ActionListSelectionVariant | false>, default: undefined },
    role: { type: String, default: undefined }, className: { type: String, default: undefined }
  },
  setup(props, { slots, attrs }) {
    const id = useId(), context = useContext()
    const group = reactive<ActionListGroupContextValue>({})
    provide(ActionListGroupContext, group)
    return () => {
      const [matched, rest] = useSlots(slots.default?.(), { groupHeading: GroupHeading })
      const listRole = context?.listRole.value
      group.groupHeadingId = props.title ? id : matched.groupHeading ? matched.groupHeading.props?.id ?? id : undefined
      group.selectionVariant = props.selectionVariant
      // 分组的无障碍标签按子内容的字符串转换结果生成。
      const headingChildren = matched.groupHeading ? slotChildren(matched.groupHeading) : undefined
      const headingLabel = headingChildren === undefined ? undefined : String(
        Array.isArray(headingChildren) ? headingChildren.map(child =>
          isVNode(child) ? child.type === Text ? child.children : child.type === Comment ? null : child : child
        ) : headingChildren
      )
      const { 'aria-label': ariaLabel, class: classAttr, style, ...rootAttrs } = attrs
      return h('li', { class: [classes['action-list-group'], props.className, classAttr], 'data-component': 'ActionList.Group',
        role: listRole ? 'none' : undefined, ...rootAttrs, style: normalizeReactStyle(style) }, [
        props.title && !matched.groupHeading ? h(GroupHeading, { variant: props.variant, auxiliaryText: props.auxiliaryText, internalBackwardCompatibleTitle: props.title }) : null,
        !props.title && matched.groupHeading ? matched.groupHeading : null,
        h('ul', { 'aria-labelledby': listRole ? undefined : group.groupHeadingId,
          'aria-label': ariaLabel ?? (listRole ? props.title ?? headingLabel : undefined),
          role: props.role || (listRole ? 'group' : undefined), class: [classes['action-list-group-list']]
        }, matched.groupHeading ? rest : slots.default?.())
      ])
    }
  }
})
</script>
