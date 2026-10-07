<script lang="ts">
import classes from './ActionList.module.css'
import { defineComponent, h, type PropType } from 'vue'
import { useContext, useGroupContext } from './context'
import type { HeadingLevel } from './types'
import TrailingAction from './ActionListGroupHeadingTrailingAction.vue'
import { useFeatureFlag } from '../FeatureFlags/context'
import { useSlots } from '../composables/useSlots'
import { normalizeReactStyle } from '../internal/style'
export default defineComponent({
  name: 'ActionListGroupHeading', __SLOT__: Symbol('ActionList.GroupHeading'), inheritAttrs: false,
  props: {
    as: { type: String as PropType<HeadingLevel>, default: undefined },
    variant: { type: String as PropType<'filled' | 'subtle'>, default: 'subtle' },
    auxiliaryText: { type: String, default: undefined }, className: { type: String, default: undefined },
    headingWrapElement: { type: String as PropType<'div' | 'li'>, default: 'div' },
    internalBackwardCompatibleTitle: { type: String, default: undefined }
  },
  setup(props, { slots, attrs }) {
    const context = useContext(), group = useGroupContext()
    const enabled = useFeatureFlag('primer_react_action_list_group_heading_trailing_action')
    return () => {
      const children = slots.default?.()
      const [matched, rest] = useSlots(children, { trailingAction: TrailingAction })
      const action = enabled.value ? matched.trailingAction : null
      const listRole = context?.listRole.value
      const semanticList = listRole === undefined || listRole === 'list'
      if (action && !semanticList) throw new Error('ActionList.GroupHeading.TrailingAction is only supported in lists with the default list role.')
      if (semanticList && children !== undefined && props.as === undefined) throw new Error("You are setting a heading for a list, that requires a heading level. Please use 'as' prop to set a proper heading level.")
      if (!semanticList && children !== undefined && props.as !== undefined) throw new Error('Group headings for menu and listbox roles are representational and do not need a heading level.')
      const headingChildren = props.internalBackwardCompatibleTitle ?? (enabled.value ? rest : children)
      const headingAttrs = { ...attrs, style: normalizeReactStyle(attrs.style) }
      return h(props.headingWrapElement, {
        class: [classes['action-list-group-heading-wrap']], 'data-variant': props.variant,
        'data-component': 'GroupHeadingWrap',
        ...(semanticList ? { 'data-has-trailing-action': action ? '' : undefined } : { role: 'presentation', 'aria-hidden': 'true', ...headingAttrs })
      }, [
        h(semanticList ? props.as || 'h3' : 'span', {
          id: group.groupHeadingId, ...(semanticList ? headingAttrs : {}), class: [classes['action-list-group-heading'], props.className, attrs.class] }, headingChildren),
        props.auxiliaryText ? h('div', { class: [classes['action-list-description']] }, props.auxiliaryText) : null,
        action && semanticList ? h('span', { class: [classes['action-list-group-heading-action']] }, [action]) : null
      ])
    }
  }
})
</script>
