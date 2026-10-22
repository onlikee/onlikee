import Root from './SegmentedControl.vue'
import SegmentedControlButton from './SegmentedControlButton.vue'
import SegmentedControlIconButton from './SegmentedControlIconButton.vue'
import SegmentedControlDivider from './SegmentedControlDivider.vue'
import SegmentedControlAction from './SegmentedControlAction.vue'

export const SegmentedControl = Object.assign(Root, {
  Button: SegmentedControlButton,
  IconButton: SegmentedControlIconButton,
  Divider: SegmentedControlDivider,
  Action: SegmentedControlAction,
})
export {
  SegmentedControlButton,
  SegmentedControlIconButton,
  SegmentedControlDivider,
  SegmentedControlAction,
}
export type * from './types'
export default SegmentedControl
