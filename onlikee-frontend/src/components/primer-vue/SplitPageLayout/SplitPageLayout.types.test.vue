<script setup lang="ts">
import { SplitPageLayout } from './index'
</script>

<template>
  <SplitPageLayout>
    <SplitPageLayout.Header :divider="{ narrow: 'filled', regular: 'line' }" />
    <SplitPageLayout.Content as="section" width="large" />
    <SplitPageLayout.Pane :current-width="320" :on-resize-end="(_width: number) => {}" />
    <SplitPageLayout.Sidebar :hidden="{ narrow: true, regular: false }" />
    <!-- @vue-expect-error controlled width requires its update callback -->
    <SplitPageLayout.Pane :current-width="320" />
    <!-- @vue-expect-error unsupported content width -->
    <SplitPageLayout.Content width="small" />
  </SplitPageLayout>
</template>
