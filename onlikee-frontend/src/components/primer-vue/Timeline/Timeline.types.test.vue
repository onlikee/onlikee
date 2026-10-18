<script setup lang="ts">
import { shallowRef } from 'vue'
import Timeline, {
  type TimelineProps,
  type TimelineItemProps,
  type TimelineItemsProps,
  type TimelineBadgeProps,
  type TimelineBadgeVariant,
  type TimelineBodyProps,
  type TimelineBreakProps,
  type TimelineActionsProps,
  type TimelineAvatarProps,
  type TimelineInstance,
  type TimelineSectionInstance,
} from './index'

const root = shallowRef<TimelineInstance | null>(null)
const body = shallowRef<TimelineSectionInstance | null>(null)
void [root.value, body.value]
const props: TimelineProps = {
  clipSidebar: 'both',
  start: 2,
  reversed: true,
  onClick: (event) => event.preventDefault(),
}
const item: TimelineItemProps = { condensed: true, value: 2 }
const legacyItem: TimelineItemsProps = item
const variant: TimelineBadgeVariant = 'sponsors'
const badge: TimelineBadgeProps = { variant, className: 'custom' }
const content: TimelineBodyProps = { title: 'Body' }
const gap: TimelineBreakProps = { title: 'Gap' }
const actions: TimelineActionsProps = { tabindex: 0 }
const avatar: TimelineAvatarProps = { 'aria-label': 'Actor' }
// @ts-expect-error Only the source clip values are supported.
const invalidClip: TimelineProps = { clipSidebar: 'middle' }
// @ts-expect-error List semantics own the root role.
const invalidRole: TimelineProps = { role: 'menu' }
// @ts-expect-error Break controls its presentation role.
const invalidBreak: TimelineBreakProps = { role: 'separator' }
// @ts-expect-error Variants are restricted to the source union.
const invalidBadge: TimelineBadgeProps = { variant: 'primary' }
// @ts-expect-error System style props are not supported.
const invalidSystem: TimelineBodyProps = { backgroundColor: 'red' }
void [invalidClip, invalidRole, invalidBreak, invalidBadge, invalidSystem, legacyItem]
</script>

<template>
  <Timeline ref="root" v-bind="props">
    <Timeline.Item v-bind="item">
      <Timeline.Avatar v-bind="avatar" />
      <Timeline.Badge v-bind="badge" />
      <Timeline.Body ref="body" v-bind="content" />
      <Timeline.Actions v-bind="actions" />
    </Timeline.Item>
    <Timeline.Break v-bind="gap" />
  </Timeline>
  <!-- @vue-expect-error Only source variants are supported. -->
  <Timeline.Badge variant="primary" />
  <!-- @vue-expect-error Condensed is boolean. -->
  <Timeline.Item condensed="yes" />
</template>
