import TimelineRoot from './Timeline.vue'
import TimelineItem from './TimelineItem.vue'
import TimelineBadge from './TimelineBadge.vue'
import TimelineBody from './TimelineBody.vue'
import TimelineBreak from './TimelineBreak.vue'
import TimelineAvatar from './TimelineAvatar.vue'
import TimelineActions from './TimelineActions.vue'

export const Timeline = Object.assign(TimelineRoot, {
  Item: TimelineItem,
  Badge: TimelineBadge,
  Body: TimelineBody,
  Break: TimelineBreak,
  Avatar: TimelineAvatar,
  Actions: TimelineActions,
})

export { TimelineItem, TimelineBadge, TimelineBody, TimelineBreak, TimelineAvatar, TimelineActions }
export type * from './types'
export default Timeline
