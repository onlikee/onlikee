<script setup lang="ts">
import { defineComponent, h, shallowRef } from 'vue'
import { FileIcon } from '@onlikee/octicons-vue'
import { RouterLink } from 'vue-router'
import {
  TreeView,
  type TreeViewItemProps,
  type TreeViewItemInstance,
  type TreeViewProps,
  type TreeViewSubTreeProps,
} from './index'
import { Link } from '../Link'

const CustomItem = defineComponent({
  props: { destination: { type: String, required: true } },
  setup: (props) => () => h('a', { href: props.destination }),
})
const root: TreeViewProps = { 'aria-label': 'Files', truncate: false, flat: true }
const item: TreeViewItemProps = {
  id: 'item',
  defaultExpanded: true,
  expanded: null,
  onSelect: (event) => {
    event.preventDefault()
    const element = itemRef.value?.element
    if (element instanceof HTMLElement) element.focus()
  },
}
const anchor: TreeViewItemProps<'a'> = { as: 'a', id: 'anchor', href: '#file' }
const subtree: TreeViewSubTreeProps = { state: 'loading', count: 3, 'aria-label': 'Files' }
const itemRef = shallowRef<TreeViewItemInstance | null>(null)
// @ts-expect-error Item id is required.
const missingId: TreeViewItemProps = { current: true }
// @ts-expect-error Custom component required props must be supplied.
const missingDestination: TreeViewItemProps<typeof CustomItem> = { as: CustomItem, id: 'custom' }
// @ts-expect-error SubTree state is a closed union.
const invalidState: TreeViewSubTreeProps = { state: 'pending' }
// @ts-expect-error Root does not support polymorphism.
const invalidRoot: TreeViewProps = { as: 'nav' }
void missingId
void missingDestination
void invalidState
void invalidRoot
</script>
<template>
  <TreeView v-bind="root">
    <TreeView.Item ref="itemRef" v-bind="item">
      <TreeView.LeadingVisual v-slot="{ isExpanded }" label="Directory"
        >{{ isExpanded ? 'open' : 'closed' }}<TreeView.DirectoryIcon
      /></TreeView.LeadingVisual>
      <TreeView.LeadingAction v-slot="{ isExpanded }">{{ isExpanded }}</TreeView.LeadingAction>
      src
      <TreeView.TrailingVisual label="File"><FileIcon /></TreeView.TrailingVisual>
      <TreeView.SubTree v-bind="subtree">
        <TreeView.Item v-bind="anchor">file</TreeView.Item>
        <TreeView.Item id="custom" :as="CustomItem" destination="#custom">custom</TreeView.Item>
        <TreeView.Item id="route" :as="RouterLink" to="/files">route</TreeView.Item>
        <TreeView.Item id="link" :as="Link" href="#link">link</TreeView.Item>
      </TreeView.SubTree>
    </TreeView.Item>
    <TreeView.Item
      id="actions"
      :secondary-actions="[{ label: 'Edit', icon: FileIcon, onClick: () => {} }]"
    />
    <TreeView.ErrorDialog @retry="() => {}" @dismiss="() => {}">Failed</TreeView.ErrorDialog>
  </TreeView>
  <!-- @vue-expect-error Item id is required. -->
  <TreeView.Item />
  <!-- @vue-expect-error Custom component required props must be supplied. -->
  <TreeView.Item id="invalid" :as="CustomItem" />
  <!-- @vue-expect-error RouterLink requires to. -->
  <TreeView.Item id="invalid-route" :as="RouterLink" />
  <!-- @vue-expect-error Invalid subtree state. -->
  <TreeView.SubTree state="pending" />
</template>
