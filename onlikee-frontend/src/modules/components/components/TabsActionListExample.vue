<script setup lang="ts">
/* eslint-disable vue/one-component-per-file -- Custom tab/list hosts demonstrate the headless Tabs API. */
import { defineComponent, h, shallowRef } from 'vue'
import { ActionList } from '@/components/primer-vue/ActionList'
import { Tabs, useTab, useTabList, useTabPanel } from '@/components/primer-vue/Tabs'

const selected = shallowRef('one')
const CustomTabList = defineComponent({
  setup(_, { slots }) {
    const { tabListProps } = useTabList<HTMLUListElement>({
      'aria-label': 'Sections',
      'aria-orientation': 'vertical',
    })
    return () => h(ActionList, tabListProps.value, slots)
  },
})
const CustomTab = defineComponent({
  props: { value: { type: String, required: true }, disabled: Boolean },
  setup(props, { slots }) {
    const { tabProps } = useTab(() => props)
    return () =>
      h(ActionList.Item, { ...tabProps.value, active: tabProps.value['aria-selected'] }, slots)
  },
})
const CustomPanel = defineComponent({
  props: { value: { type: String, required: true } },
  setup(props, { slots }) {
    const { tabPanelProps } = useTabPanel(() => props)
    return () => h('div', tabPanelProps.value, slots.default?.())
  },
})
</script>

<template>
  <div style="display: grid; grid-template-columns: 180px 1fr; gap: 16px; width: 100%">
    <Tabs :value="selected" @value-change="({ value }) => (selected = value)">
      <CustomTabList>
        <CustomTab value="one">One</CustomTab>
        <CustomTab value="two">Two</CustomTab>
        <CustomTab value="three">Three</CustomTab>
        <CustomTab value="four" disabled>Four</CustomTab>
      </CustomTabList>
      <CustomPanel value="one">Panel one</CustomPanel>
      <CustomPanel value="two">Panel two</CustomPanel>
      <CustomPanel value="three">Panel three</CustomPanel>
      <CustomPanel value="four">Panel four</CustomPanel>
    </Tabs>
  </div>
</template>
