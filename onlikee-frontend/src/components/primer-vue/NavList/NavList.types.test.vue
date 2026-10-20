<script setup lang="ts">
import { defineComponent, h, shallowRef } from 'vue'
import {
  NavList,
  type NavListItemProps,
  type NavListItemInstance,
  type NavListGroupExpandProps,
} from './index'
import { RouterLink } from 'vue-router'
import { Link } from '../Link'

const CustomLink = defineComponent({
  props: { to: { type: String, required: true } },
  setup: (props) => () => h('a', { href: props.to }),
})
const link: NavListItemProps = { href: '/profile', 'aria-current': 'page' }
const custom: NavListItemProps<typeof CustomLink> = { as: CustomLink, to: '/profile' }
const expand: NavListGroupExpandProps = { items: [{ text: 'More', href: '/more' }], pages: 2 }
const itemRef = shallowRef<NavListItemInstance | null>(null)
function focusItem() {
  itemRef.value?.element?.focus()
}
// @ts-expect-error Heading levels are not arbitrary strings.
const invalidCurrent: NavListItemProps = { 'aria-current': 'invalid' }
// @ts-expect-error Custom link requires to.
const invalidCustom: NavListItemProps<typeof CustomLink> = { as: CustomLink }
void invalidCurrent
void invalidCustom
</script>

<template>
  <NavList aria-label="Settings" disable-item-gap>
    <NavList.Heading as="h3" visually-hidden>Settings</NavList.Heading>
    <NavList.Item ref="itemRef" v-bind="link" @click="focusItem">Profile</NavList.Item>
    <NavList.Item v-bind="custom">Custom</NavList.Item>
    <NavList.Item :as="CustomLink" to="/custom">Custom</NavList.Item>
    <NavList.Item :as="RouterLink" to="/router">Router</NavList.Item>
    <NavList.Item :as="Link" href="/composed" inline muted>Composed Link</NavList.Item>
    <NavList.Item as="button" type="button">Button</NavList.Item>
    <NavList.GroupExpand v-bind="expand" />
    <!-- @vue-expect-error Custom link requires to. -->
    <NavList.Item :as="CustomLink" />
    <!-- @vue-expect-error NavList supports only h2/h3 headings. -->
    <NavList.Heading as="h1" />
    <!-- @vue-expect-error defaultOpen must be boolean. -->
    <NavList.Item default-open="invalid" />
    <!-- @vue-expect-error aria-current has a finite value set. -->
    <NavList.Item aria-current="invalid" />
  </NavList>
</template>
