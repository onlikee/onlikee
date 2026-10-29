import UnderlinePanelsRoot from './UnderlinePanels.vue'
import UnderlinePanelsTab from './UnderlinePanelsTab.vue'
import UnderlinePanelsPanel from './UnderlinePanelsPanel.vue'

Object.assign(UnderlinePanelsTab, { __SLOT__: Symbol('UnderlinePanels.Tab') })
Object.assign(UnderlinePanelsPanel, { __SLOT__: Symbol('UnderlinePanels.Panel') })

export const UnderlinePanels = Object.assign(UnderlinePanelsRoot, {
  Tab: UnderlinePanelsTab,
  Panel: UnderlinePanelsPanel,
})

export { UnderlinePanelsTab, UnderlinePanelsPanel }
export type {
  UnderlinePanelsProps,
  UnderlinePanelsTabProps,
  UnderlinePanelsPanelProps,
} from './types'
