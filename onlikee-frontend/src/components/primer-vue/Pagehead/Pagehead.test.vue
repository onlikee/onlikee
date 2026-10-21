<script setup lang="ts">
import { defineComponent, h } from 'vue'
import Pagehead, { type PageheadProps } from './index'

const props: PageheadProps = { as: 'header', className: 'custom', role: 'banner' }
const CustomRoot = defineComponent({
  setup:
    (_, { slots }) =>
    () =>
      h('section', slots.default?.()),
})
</script>

<template>
  <Pagehead />
  <Pagehead v-bind="props" aria-label="Repository">Title</Pagehead>
  <Pagehead
    as="section"
    :style="{ paddingTop: 8 }"
    @click="(event: MouseEvent) => event.preventDefault()"
  />
  <Pagehead :as="CustomRoot">Custom root</Pagehead>
  <!-- @vue-expect-error className must remain a string. -->
  <Pagehead :class-name="1" />
</template>
