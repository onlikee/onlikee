<script lang="ts">
import { defineComponent, h } from 'vue'
import { elementChildren, isSlot, slotChildren } from '../composables/useSlots'
import FormControl from '../FormControl/FormControl.vue'
import Checkbox from '../Checkbox/Checkbox.vue'
import CheckboxOrRadioGroup from '../internal/components/CheckboxOrRadioGroup/CheckboxOrRadioGroup.vue'
import { provideCheckboxGroupContext } from './context'
export default defineComponent({
  name: 'CheckboxGroup', inheritAttrs: false,
  props: { id: { type: String, default: undefined }, disabled: Boolean, required: Boolean,
    className: { type: String, default: undefined }, ariaLabelledby: { type: String, default: undefined } },
  emits: { change: (_selected: string[], _event?: Event) => true },
  setup(props, { slots, attrs, emit }) {
    let selected: string[] | undefined
    provideCheckboxGroupContext({ onChange(event) {
      const input = event.currentTarget as HTMLInputElement
      selected = input.checked ? [...(selected ?? []), input.value] : (selected ?? []).filter(value => value !== input.value)
      emit('change', selected, event)
    } })
    return () => {
      const children = slots.default?.() ?? []
      if (!selected) {
        selected = elementChildren(children)
          .filter(child => child.type === FormControl || isSlot(child, FormControl))
          .flatMap(child => elementChildren(slotChildren(child)))
          .filter(child => (child.type === Checkbox || isSlot(child, Checkbox)) && (child.props?.checked || child.props?.defaultChecked || child.props?.['default-checked']))
          .map(child => child.props?.value as string).filter(Boolean)
      }
      return h(CheckboxOrRadioGroup, { ...attrs, ...props, dataComponent: (attrs['data-component'] as string | undefined) ?? 'CheckboxGroup' }, { default: () => children })
    }
  }
})
</script>
