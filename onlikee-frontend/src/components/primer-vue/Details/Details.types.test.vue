<script setup lang="ts">
import { defineComponent, h, shallowRef } from 'vue'
import { Details, Summary, useDetails, type DetailsProps, type SummaryProps } from './index'
import { Button } from '../Button'

const CustomSummary = defineComponent({
  props: { as: { type: String, default: 'button' }, label: { type: String, required: true } },
  setup: (props) => () => h(props.as ?? 'button', props.label),
})
const element = shallowRef<HTMLDetailsElement | null>(null)
const { getDetailsProps, open, setOpen } = useDetails({
  ref: element,
  closeOnOutsideClick: true,
  defaultOpen: true,
  onClickOutside: (event) => event.preventDefault(),
})
const native: DetailsProps = { open: true, name: 'accordion', onToggle: () => {} }
const summary: SummaryProps = { className: 'custom', onClick: () => {} }
// @ts-expect-error Details accepts native attributes, not system props.
const invalid: DetailsProps = { backgroundColor: 'thistle' }
// @ts-expect-error The default summary is not an anchor.
const invalidSummary: SummaryProps = { href: '/details' }
void invalid
void invalidSummary
setOpen((previous) => !previous)
</script>

<template>
  <Details />
  <Details v-bind="native"><summary>Native summary</summary></Details>
  <Details v-bind="getDetailsProps()">
    <Details.Summary :as="Button" variant="primary">{{ open ? 'Open' : 'Closed' }}</Details.Summary>
    <Button @click="setOpen(false)">Close</Button>
  </Details>
  <Summary v-bind="summary" />
  <Summary :as="CustomSummary" label="Custom summary" />
  <!-- @vue-expect-error Custom summaries require their own props. -->
  <Summary :as="CustomSummary" />
  <!-- @vue-expect-error The root must be a native tag or a Vue component. -->
  <Summary :as="17" />
</template>
