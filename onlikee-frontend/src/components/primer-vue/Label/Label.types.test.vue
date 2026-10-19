<script setup lang="ts">
import { defineComponent, h, shallowRef } from 'vue'
import { Label, type LabelInstance, type LabelProps } from './index'

const CustomLabel = defineComponent({
  props: { to: { type: String, required: true } },
  setup: (props) => () => h('a', { href: props.to }),
})
const props: LabelProps<'a'> = { as: 'a', href: '/labels', variant: 'accent', size: 'large' }
const instance = shallowRef<LabelInstance | null>(null)
function focusLabel() {
  const target = instance.value?.element
  if (target instanceof HTMLElement) target.focus()
}
// @ts-expect-error The default span does not accept href.
const invalidSpan: LabelProps = { href: '/labels' }
// @ts-expect-error Custom component required props must be supplied.
const invalidCustom: LabelProps<typeof CustomLabel> = { as: CustomLabel }
void invalidSpan
void invalidCustom
</script>

<template>
  <Label ref="instance" @click="focusLabel">Public</Label>
  <Label v-bind="props">Link</Label>
  <Label as="button" type="button" disabled>Button</Label>
  <Label :as="CustomLabel" to="/labels">Custom</Label>
  <Label as="svg" viewBox="0 0 16 16" />
  <!-- @vue-expect-error The default span does not accept href. -->
  <Label href="/labels" />
  <!-- @vue-expect-error Anchors do not accept disabled. -->
  <Label as="a" disabled />
  <!-- @vue-expect-error Custom component required props must be supplied. -->
  <Label :as="CustomLabel" />
  <!-- @vue-expect-error Custom component props retain their declared types. -->
  <Label :as="CustomLabel" :to="7" />
  <!-- @vue-expect-error Only small and large sizes are supported. -->
  <Label size="medium" />
  <!-- @vue-expect-error Only documented color variants are supported. -->
  <Label variant="warning" />
</template>
