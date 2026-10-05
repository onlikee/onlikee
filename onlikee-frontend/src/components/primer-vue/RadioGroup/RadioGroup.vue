<script lang="ts">
import { defineComponent, h, ref, toRef } from 'vue'
import { provideRadioGroupContext } from './context'
import CheckboxOrRadioGroup from '../internal/components/CheckboxOrRadioGroup/CheckboxOrRadioGroup.vue'
export default defineComponent({
  name: 'RadioGroup', inheritAttrs: false,
  props: {
    name: { type: String, required: true }, disabled: Boolean, required: Boolean,
    id: { type: String, default: undefined }, className: { type: String, default: undefined },
    ariaLabelledby: { type: String, default: undefined }
  },
  emits: { change: (_value: string | null, _event: Event) => true },
  setup(props, { slots, attrs, emit }) {
    const selected = ref<string | null>(null)
    provideRadioGroupContext({ name: toRef(props, 'name'), disabled: toRef(props, 'disabled'), required: toRef(props, 'required'),
      captionId: ref(), validationMessageId: ref(), onChange(event) {
        const input = event.currentTarget as HTMLInputElement
        if (input.checked) selected.value = input.value
        emit('change', selected.value, event)
      } })
    return () => {
      const { name: _name, ...groupProps } = props
      return h(CheckboxOrRadioGroup, { ...attrs, ...groupProps, dataComponent: (attrs['data-component'] as string | undefined) ?? 'RadioGroup' }, slots)
    }
  }
})
</script>
