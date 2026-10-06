<script lang="ts">
import { cloneVNode, computed, defineComponent, h, ref, shallowReactive, toRef, useId, type Component, type PropType, type VNode } from 'vue'
import { provideFormControlContext } from './context'
import { useChoiceGroupContext } from '../internal/components/CheckboxOrRadioGroup/context'
import ValidationAnimationContainer from '../internal/components/ValidationAnimationContainer.vue'
import { elementChildren, isSlot, useSlots } from '../composables/useSlots'
import Radio from '../Radio/Radio.vue'
import Checkbox from '../Checkbox/Checkbox.vue'
import Select from '../Select/Select.vue'
import TextInput from '../TextInput/TextInput.vue'
import Textarea from '../Textarea/Textarea.vue'
import Autocomplete from '../Autocomplete/Autocomplete.vue'
import TextInputWithTokens from '../TextInputWithTokens/TextInputWithTokens.vue'
import SelectPanel from '../SelectPanel/SelectPanel.vue'
import Label from './FormControlLabel.vue'
import Caption from './FormControlCaption.vue'
import Validation from './FormControlValidation.vue'
import LeadingVisual from './FormControlLeadingVisual.vue'
import { normalizeReactStyle } from '../internal/style'

const expectedInputs = [Autocomplete, Checkbox, Radio, Select, TextInput, TextInputWithTokens, Textarea, SelectPanel]
const choiceInputs = [Checkbox, Radio]
const matches = (child: VNode, component: Component) => child.type === component || isSlot(child, component)
const truthyBoolean = (value: unknown) => value === '' || Boolean(value)

const FormControl = defineComponent({
  name: 'FormControl',
  inheritAttrs: false,
  props: {
    id: { type: String, default: undefined },
    disabled: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    className: { type: String, default: undefined },
    layout: { type: String as PropType<'horizontal' | 'vertical'>, default: 'vertical' }
  },
  setup(props, { slots, attrs, expose }) {
    const generatedId = useId()
    const group = useChoiceGroupContext()
    const id = computed(() => props.id || generatedId)
    const disabled = computed(() => group?.disabled.value || props.disabled)
    const element = ref<HTMLDivElement | null>(null)
    const state = shallowReactive({
      labelId: undefined as string | undefined,
      captionId: undefined as string | undefined,
      validationMessageId: undefined as string | undefined,
      isReferenced: true
    })
    provideFormControlContext({ id, disabled, required: toRef(props, 'required'),
      labelId: toRef(state, 'labelId'), captionId: toRef(state, 'captionId'),
      validationMessageId: toRef(state, 'validationMessageId'), isReferenced: toRef(state, 'isReferenced') })
    expose({ element })

    return () => {
      const [matchedSlots, rest] = useSlots(slots.default?.(), {
        caption: Caption, label: Label, leadingVisual: LeadingVisual, validation: Validation
      })
      const { label, caption, validation, leadingVisual: leading } = matchedSlots
      const children = elementChildren(rest)
      const input = children.find(child => expectedInputs.some(component => matches(child, component)))
      const isRadio = !!input && matches(input, Radio)
      const isChoice = !!input && (isRadio || matches(input, Checkbox))
      const horizontal = isChoice || props.layout === 'horizontal'
      state.labelId = label ? (label.props?.id ?? `${id.value}-label`) : undefined
      state.captionId = caption ? `${id.value}-caption` : undefined
      state.validationMessageId = validation ? `${id.value}-validationMessage` : undefined
      state.isReferenced = !input || !matches(input, SelectPanel)

      if (import.meta.env.DEV) {
        for (const name of ['id', 'disabled', 'required']) {
          if (input && (name === 'id' ? Boolean(input.props?.id) : truthyBoolean(input.props?.[name])))
            console.warn('Warning:', `instead of passing the '${name}' prop directly to the input component, it should be passed to the parent component, <FormControl>`)
        }
        if (isChoice && validation)
          console.warn('Warning:', 'Validation messages are not rendered for an individual checkbox or radio. The validation message should be shown for all options.')
        if (isRadio && children.some(child => truthyBoolean(child.props?.required)))
          console.warn('Warning:', 'An individual radio cannot be a required field.')
        if (!isChoice && leading)
          console.warn('Warning:', 'A leading visual is only rendered for a checkbox or radio form control. If you want to render a leading visual inside of your input, check if your input supports a leading visual.')
      }
      if (!label) console.error(`The input field with the id ${id.value} MUST have a FormControl.Label child.\n\nIf you want to hide the label, pass the 'visuallyHidden' prop to the FormControl.Label component.`)

      const cloned = input ? cloneVNode(input, horizontal ? {
        id: id.value, disabled: disabled.value, required: props.required && !isRadio,
        'aria-describedby': state.captionId
      } : {
        id: id.value, required: props.required, disabled: disabled.value,
        validationStatus: validation?.props?.variant,
        'aria-describedby': [state.validationMessageId, state.captionId].filter(Boolean).join(' '),
        ...input.props
      }) : null
      const remainingHorizontal = children.filter(child => !choiceInputs.some(component => matches(child, component)))
      const remaining = children.filter(child => !expectedInputs.some(component => matches(child, component)))
      const hiddenLabel = truthyBoolean(label?.props?.visuallyHidden ?? label?.props?.['visually-hidden'])
      const rootProps = { ...attrs, ref: element,
        style: normalizeReactStyle(attrs.style),
        class: [attrs.class, props.className, horizontal ? 'form-control--horizontal' : 'form-control--vertical'],
        'data-component': 'FormControl',
        ...(horizontal ? { 'data-has-leading-visual': leading ? '' : undefined } : { 'data-has-label': !hiddenLabel ? '' : undefined }) }
      return h('div', rootProps, horizontal ? [
        h('div', { class: 'form-control__choice-inputs' }, [cloned, ...remainingHorizontal]),
        leading ? h('div', { class: 'form-control__choice-leading',
          'data-disabled': disabled.value ? '' : undefined, 'data-has-caption': caption ? '' : undefined }, [leading]) : null,
        h('div', { class: 'form-control__label-container' }, [label, caption])
      ] : [label, cloned, ...remaining,
        validation ? h(ValidationAnimationContainer, { show: true }, { default: () => validation }) : null,
        caption])
    }
  }
})
export default Object.assign(FormControl, { __SLOT__: Symbol('FormControl') })
</script>

<style scoped>
.form-control--horizontal { display: flex; }
.form-control--horizontal:where([data-has-leading-visual]) { align-items: center; }
.form-control--vertical { display: flex; flex-direction: column; align-items: flex-start; }
.form-control--vertical :deep(> *:not(label) + *),
.form-control--vertical[data-has-label] :deep(> * + *) { margin-top: var(--base-size-4, 4px); }
.form-control__choice-inputs :deep(> input) { margin-right: 0; margin-left: 0; }
.form-control__label-container :deep(> *) { padding-left: var(--stack-gap-condensed, 8px); }
.form-control__label-container :deep(> label) { font-weight: var(--base-text-weight-normal, 400); }
.form-control__choice-leading { margin-left: var(--base-size-8, 8px); color: var(--fgColor-muted, #59636e); }
.form-control__choice-leading:where([data-disabled]) { color: var(--control-fgColor-disabled, #818b98); }
.form-control__choice-leading :deep(> *) { min-width: var(--text-body-size-large, 16px); min-height: var(--text-body-size-large, 16px); fill: currentColor; }
.form-control__choice-leading :deep(> *:where([data-has-caption])) { min-width: var(--base-size-24, 24px); min-height: var(--base-size-24, 24px); }
</style>
