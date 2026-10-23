<script setup lang="ts">
import {
  ArchiveIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  IssueClosedIcon,
  SkipIcon,
  IssueDraftIcon,
  IssueOpenedIcon,
  GitMergeQueueIcon,
  AlertIcon,
  ShieldIcon,
  ShieldCheckIcon,
  ShieldSlashIcon,
  ShieldXIcon,
} from '@onlikee/octicons-vue'
import { computed, shallowRef, useAttrs } from 'vue'
import { normalizeReactStyle } from '../internal/style'
import type { StateLabelProps, StateLabelStatus } from './types'

defineOptions({ name: 'StateLabel', inheritAttrs: false })
const props = defineProps<StateLabelProps>()
const attrs = useAttrs()
const element = shallowRef<HTMLSpanElement | null>(null)
defineExpose({ element })

const icons = {
  issueOpened: IssueOpenedIcon,
  pullOpened: GitPullRequestIcon,
  issueClosed: IssueClosedIcon,
  issueClosedNotPlanned: SkipIcon,
  pullClosed: GitPullRequestClosedIcon,
  pullMerged: GitMergeIcon,
  draft: GitPullRequestDraftIcon,
  issueDraft: IssueDraftIcon,
  pullQueued: GitMergeQueueIcon,
  unavailable: AlertIcon,
  alertOpened: ShieldIcon,
  alertFixed: ShieldCheckIcon,
  alertDismissed: ShieldSlashIcon,
  alertClosed: ShieldXIcon,
  open: null,
  closed: null,
  archived: ArchiveIcon,
}
const labels: Record<StateLabelStatus, string> = {
  issueOpened: 'Issue',
  pullOpened: 'Pull request',
  issueClosed: 'Issue',
  issueClosedNotPlanned: 'Issue, not planned',
  pullClosed: 'Pull request',
  pullMerged: 'Pull request',
  draft: 'Pull request',
  issueDraft: 'Issue',
  pullQueued: 'Pull request',
  unavailable: '',
  alertOpened: 'Alert',
  alertFixed: 'Alert',
  alertDismissed: 'Alert',
  alertClosed: 'Alert',
  open: '',
  closed: '',
  archived: 'Archived',
}
const inferredSize = computed(() => props.size || (props.variant === 'small' ? 'small' : 'medium'))
</script>

<template>
  <span
    ref="element"
    v-bind="attrs"
    :class="[$style.StateLabel, className]"
    :style="normalizeReactStyle(attrs.style)"
    data-component="StateLabel"
    :data-size="inferredSize"
    :data-status="status"
  >
    <component
      :is="icons[status]"
      v-if="status !== 'open' && status !== 'closed'"
      :data-size-small="inferredSize === 'small' ? '' : undefined"
      :aria-label="labels[status]"
      :class="$style.Icon"
    />
    <slot />
  </span>
</template>

<style module src="./StateLabel.module.css" />
