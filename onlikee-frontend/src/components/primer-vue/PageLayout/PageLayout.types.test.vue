<script setup lang="ts">
import { shallowRef } from 'vue'
import {
  PageLayout,
  PageLayoutPane,
  PageLayoutSidebar,
  type PageLayoutProps,
  type PageLayoutPaneProps,
  type PageLayoutSidebarProps,
  type PageLayoutPaneInstance,
} from './index'

const root: PageLayoutProps = { padding: 'condensed', rowGap: 'none', containerWidth: 'large' }
const pane: PageLayoutPaneProps = {
  position: { narrow: 'end', regular: 'start' },
  divider: { narrow: 'filled', regular: 'line' },
  width: { min: '200px', default: '320px', max: '600px' },
  currentWidth: undefined,
  onResizeEnd: (width) => {
    void width
  },
}
const sidebar: PageLayoutSidebarProps = {
  position: 'start',
  responsiveVariant: 'fullscreen',
  resizable: true,
}
const paneRef = shallowRef<PageLayoutPaneInstance | null>(null)
const inferredRef = shallowRef<InstanceType<typeof PageLayoutSidebar> | null>(null)
// @ts-expect-error currentWidth requires onResizeEnd.
const invalidControlled: PageLayoutPaneProps = { currentWidth: 320 }
// @ts-expect-error onResizeEnd requires currentWidth, which may explicitly be undefined.
const invalidCallback: PageLayoutSidebarProps = { onResizeEnd: () => {} }
const invalidWidth: PageLayoutPaneProps = {
  // @ts-expect-error Custom width measurements use pixels.
  width: { min: '10rem', default: '20rem', max: '30rem' },
}
// @ts-expect-error Filled divider is only allowed at the narrow breakpoint.
const invalidDivider: PageLayoutPaneProps = { divider: { regular: 'filled' } }
// @ts-expect-error Sidebar position is not responsive.
const invalidSidebar: PageLayoutSidebarProps = { position: { narrow: 'end' } }
void [invalidControlled, invalidCallback, invalidWidth, invalidDivider, invalidSidebar]
void PageLayout.Header.__SLOT__
</script>
<template>
  <PageLayout v-bind="root">
    <PageLayout.Header :divider="{ narrow: 'filled', regular: 'line' }" aria-label="Header"
      >Header</PageLayout.Header
    >
    <PageLayout.Content as="section" width="medium">Content</PageLayout.Content>
    <PageLayoutPane ref="paneRef" v-bind="pane">Pane</PageLayoutPane>
    <PageLayoutSidebar ref="inferredRef" v-bind="sidebar">Sidebar</PageLayoutSidebar>
    <PageLayout.Footer>Footer</PageLayout.Footer>
  </PageLayout>
  <button
    @click="
      paneRef?.element?.focus()
      inferredRef?.element?.focus()
    "
  >
    Focus regions
  </button>
  <!-- @vue-expect-error Controlled width requires callback. -->
  <PageLayout.Pane :current-width="300" />
  <!-- @vue-expect-error Callback requires explicit currentWidth. -->
  <PageLayout.Sidebar :on-resize-end="() => {}" />
  <!-- @vue-expect-error Sidebar divider is not responsive. -->
  <PageLayout.Sidebar :divider="{ narrow: 'line' }" />
  <!-- @vue-expect-error Unsupported container width. -->
  <PageLayout container-width="small" />
</template>
