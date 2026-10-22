import ProgressBarRoot from './ProgressBar.vue'
import ProgressBarItem from './ProgressBarItem.vue'

export const ProgressBar = Object.assign(ProgressBarRoot, {
  Item: ProgressBarItem,
})

export { ProgressBarItem }
export type {
  ProgressBarProps,
  ProgressBarItemProps,
  ProgressBarInstance,
  ProgressBarItemInstance,
} from './types'
