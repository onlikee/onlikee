<script lang="ts">
import { defineComponent, h, ref, toRef, useId, type VNodeChild } from 'vue'
import { elementChildren, slotChildren, useSlots } from '../composables/useSlots'
import { provideRadioGroupContext } from './context'
import Label from './RadioGroupLabel.vue'
import Caption from './RadioGroupCaption.vue'
import Validation from './RadioGroupValidation.vue'
import './RadioGroup.css'

export default defineComponent({
  name: 'RadioGroup',
  inheritAttrs: false,
  props: {
    name: { type: String, required: true },
    disabled: Boolean,
    required: Boolean,
    id: { type: String, default: undefined },
    className: { type: String, default: undefined },
    ariaLabelledby: { type: String, default: undefined }
  },
  emits: { change: (_value: string | null, _event: Event) => true },
  setup(props, { slots, attrs, emit }) {
    const generatedId = useId()
    const captionId = ref<string>()
    const validationMessageId = ref<string>()
    const selectedRadioValue = ref<string | null>(null)

    provideRadioGroupContext({
      name: toRef(props, 'name'),
      disabled: toRef(props, 'disabled'),
      required: toRef(props, 'required'),
      captionId,
      validationMessageId,
      onChange(event) {
        const input = event.currentTarget as HTMLInputElement
        if (input.checked) selectedRadioValue.value = input.value
        emit('change', selectedRadioValue.value, event)
      }
    })

    const hidden = (content: string | VNodeChild[], id?: string) =>
      h('span', { id, class: 'radio-group__visually-hidden' }, content)

    return () => {
      const [{ label, caption, validation }, rest] = useSlots(slots.default?.(), {
        caption: Caption,
        label: Label,
        validation: Validation
      })

      const id = props.id ?? generatedId
      captionId.value = caption ? `${id}-caption` : undefined
      validationMessageId.value = validation ? `${id}-validationMessage` : undefined
      const requiredMessageId = props.required ? `${id}-requiredMessage` : undefined

      if (!label && !props.ariaLabelledby) {
        console.warn(
          'A choice group must be labelled using a `CheckboxOrRadioGroup.Label` child, or by passing `aria-labelledby` to the CheckboxOrRadioGroup component.'
        )
      }

      const visuallyHidden = label?.props?.visuallyHidden ?? label?.props?.['visually-hidden']
      const visibleLegend = !!label && visuallyHidden !== '' && !visuallyHidden
      const heading = label
        ? h(
            'legend',
            { class: 'radio-group__legend', 'data-legend-visible': visibleLegend ? '' : undefined },
            [
              label,
              props.required ? hidden(', required') : null,
              caption,
              validation ? hidden(slotChildren(validation)) : null
            ]
          )
        : [caption, requiredMessageId ? hidden('Required', requiredMessageId) : null]

      const body = h(
        'div',
        {
          class: 'radio-group__body',
          ...(!label
            ? {
                'aria-labelledby': props.ariaLabelledby,
                'aria-describedby': [validationMessageId.value, captionId.value, requiredMessageId]
                  .filter(Boolean)
                  .join(' '),
                as: 'div',
                role: 'group'
              }
            : {})
        },
        elementChildren(rest)
      )

      return h('div', [
        h(
          label ? 'fieldset' : 'div',
          {
            class: [props.className, attrs.class, 'radio-group__fieldset'],
            'data-component': 'RadioGroup',
            'data-validation': validation ? '' : undefined,
            ...(label ? { disabled: props.disabled } : {})
          },
          [heading, body]
        ),
        validation
          ? h(
              'div',
              {
                'aria-hidden': label ? true : false,
                style: { height: 'auto', overflow: 'hidden' }
              },
              [h('div', { 'data-show': '', class: 'radio-group__animation' }, [validation])]
            )
          : null
      ])
    }
  }
})
</script>
