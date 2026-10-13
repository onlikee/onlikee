<script setup lang="ts">
import { defineComponent, h } from 'vue'
import { CircleBadge, type CircleBadgeProps, type CircleBadgeIconProps } from './index'
import { CheckIcon } from '@onlikee/octicons-vue'
const CustomLink = defineComponent({
  props: { destination: { type: String, required: true } },
  setup: (props) => () => h('a', { href: props.destination }),
})
const link: CircleBadgeProps<'a'> = { as: 'a', href: '/badge', variant: 'small' }
const button: CircleBadgeProps<'button'> = { as: 'button', disabled: true, size: 64 }
const custom: CircleBadgeProps<typeof CustomLink> = { as: CustomLink, destination: '/custom' }
const icon: CircleBadgeIconProps = { icon: CheckIcon, size: 24, 'aria-label': 'Check' }
// @ts-expect-error Only the three source variants are allowed.
const invalid: CircleBadgeProps = { variant: 'huge' }
// @ts-expect-error System props are not part of the source API.
const invalidSystem: CircleBadgeProps = { backgroundColor: 'thistle' }
void [invalid, invalidSystem]
</script>

<template>
  <CircleBadge />
  <CircleBadge v-bind="link"><CircleBadge.Icon v-bind="icon" /></CircleBadge>
  <CircleBadge v-bind="button" />
  <CircleBadge v-bind="custom" />
  <!-- @vue-expect-error Custom component required props must be supplied. -->
  <CircleBadge :as="CustomLink" />
  <!-- @vue-expect-error Only the source variants are accepted. -->
  <CircleBadge variant="huge" />
  <!-- @vue-expect-error Icon is required. -->
  <CircleBadge.Icon />
</template>
