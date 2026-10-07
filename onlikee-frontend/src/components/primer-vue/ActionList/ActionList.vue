<script lang="ts">
import classes from './ActionList.module.css'
import { computed, defineComponent, h, onMounted, onUpdated, ref, useId, type Component, type PropType } from 'vue'
import { provideContext, useContainerContext, exposeElement } from './context'
import type { ActionListSelectionVariant, ActionListVariant } from './types'
import Heading from './ActionListHeading.vue'
import { useSlots } from '../composables/useSlots'
import { useFocusZone, FocusKeys } from '../composables/useFocusZone'
import { useFeatureFlag } from '../FeatureFlags/context'
import { normalizeReactStyle } from '../internal/style'


export default defineComponent({
  name: 'ActionList', inheritAttrs: false,
  props: {
    as: { type: [String, Object, Function] as PropType<string | Component>, default: 'ul' },
    variant: { type: String as PropType<ActionListVariant>, default: 'inset' },
    selectionVariant: { type: String as PropType<ActionListSelectionVariant>, default: undefined },
    showDividers: Boolean, role: { type: String, default: undefined },
    disableFocusZone: Boolean, disableItemGap: Boolean, className: { type: String, default: undefined }
  },
  setup(props, { slots, attrs, expose }) {
    const container = useContainerContext()
    const element = ref<HTMLElement | null>(null)
    const setElement = (node: unknown) => {
      const instance = node as { element?: HTMLElement; $el?: HTMLElement } | null
      element.value = node instanceof HTMLElement ? node : instance?.element ?? instance?.$el ?? null
    }
    const headingId = useId()
    const listRole = computed(() => props.role || container.listRole)
    const selectionVariant = computed(() => props.selectionVariant || container.selectionVariant)
    const itemGapFlag = useFeatureFlag('primer_react_action_list_item_gap')
    provideContext({ selectionVariant, listRole, variant: computed(() => props.variant), headingId })
    useFocusZone(() => ({
      containerRef: element,
      disabled: !(container.enableFocusZone ?? (Boolean(listRole.value) && !props.disableFocusZone && ['menu', 'menubar', 'listbox'].includes(listRole.value!))),
      bindKeys: FocusKeys.ArrowVertical | FocusKeys.HomeAndEnd | FocusKeys.PageUpDown,
      focusOutBehavior: listRole.value === 'menu' || container.container === 'SelectPanel' || container.container === 'FilteredActionList' ? 'wrap' : undefined
    }))
    function syncMixedDescriptions() {
      const list = element.value
      if (!list) return
      const mixed = list.querySelector('[data-has-description="true"]') !== null && list.querySelector('[data-has-description="false"]') !== null
      if (mixed) list.setAttribute('data-mixed-descriptions', 'true')
      else list.removeAttribute('data-mixed-descriptions')
    }
    onMounted(syncMixedDescriptions)
    onUpdated(syncMixedDescriptions)
    expose(exposeElement(element))
    return () => {
      const [matched, rest] = useSlots(slots.default?.(), { heading: Heading })
      return [matched.heading, h(props.as, {
        role: listRole.value,
        'aria-labelledby': matched.heading ? matched.heading.props?.id ?? headingId : container.listLabelledBy,
        ref: setElement, 'data-component': 'ActionList', 'data-dividers': props.showDividers,
        'data-variant': props.variant,
        'data-item-gap': itemGapFlag.value && !props.disableItemGap && container.container === 'NavList' ? '' : undefined,
        ...attrs, class: [classes['action-list'], props.className, attrs.class], style: normalizeReactStyle(attrs.style)
      }, typeof props.as === 'string' ? rest : { default: () => rest })]
    }
  }
})
</script>
