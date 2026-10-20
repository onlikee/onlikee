<script setup lang="ts">
import { defineComponent, h, shallowRef } from 'vue'
import { Overlay, type OverlayProps } from './index'

const options: OverlayProps = {
  returnFocusRef: shallowRef<HTMLElement | null>(null),
  onEscape: (_event: KeyboardEvent) => {},
  onClickOutside: (_event: MouseEvent | TouchEvent) => {},
}
const CustomRoot = defineComponent({
  props: { label: { type: String, required: true } },
  setup: (props) => () => h('section', props.label),
})
</script>

<template>
  <Overlay v-bind="options" width="small" max-height="fit-content" />
  <Overlay v-bind="options" as="button" type="button" />
  <Overlay v-bind="options" :as="CustomRoot" label="Custom" />
  <!-- @vue-expect-error Required callbacks and returnFocusRef. -->
  <Overlay />
  <!-- @vue-expect-error Unsupported size. -->
  <Overlay v-bind="options" width="xsmall" />
  <!-- @vue-expect-error Custom root requires label. -->
  <Overlay v-bind="options" :as="CustomRoot" />
</template>
