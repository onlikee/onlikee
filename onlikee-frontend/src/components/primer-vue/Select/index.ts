import SelectRoot from './Select.vue'
import SelectOptionRoot from './SelectOption.vue'
import SelectOptGroupRoot from './SelectOptGroup.vue'
import type {
  AllowedComponentProps,
  OptionHTMLAttributes,
  OptgroupHTMLAttributes,
  VNodeProps,
} from 'vue'
import type { SelectProps } from './types'

type NativeComponent<Sfc extends abstract new (...args: never[]) => object, Props> = {
  new (): Omit<InstanceType<Sfc>, '$props'> & {
    $props: Props & AllowedComponentProps & VNodeProps
  }
}
const SelectOption = SelectOptionRoot as unknown as NativeComponent<
  typeof SelectOptionRoot,
  Omit<OptionHTMLAttributes, 'value'> & { value: string; className?: string }
>
const SelectOptGroup = SelectOptGroupRoot as unknown as NativeComponent<
  typeof SelectOptGroupRoot,
  OptgroupHTMLAttributes & { className?: string }
>
const SelectComponent = SelectRoot as unknown as NativeComponent<
  typeof SelectRoot,
  SelectProps & { 'onUpdate:value'?: (value: string) => void }
> & { __SLOT__: symbol }

export const Select = Object.assign(SelectComponent, {
  Option: SelectOption,
  OptGroup: SelectOptGroup,
})

export { SelectOption, SelectOptGroup }
export type { SelectProps, SelectOptions, SelectEmits } from './types'
