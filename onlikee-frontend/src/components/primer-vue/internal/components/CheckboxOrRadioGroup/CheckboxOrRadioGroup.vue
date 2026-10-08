<script lang="ts">
import { defineComponent, h, ref, toRef, useId, type VNodeChild } from 'vue'
import { elementChildren, slotChildren, useSlots } from '../../../composables/useSlots'
import { provideChoiceGroupContext } from './context'
import Label from '../../../RadioGroup/RadioGroupLabel.vue'
import Caption from '../../../RadioGroup/RadioGroupCaption.vue'
import Validation from '../../../RadioGroup/RadioGroupValidation.vue'
import ValidationAnimationContainer from '../ValidationAnimationContainer.vue'
import classes from '../../../RadioGroup/RadioGroup.module.css'
import { normalizeReactStyle } from '../../style'

export default defineComponent({
  name: 'CheckboxOrRadioGroup',
  inheritAttrs: false,
  props: {
    id: { type: String, default: undefined },
    disabled: Boolean,
    required: Boolean,
    className: { type: String, default: undefined },
    ariaLabelledby: { type: String, default: undefined },
    dataComponent: { type: String, default: undefined },
  },
  setup(props, { slots, attrs, expose }) {
    const generatedId = useId()
    const captionId = ref<string>()
    const validationMessageId = ref<string>()
    const element = ref<HTMLElement | null>(null)
    provideChoiceGroupContext({
      disabled: toRef(props, 'disabled'),
      required: toRef(props, 'required'),
      parentName: toRef(props, 'dataComponent'),
      captionId,
      validationMessageId,
    })
    expose({ element })
    const hidden = (content: string | VNodeChild[], id?: string) =>
      h('span', { id, class: [classes['radio-group__visually-hidden']] }, content)
    return () => {
      const [{ label, caption, validation }, rest] = useSlots(slots.default?.(), {
        caption: Caption,
        label: Label,
        validation: Validation,
      })
      const id = props.id || generatedId
      captionId.value = caption ? `${id}-caption` : undefined
      validationMessageId.value = validation ? `${id}-validationMessage` : undefined
      const requiredMessageId = props.required ? `${id}-requiredMessage` : undefined
      if (!label && !props.ariaLabelledby)
        console.warn(
          'A choice group must be labelled using a `CheckboxOrRadioGroup.Label` child, or by passing `aria-labelledby` to the CheckboxOrRadioGroup component.',
        )
      const visuallyHidden = label?.props?.visuallyHidden ?? label?.props?.['visually-hidden']
      const validationContent = validation ? slotChildren(validation) : []
      const heading = label
        ? h(
            'legend',
            {
              class: [classes['radio-group__legend']],
              'data-legend-visible': !visuallyHidden ? '' : undefined,
            },
            [
              label,
              props.required ? hidden(', required') : null,
              caption,
              validationContent.length > 0 ? hidden(validationContent) : null,
            ],
          )
        : [caption, requiredMessageId ? hidden('Required', requiredMessageId) : null]
      const body = h(
        'div',
        {
          class: classes['radio-group__body'],
          ...(!label
            ? {
                'aria-labelledby': props.ariaLabelledby,
                'aria-describedby': [validationMessageId.value, captionId.value, requiredMessageId]
                  .filter(Boolean)
                  .join(' '),
                as: 'div',
                role: 'group',
              }
            : {}),
        },
        elementChildren(rest),
      )
      return h('div', [
        h(
          label ? 'fieldset' : 'div',
          {
            ...attrs,
            ref: element,
            class: [attrs.class, props.className, classes['radio-group__fieldset']],
            style: normalizeReactStyle(attrs.style),
            'data-component': props.dataComponent,
            'data-validation': validation ? '' : undefined,
            ...(label ? { disabled: props.disabled } : {}),
          },
          [heading, body],
        ),
        validation
          ? h(
              ValidationAnimationContainer,
              { show: true, 'aria-hidden': Boolean(label) },
              { default: () => validation },
            )
          : null,
      ])
    }
  },
})
</script>
