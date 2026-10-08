import SelectRoot from './Select.vue'
import SelectOption from './SelectOption.vue'
import SelectOptGroup from './SelectOptGroup.vue'

export const Select = Object.assign(SelectRoot, {
  Option: SelectOption,
  OptGroup: SelectOptGroup,
})

export { SelectOption, SelectOptGroup }
export type { SelectProps, SelectOptions, SelectEmits } from './types'
