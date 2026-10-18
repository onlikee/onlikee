<script setup lang="ts">
import { defineComponent, h, shallowRef } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Header,
  HeaderItem,
  HeaderLink,
  type HeaderProps,
  type HeaderItemProps,
  type HeaderLinkProps,
  type HeaderInstance,
  type HeaderItemInstance,
  type HeaderLinkInstance,
} from './index'

const CustomRoot = defineComponent({
  props: { label: { type: String, required: true } },
  setup: (props) => () => h('nav', { 'aria-label': props.label }),
})
const root = shallowRef<HeaderInstance | null>(null)
const item = shallowRef<HeaderItemInstance | null>(null)
const link = shallowRef<HeaderLinkInstance | null>(null)
void root.value
void item.value
void link.value
const rootProps: HeaderProps = { id: 'header', className: 'custom' }
const itemProps: HeaderItemProps = { full: true, title: 'Menu' }
const linkProps: HeaderLinkProps = { href: '#', target: '_blank' }
const routerProps: HeaderLinkProps<typeof RouterLink> = { as: RouterLink, to: '/component/header' }
// @ts-expect-error System props are not part of Header's API.
const invalidRoot: HeaderProps = { backgroundColor: 'red' }
// @ts-expect-error System props are not part of Header.Item's API.
const invalidItem: HeaderItemProps = { backgroundColor: 'red' }
// @ts-expect-error System props are not part of Header.Link's API.
const invalidLink: HeaderLinkProps = { backgroundColor: 'red' }
// @ts-expect-error Custom component required props must be supplied.
const missingProps: HeaderProps<typeof CustomRoot> = { as: CustomRoot }
void invalidRoot
void invalidItem
void invalidLink
void missingProps
</script>

<template>
  <Header />
  <Header ref="root" v-bind="rootProps">
    <Header.Item ref="item" v-bind="itemProps">
      <Header.Link ref="link" v-bind="linkProps">GitHub</Header.Link>
    </Header.Item>
  </Header>
  <Header as="nav" aria-label="Navigation" />
  <Header :as="CustomRoot" label="Custom" />
  <HeaderItem :full="false" />
  <HeaderLink v-bind="routerProps">Router</HeaderLink>
  <Header.Link :as="RouterLink" :to="{ path: '/component/header' }">Header</Header.Link>
  <!-- @vue-expect-error Custom component required props must be supplied. -->
  <Header :as="CustomRoot" />
  <!-- @vue-expect-error Custom component required props must be supplied. -->
  <Header.Link :as="CustomRoot" />
  <!-- @vue-expect-error RouterLink requires a target. -->
  <Header.Link :as="RouterLink" />
  <!-- @vue-expect-error full is a boolean. -->
  <Header.Item full="yes" />
  <!-- @vue-expect-error System props are not part of the source API. -->
  <Header background-color="red" />
  <!-- @vue-expect-error System props are not part of the source API. -->
  <Header.Link background-color="red" />
</template>
