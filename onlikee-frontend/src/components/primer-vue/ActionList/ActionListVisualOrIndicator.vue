<script lang="ts">
import { defineComponent, h } from 'vue'
import { AlertIcon } from '@/components/octicons-vue3'
import Spinner from '../Spinner/Spinner.vue'
import Tooltip from '../TooltipV2/Tooltip.vue'
import LeadingVisual from './ActionListLeadingVisual.vue'
import TrailingVisual from './ActionListTrailingVisual.vue'
export default defineComponent({
  name: 'ActionListVisualOrIndicator', inheritAttrs: false,
  props: { inactiveText: { type: String, default: undefined }, itemHasLeadingVisual: Boolean,
    labelId: { type: String, default: undefined }, loading: Boolean, position: { type: String, required: true } },
  setup(props, { slots, attrs }) {
    return () => {
      if ((!props.loading && !props.inactiveText) || (props.itemHasLeadingVisual && props.position === 'trailing') || (!props.itemHasLeadingVisual && props.position === 'leading')) return slots.default?.()
      const visual = props.position === 'leading' ? LeadingVisual : TrailingVisual
      return props.inactiveText
        ? h('span', { class: 'action-list-inactive-button-wrap', 'data-position': props.position }, [
          h(Tooltip, { text: props.inactiveText, type: 'description' }, { default: () => h('button', {
            type: 'button', class: 'action-list-inactive-button-reset', 'aria-labelledby': props.labelId
          }, [h(visual, null, { default: () => h(AlertIcon, { 'data-component': 'Octicon', 'data-octicon': undefined, display: 'inline-block', overflow: 'visible', style: { overflow: 'visible', verticalAlign: 'text-bottom' } }) })]) })
        ])
        : h(visual, attrs, { default: () => h(Spinner, { size: 'small' }) })
    }
  }
})
</script>
