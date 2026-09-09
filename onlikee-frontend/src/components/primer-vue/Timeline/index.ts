import TimelineRoot from './Timeline.vue'
import TimelineItem from './TimelineItem.vue'
import TimelineBadge from './TimelineBadge.vue'
import TimelineBody from './TimelineBody.vue'

export const Timeline = Object.assign(TimelineRoot, {
  Item: TimelineItem,
  Badge: TimelineBadge,
  Body: TimelineBody
})

export {
  TimelineItem,
  TimelineBadge,
  TimelineBody
}
