<script setup lang="ts">
import { useActionBarItem } from './context'
const { setElement, dataOverflowing } = useActionBarItem(() => ({ type: 'divider' }))
</script>

<template>
  <div
    :ref="setElement"
    class="action-bar-divider"
    data-component="ActionBar.VerticalDivider"
    aria-hidden="true"
    :data-overflowing="dataOverflowing"
  />
</template>
