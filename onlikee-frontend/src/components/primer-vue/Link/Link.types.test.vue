<script setup lang="ts">
import { defineComponent, h } from 'vue'
import { Link, type LinkInstance, type LinkProps } from './index'
import { shallowRef } from 'vue'

const CustomLink = defineComponent({
  props: { to: { type: String, required: true } },
  setup: (props) => () => h('a', { href: props.to }),
})

const anchorProps: LinkProps = { href: '/anchor', target: 'named-window', muted: true }
const buttonProps: LinkProps<'button'> = { as: 'button', type: 'button', disabled: true }
const customProps: LinkProps<typeof CustomLink> = { as: CustomLink, to: '/custom' }
const linkRef = shallowRef<LinkInstance | null>(null)
function focusLink() {
  linkRef.value?.element?.focus()
}
// @ts-expect-error A native button does not accept href.
const invalidButton: LinkProps<'button'> = { as: 'button', href: '/invalid' }
// @ts-expect-error Removed convenience props are not part of LinkProps.
const invalidProps: LinkProps = { linkText: 'Invalid' }
void invalidButton
void invalidProps
</script>

<template>
  <Link ref="linkRef" @click="focusLink" />
  <Link v-bind="anchorProps">Anchor</Link>
  <Link v-bind="buttonProps">Button</Link>
  <Link v-bind="customProps">Custom</Link>
  <Link as="button" type="button" disabled>Button</Link>
  <Link :as="CustomLink" to="/custom">Custom</Link>
  <Link hover-color="red" class-name="custom" inline muted>Link</Link>
  <!-- @vue-expect-error Selecting a button rejects anchor-only attributes. -->
  <Link as="button" href="/invalid" />
  <!-- @vue-expect-error Custom component required props must be supplied. -->
  <Link :as="CustomLink" />
  <!-- @vue-expect-error Boolean options cannot be arbitrary strings. -->
  <Link muted="invalid" />
  <!-- @vue-expect-error The root must be a tag name or component. -->
  <Link :as="17" />
</template>
