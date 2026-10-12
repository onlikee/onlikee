<script setup lang="ts">
import { defineComponent, h, shallowRef } from 'vue'
import { ButtonGroup, type ButtonGroupInstance, type ButtonGroupProps } from './index'

const ownProps: ButtonGroupProps = { role: 'toolbar', className: 'custom' }
const group = shallowRef<ButtonGroupInstance | null>(null)
void group.value
const Root = defineComponent({
  props: { label: { type: String, required: true } },
  setup: (props) => () => h('section', { 'aria-label': props.label }),
})
// @ts-expect-error The source own props do not include orientation.
const invalidProps: ButtonGroupProps = { orientation: 'vertical' }
void invalidProps
</script>

<template>
  <ButtonGroup ref="group" v-bind="ownProps" aria-label="Actions"><button>A</button></ButtonGroup>
  <ButtonGroup id="section" as="section"><button>A</button></ButtonGroup>
  <ButtonGroup :as="Root" label="Custom" />
  <!-- @vue-expect-error Custom root required props must be supplied. -->
  <ButtonGroup :as="Root" />
  <!-- @vue-expect-error Role is a string. -->
  <ButtonGroup :role="17" />
  <!-- @vue-expect-error The root must be a native element or component. -->
  <ButtonGroup :as="17" />
</template>
