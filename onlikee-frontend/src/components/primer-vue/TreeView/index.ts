import Root from './TreeView.vue'
import Item from './TreeViewItem.vue'
import SubTree from './TreeViewSubTree.vue'
import LeadingAction from './TreeViewLeadingAction.vue'
import LeadingVisual from './TreeViewLeadingVisual.vue'
import TrailingVisual from './TreeViewTrailingVisual.vue'
import DirectoryIcon from './TreeViewDirectoryIcon.vue'
import ErrorDialog from './TreeViewErrorDialog.vue'
import type { AllowedComponentProps, Component, NativeElements, VNodeProps } from 'vue'
import type { TreeViewItemComponentProps } from './types'

const TreeViewItem = Item as <As extends keyof NativeElements | Component = 'li'>(
  props: TreeViewItemComponentProps<As> & VNodeProps & AllowedComponentProps,
) => ReturnType<typeof Item<As>>

export const TreeView = Object.assign(Root, {
  Item: TreeViewItem,
  SubTree,
  LeadingAction,
  LeadingVisual,
  TrailingVisual,
  DirectoryIcon,
  ErrorDialog,
})
export default TreeView
export type * from './types'
