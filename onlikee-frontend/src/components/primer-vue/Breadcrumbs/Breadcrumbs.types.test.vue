<script setup lang="ts">
import { defineComponent, h, shallowRef } from 'vue'
import {
  Breadcrumbs,
  BreadcrumbsItem,
  type BreadcrumbsItemInstance,
  type BreadcrumbsItemProps,
} from './index'
const CustomLink = defineComponent({
  props: { destination: { type: String, required: true } },
  setup: (props) => () => h('a', { href: props.destination }),
})
const anchor: BreadcrumbsItemProps = { href: '/home', target: '_blank', selected: true }
const button: BreadcrumbsItemProps<'button'> = { as: 'button', type: 'button', disabled: true }
const custom: BreadcrumbsItemProps<typeof CustomLink> = { as: CustomLink, destination: '/custom' }
const item = shallowRef<BreadcrumbsItemInstance | null>(null)
// @ts-expect-error Native anchors cannot be disabled.
const invalid: BreadcrumbsItemProps = { disabled: true }
void invalid
</script>

<template>
  <Breadcrumbs class-name="custom" :style="{ width: '100%' }" overflow="menu" variant="spacious">
    <BreadcrumbsItem ref="item" v-bind="anchor" @click="item?.element?.focus()" />
    <Breadcrumbs.Item v-bind="button" />
    <BreadcrumbsItem v-bind="custom" />
  </Breadcrumbs>
  <!-- @vue-expect-error Custom component required props must be supplied. -->
  <BreadcrumbsItem :as="CustomLink" />
  <!-- @vue-expect-error Selected is boolean. -->
  <BreadcrumbsItem selected="invalid" />
  <!-- @vue-expect-error Only the three source overflow modes are supported. -->
  <Breadcrumbs overflow="truncate" />
</template>
