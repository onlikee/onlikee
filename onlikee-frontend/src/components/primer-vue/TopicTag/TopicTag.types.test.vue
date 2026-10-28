<script setup lang="ts">
import { defineComponent, h, shallowRef } from 'vue'
import { RouterLink } from 'vue-router'
import {
  TopicTag,
  type TopicTagProps,
  type TopicTagGroupProps,
  type TopicTagInstance,
} from './index'
import { Link } from '../Link'

const CustomTopic = defineComponent({
  props: { destination: { type: String, required: true } },
  setup: (props) => () => h('a', { href: props.destination }),
})
const anchor: TopicTagProps = { href: '/topics/react', target: '_blank' }
const button: TopicTagProps<'button'> = { as: 'button', type: 'button', disabled: true }
const group: TopicTagGroupProps = { className: 'topics', role: 'group', 'aria-label': 'Topics' }
const buttonRef = shallowRef<TopicTagInstance<'button'> | null>(null)
function activate(event: MouseEvent) {
  event.preventDefault()
  const disabled: boolean | undefined = buttonRef.value?.element?.disabled
  void disabled
}
// @ts-expect-error Buttons do not accept anchor-only attributes.
const invalidButton: TopicTagProps<'button'> = { as: 'button', href: '/invalid' }
// @ts-expect-error Custom component required props must be supplied.
const invalidCustom: TopicTagProps<typeof CustomTopic> = { as: CustomTopic }
// @ts-expect-error Group does not support polymorphism.
const invalidGroup: TopicTagGroupProps = { as: 'section' }
void invalidButton
void invalidCustom
void invalidGroup
</script>

<template>
  <TopicTag.Group v-bind="group">
    <TopicTag />
    <TopicTag v-bind="anchor">react</TopicTag>
    <TopicTag ref="buttonRef" v-bind="button" @click="activate">vue</TopicTag>
    <TopicTag as="span">static</TopicTag>
    <TopicTag :as="Link" href="/topics/react">Link</TopicTag>
    <TopicTag :as="RouterLink" to="/topics/react">RouterLink</TopicTag>
    <TopicTag :as="CustomTopic" destination="/topics/custom">custom</TopicTag>
  </TopicTag.Group>
  <!-- @vue-expect-error Buttons reject href. -->
  <TopicTag as="button" href="/invalid" />
  <!-- @vue-expect-error Custom component required props must be supplied. -->
  <TopicTag :as="CustomTopic" />
  <!-- @vue-expect-error RouterLink requires to. -->
  <TopicTag :as="RouterLink" />
</template>
