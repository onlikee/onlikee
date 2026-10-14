<script setup lang="ts">
import { shallowRef } from 'vue'
import { CounterLabel, type CounterLabelInstance, type CounterLabelProps } from './index'

const counter = shallowRef<CounterLabelInstance | null>(null)
const native: CounterLabelProps = {
  variant: 'primary',
  scheme: 'secondary',
  className: 'counter',
  class: { selected: true },
  'data-component': 'IssueCounter',
  'aria-hidden': true,
  id: 'count',
  style: { marginLeft: '4px' },
  onClick: (event: MouseEvent) => event.preventDefault(),
}
function focus(event: MouseEvent) {
  event.preventDefault()
  const element: HTMLSpanElement | null | undefined = counter.value?.element
  element?.focus()
}
// @ts-expect-error System props are not part of the source API.
const system: CounterLabelProps = { backgroundColor: 'whitesmoke' }
// @ts-expect-error The root is always a span.
const polymorphic: CounterLabelProps = { as: 'button' }
// @ts-expect-error Use the native data-component attribute.
const camelCase: CounterLabelProps = { dataComponent: 'IssueCounter' }
// @ts-expect-error Only primary and secondary variants are supported.
const variant: CounterLabelProps = { variant: 'danger' }
void system
void polymorphic
void camelCase
void variant
</script>

<template>
  <CounterLabel />
  <CounterLabel ref="counter" v-bind="native" tabindex="0" @click="focus">5</CounterLabel>
  <CounterLabel variant="secondary" data-component="CustomCounter">12K</CounterLabel>
  <!-- @vue-expect-error Only primary and secondary variants are supported. -->
  <CounterLabel variant="danger" />
</template>
