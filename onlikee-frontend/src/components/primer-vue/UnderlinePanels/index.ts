import UnderlinePanelsRoot from './UnderlinePanels.vue'
import UnderlinePanelsTab from './UnderlinePanelsTab.vue'
import UnderlinePanelsPanel from './UnderlinePanelsPanel.vue'

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
