import DetailsRoot from './Details.vue'
import Summary from './DetailsSummary.vue'

export const Details = Object.assign(DetailsRoot, { Summary })
export { Summary }
export type { DetailsProps, DetailsInstance, SummaryProps } from './types'
export { useDetails } from '../composables/useDetails'
export type {
  UseDetailsParameters,
  DetailsOpenState,
  DetailsOpenUpdate,
} from '../composables/useDetails'
export default Details
