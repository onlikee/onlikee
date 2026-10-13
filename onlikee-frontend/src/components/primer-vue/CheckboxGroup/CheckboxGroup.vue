<script lang="ts">
import { defineComponent, getCurrentInstance, h, shallowRef, toRef } from 'vue'
import { elementChildren, isSlot, slotChildren } from '../composables/useSlots'
import FormControl from '../FormControl/FormControl.vue'
import Checkbox from '../Checkbox/Checkbox.vue'
import CheckboxOrRadioGroup from '../internal/components/CheckboxOrRadioGroup/CheckboxOrRadioGroup.vue'
import { provideCheckboxGroupContext } from './context'
export default defineComponent({
  name: 'CheckboxGroup',
  inheritAttrs: false,
  props: {
    id: { type: String, default: undefined },
    disabled: Boolean,
    required: Boolean,
    className: { type: String, default: undefined },
    ariaLabelledby: { type: String, default: undefined },
  },
  emits: { change: (_selected: string[], _event?: Event) => true },
  setup(props, { slots, attrs, emit }) {
    const instance = getCurrentInstance()!
    const selected = shallowRef<string[]>()
    const renderVersion = shallowRef(0)
    let renderCount = 0
    function handleGroupChange(event: Event) {
      const input = event.currentTarget as HTMLInputElement
      selected.value = input.checked
        ? [...(selected.value ?? []), input.value]
        : (selected.value ?? []).filter((value) => value !== input.value)
      emit('change', selected.value, event)
    }
    provideCheckboxGroupContext({
      disabled: toRef(props, 'disabled'),
      renderVersion,
      get onChange() {
        return instance.vnode.props?.onChange || instance.vnode.props?.onChangeOnce
          ? handleGroupChange
          : undefined
      },
    })
    return () => {
      // React creates a new context value on each group render, refreshing Checkbox effects.
      renderVersion.value = ++renderCount
      const children = slots.default?.() ?? []
      if (!selected.value) {
        selected.value = elementChildren(children)
          .filter((child) => child.type === FormControl || isSlot(child, FormControl))
          .flatMap((child) => elementChildren(slotChildren(child)))
          .filter(
            (child) =>
              (child.type === Checkbox || isSlot(child, Checkbox)) &&
              (child.props?.checked === '' ||
                child.props?.checked ||
                child.props?.defaultChecked === '' ||
                child.props?.defaultChecked ||
                child.props?.['default-checked'] === '' ||
                child.props?.['default-checked']),
          )
          .map((child) => child.props?.value as string)
          .filter(Boolean)
      }
      return h(
        CheckboxOrRadioGroup,
        {
          ...attrs,
          ...props,
          dataComponent: (attrs['data-component'] as string | undefined) ?? 'CheckboxGroup',
        },
        { default: () => children },
      )
    }
  },
})
</script>
