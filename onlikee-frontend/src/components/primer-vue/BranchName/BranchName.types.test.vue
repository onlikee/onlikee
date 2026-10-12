<script setup lang="ts">
import { defineComponent, h, shallowRef } from 'vue'
import { BranchName, type BranchNameInstance, type BranchNameProps } from './index'

const CustomBranch = defineComponent({
  props: { to: { type: String, required: true } },
  setup: (props) => () => h('a', { href: props.to }),
})
const anchor: BranchNameProps = { href: '/main', target: 'named-window' }
const button: BranchNameProps<'button'> = { as: 'button', type: 'button', disabled: true }
const custom: BranchNameProps<typeof CustomBranch> = { as: CustomBranch, to: '/custom' }
const anchorRef = shallowRef<BranchNameInstance | null>(null)
const buttonRef = shallowRef<BranchNameInstance<'button'> | null>(null)
function focusBranch(event: MouseEvent) {
  event.preventDefault()
  anchorRef.value?.element?.focus()
  const disabled: boolean | undefined = buttonRef.value?.element?.disabled
  void disabled
}
// @ts-expect-error Native buttons do not accept href.
const invalidButton: BranchNameProps<'button'> = { as: 'button', href: '/invalid' }
// @ts-expect-error System style props are not part of the source API.
const invalidSystem: BranchNameProps = { backgroundColor: 'thistle' }
// @ts-expect-error Custom component required props must be supplied.
const invalidCustom: BranchNameProps<typeof CustomBranch> = { as: CustomBranch }
void invalidButton
void invalidSystem
void invalidCustom
</script>

<template>
  <BranchName />
  <BranchName ref="anchorRef" v-bind="anchor" @click="focusBranch">main</BranchName>
  <BranchName ref="buttonRef" v-bind="button">button</BranchName>
  <BranchName v-bind="custom">custom</BranchName>
  <BranchName as="span">main</BranchName>
  <BranchName as="button" type="button">main</BranchName>
  <BranchName :as="CustomBranch" to="/custom">custom</BranchName>
  <!-- @vue-expect-error Custom component required props must be supplied. -->
  <BranchName :as="CustomBranch" />
  <!-- @vue-expect-error The root must be a native tag or component. -->
  <BranchName :as="17" />
</template>
