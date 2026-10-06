import ActionMenuRoot from './ActionMenu.vue'
import ActionMenuAnchor from './ActionMenuAnchor.vue'
import ActionMenuButton from './ActionMenuButton.vue'
import ActionMenuOverlay from './ActionMenuOverlay.vue'
import { ActionListDivider as ActionMenuDivider } from '../ActionList'

export const ActionMenu = Object.assign(ActionMenuRoot, {
  Button: ActionMenuButton, Anchor: ActionMenuAnchor, Overlay: ActionMenuOverlay, Divider: ActionMenuDivider
})
export { ActionMenuAnchor, ActionMenuButton, ActionMenuOverlay, ActionMenuDivider }
export type * from './types'
export default ActionMenu
