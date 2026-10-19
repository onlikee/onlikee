<script setup lang="ts">
import { h } from 'vue'
import { InfoIcon } from '@onlikee/octicons-vue'
import { InlineMessage, type InlineMessageProps } from './index'

const native: InlineMessageProps = {
  size: 'small',
  variant: 'critical',
  className: 'message',
  class: { active: true },
  id: 'message',
  role: 'status',
  'aria-live': 'polite',
  style: { marginLeft: '4px' },
  leadingVisual: InfoIcon,
  onClick: (event: MouseEvent) => event.preventDefault(),
}
const node = h(InfoIcon, { size: 24 })
// @ts-expect-error Only small and medium are supported.
const size: InlineMessageProps = { size: 'large' }
// @ts-expect-error No info variant is defined; omit variant for InfoIcon.
const variant: InlineMessageProps = { variant: 'info' }
// @ts-expect-error The root is always a div.
const polymorphic: InlineMessageProps = { as: 'span' }
void size
void variant
void polymorphic
</script>

<template>
  <InlineMessage />
  <InlineMessage v-bind="native">Message</InlineMessage>
  <InlineMessage :leading-visual="InfoIcon" />
  <InlineMessage :leading-visual="node" />
  <InlineMessage :leading-visual="null" />
  <InlineMessage leading-visual="Text" />
  <!-- @vue-expect-error Only small and medium are supported. -->
  <InlineMessage size="large" />
  <!-- @vue-expect-error No info variant is defined. -->
  <InlineMessage variant="info" />
</template>
