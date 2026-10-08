import ActionBarRoot from './ActionBar.vue'
import ActionBarButton from './ActionBarButton.vue'
import ActionBarIconButton from './ActionBarIconButton.vue'
import ActionBarDivider from './ActionBarDivider.vue'
import ActionBarGroup from './ActionBarGroup.vue'
import ActionBarMenu from './ActionBarMenu.vue'

export const ActionBar = Object.assign(ActionBarRoot, {
  Button: ActionBarButton,
  IconButton: ActionBarIconButton,
  Divider: ActionBarDivider,
  Group: ActionBarGroup,
  Menu: ActionBarMenu,
})
export { ActionBarButton, ActionBarIconButton, ActionBarDivider, ActionBarGroup, ActionBarMenu }
export type * from './types'
export default ActionBar
