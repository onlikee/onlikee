<script lang="ts">
import { defineComponent, h, ref, toRef, useId, type VNodeChild } from 'vue'
import { elementChildren, slotChildren, useSlots } from '../../../composables/useSlots'
import { provideChoiceGroupContext } from './context'
import Label from '../../../RadioGroup/RadioGroupLabel.vue'
import Caption from '../../../RadioGroup/RadioGroupCaption.vue'
import Validation from '../../../RadioGroup/RadioGroupValidation.vue'
import ValidationAnimationContainer from '../ValidationAnimationContainer.vue'
import '../../../RadioGroup/RadioGroup.css'
import { normalizeReactStyle } from '../../style'

export default defineComponent({
  name: 'CheckboxOrRadioGroup', inheritAttrs: false,
  props: {
    id: { type: String, default: undefined }, disabled: Boolean, required: Boolean,
    className: { type: String, default: undefined },
    ariaLabelledby: { type: String, default: undefined },
    // 源 CheckboxOrRadioGroup.tsx:43 'data-component': dataComponentProp 无默认——
    // undefined 时 fieldset 省略 data-component、parentName undefined 使子组件亦省略
    // （审计偏差 3；公共路径 RadioGroup/CheckboxGroup 恒传值，仅内部直接复用时可见）。
    dataComponent: { type: String, default: undefined }
  },
  setup(props, { slots, attrs, expose }) {
    const generatedId = useId()
    const captionId = ref<string>()
    const validationMessageId = ref<string>()
    const element = ref<HTMLElement | null>(null)
    provideChoiceGroupContext({ disabled: toRef(props, 'disabled'), required: toRef(props, 'required'),
      parentName: toRef(props, 'dataComponent'), captionId, validationMessageId })
    expose({ element })
    const hidden = (content: string | VNodeChild[], id?: string) => h('span', { id, class: 'radio-group__visually-hidden' }, content)
    return () => {
      const [{ label, caption, validation }, rest] = useSlots(slots.default?.(), { caption: Caption, label: Label, validation: Validation })
      // 源 useId(idProp) 为 truthy 判定（hooks/useId.ts:12 `if (id) return id`）——
      // id="" 回退生成 id，而非保留空串（审计偏差 7）。
      const id = props.id || generatedId
      captionId.value = caption ? `${id}-caption` : undefined
      validationMessageId.value = validation ? `${id}-validationMessage` : undefined
      const requiredMessageId = props.required ? `${id}-requiredMessage` : undefined
      if (!label && !props.ariaLabelledby) console.warn('A choice group must be labelled using a `CheckboxOrRadioGroup.Label` child, or by passing `aria-labelledby` to the CheckboxOrRadioGroup component.')
      const visuallyHidden = label?.props?.visuallyHidden ?? label?.props?.['visually-hidden']
      // 源 :101-103 {isValidElement(validation) && validation.props.children && <VisuallyHidden>{children}</VisuallyHidden>}：
      // children falsy → 不渲染。Vue slotChildren 恒返回数组，空数组 ≡ 源 children=undefined
      // → 不渲染空隐藏 span（审计偏差 8）。源对数字 0 输出裸 0 的怪癖在 Vue slot children
      // 归一为 [0] 后不可达，此处按非空分支镜像（近似，登记）。
      const validationContent = validation ? slotChildren(validation) : []
      // 源 isLegendVisible = isValidElement(labelChild) && !labelChild.props.visuallyHidden：
      // visuallyHidden='' 时 !'' = true → 可见；旧 Vue 的 `!== ''` 判定与此相反（审计偏差 8）。
      const heading = label ? h('legend', { class: 'radio-group__legend', 'data-legend-visible': !visuallyHidden ? '' : undefined }, [
        label, props.required ? hidden(', required') : null, caption,
        validationContent.length > 0 ? hidden(validationContent) : null
      ]) : [caption, requiredMessageId ? hidden('Required', requiredMessageId) : null]
      const body = h('div', { class: 'radio-group__body', ...(!label ? {
        'aria-labelledby': props.ariaLabelledby,
        'aria-describedby': [validationMessageId.value, captionId.value, requiredMessageId].filter(Boolean).join(' '),
        as: 'div', role: 'group'
      } : {}) }, elementChildren(rest))
      return h('div', [h(label ? 'fieldset' : 'div', {
        ...attrs, ref: element, class: [attrs.class, props.className, 'radio-group__fieldset'],
        style: normalizeReactStyle(attrs.style),
        'data-component': props.dataComponent, 'data-validation': validation ? '' : undefined,
        ...(label ? { disabled: props.disabled } : {})
      }, [heading, body]), validation ? h(ValidationAnimationContainer, { show: true, 'aria-hidden': Boolean(label) }, { default: () => validation }) : null])
    }
  }
})
</script>
