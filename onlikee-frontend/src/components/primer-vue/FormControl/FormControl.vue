<script lang="ts">
import { cloneVNode, computed, defineComponent, h, toRef, useId } from 'vue'
import { createFormControlContext, provideFormControlContext } from './context'
import { useRadioGroupContext } from '../RadioGroup/context'
import { elementChildren, isSlot, useSlots } from '../composables/useSlots'
import Radio from '../Radio/Radio.vue'
import Label from './FormControlLabel.vue'
import Caption from './FormControlCaption.vue'
import Validation from './FormControlValidation.vue'
import LeadingVisual from './FormControlLeadingVisual.vue'

export default defineComponent({
  name: 'FormControl',
  inheritAttrs: false,
  props: {
    id: { type: String, default: undefined },
    disabled: Boolean,
    required: Boolean,
    className: { type: String, default: undefined },
    layout: { type: String, default: 'vertical' }
  },
  setup(props, { slots, attrs }) {
    const generatedId = `form-control-${useId()}`
    const group = useRadioGroupContext()
    const id = computed(() => props.id ?? generatedId)
    const disabled = computed(() => !!group?.disabled.value || props.disabled)
    const context = createFormControlContext(toRef(props, 'required'), id, disabled)
    provideFormControlContext(context)

    return () => {
      const children = slots.default?.() ?? []
      const [matchedSlots, childrenWithoutSlots] = useSlots(children, {
        caption: Caption,
        label: Label,
        leadingVisual: LeadingVisual,
        validation: Validation
      })
      const { label, caption, validation, leadingVisual: leading } = matchedSlots
      const inputs = elementChildren(childrenWithoutSlots)
      const radio = inputs.find((child) => child.type === Radio || isSlot(child, Radio))

      context.choice.value = !!radio
      context.controlId.value = radio ? id.value : undefined
      context.labelId.value = label ? (label.props?.id ?? `${id.value}-label`) : undefined
      context.captionId.value = caption ? `${id.value}-caption` : undefined

      if (!radio) {
        return h(
          'div',
          {
            ...attrs,
            id: props.id,
            class: [attrs.class, props.className, 'form-control'],
            'data-component': 'FormControl',
            'data-validation-variant': context.validationVariant.value
          },
          children
        )
      }

      if (import.meta.env.DEV) {
        for (const prop of ['id', 'disabled', 'required']) {
          if (radio.props?.[prop])
            console.warn(
              'Warning:',
              `instead of passing the '${prop}' prop directly to the input component, it should be passed to the parent component, <FormControl>`
            )
        }
        if (validation)
          console.warn(
            'Warning:',
            'Validation messages are not rendered for an individual checkbox or radio. The validation message should be shown for all options.'
          )
        if (!label)
          console.error(
            `The input field with the id ${id.value} MUST have a FormControl.Label child.`
          )
      }

      const rest = inputs.filter((child) => child.type !== Radio && !isSlot(child, Radio))
      const input = cloneVNode(radio, {
        id: id.value,
        disabled: disabled.value,
        required: false,
        'aria-describedby': context.captionId.value
      })

      return h(
        'div',
        {
          class: [attrs.class, props.className, 'form-control--horizontal'],
          style: attrs.style,
          'data-component': 'FormControl',
          'data-has-leading-visual': leading ? '' : undefined
        },
        [
          h('div', { class: 'form-control__choice-inputs' }, [input, ...rest]),
          leading
            ? h(
                'div',
                {
                  class: 'form-control__choice-leading',
                  'data-disabled': disabled.value ? '' : undefined,
                  'data-has-caption': caption ? '' : undefined
                },
                [leading]
              )
            : null,
          h('div', { class: 'form-control__label-container' }, [label, caption])
        ]
      )
    }
  }
})
</script>

<style scoped>
.form-control {
  display: grid;
  gap: 4px;
}

.form-control[data-validation-variant='error'] :deep(.input),
.form-control[data-validation-variant='error'] :deep(.input-wrapper),
.form-control[data-validation-variant='error'] :deep(.textarea) {
  border-color: var(--borderColor-danger-emphasis, #cf222e);
}

.form-control[data-validation-variant='error'] :deep(.input:focus),
.form-control[data-validation-variant='error'] :deep(.input-wrapper:focus-within),
.form-control[data-validation-variant='error'] :deep(.textarea:focus) {
  outline: 2px solid var(--borderColor-danger-emphasis, #cf222e);
  outline-offset: -1px;
}

.form-control[data-validation-variant='error'] :deep(.input-wrapper .input:focus) {
  outline: none;
}

.form-control[data-validation-variant='success'] :deep(.input),
.form-control[data-validation-variant='success'] :deep(.input-wrapper),
.form-control[data-validation-variant='success'] :deep(.textarea) {
  border-color: var(--borderColor-success-emphasis, #1a7f37);
}

.form-control--horizontal {
  display: flex;

  &:where([data-has-leading-visual]) {
    align-items: center;
  }
}

.form-control--vertical {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.form-control--vertical :deep(> *:not(label) + *),
.form-control--vertical[data-has-label] :deep(> * + *) {
  margin-top: var(--base-size-4, 4px);
}

.form-control__choice-inputs :deep(> input) {
  margin-right: 0;
  margin-left: 0;
}

.form-control__label-container :deep(> *) {
  /* stylelint-disable-next-line primer/spacing */
  padding-left: var(--stack-gap-condensed, 8px);
}

.form-control__label-container :deep(> label) {
  font-weight: var(--base-text-weight-normal, 400);
}

.form-control__choice-leading {
  margin-left: var(--base-size-8, 8px);
  color: var(--fgColor-muted, #59636e);

  &:where([data-disabled]) {
    color: var(--control-fgColor-disabled, #818b98);
  }
}

.form-control__choice-leading :deep(> *) {
  min-width: var(--text-body-size-large, 16px);
  min-height: var(--text-body-size-large, 16px);
  fill: currentColor;
}

.form-control__choice-leading :deep(> *:where([data-has-caption])) {
  min-width: var(--base-size-24, 24px);
  min-height: var(--base-size-24, 24px);
}
</style>
