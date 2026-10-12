import DetailsRoot from './Details.vue'
import Summary from './DetailsSummary.vue'

export const Details = Object.assign(DetailsRoot, { Summary })
export { Summary }
export type { DetailsProps, DetailsInstance, SummaryProps } from './types'
export default Details
