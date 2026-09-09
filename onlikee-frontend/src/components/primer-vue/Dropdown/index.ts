import DropdownRoot from './Dropdown.vue'
import DropdownTrigger from './DropdownTrigger.vue'
import DropdownContent from './DropdownContent.vue'

export const Dropdown = Object.assign(DropdownRoot, {
  trigger: DropdownTrigger,
  content: DropdownContent
})

export {
  DropdownTrigger,
  DropdownContent
}
