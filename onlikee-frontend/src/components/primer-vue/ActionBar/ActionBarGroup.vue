<script setup lang="ts">
import { provide } from 'vue'
import { actionBarGroupKey, useActionBarItem } from './context'

const { element, setElement, overflowing, dataOverflowing } = useActionBarItem(() => null)
provide(actionBarGroupKey, overflowing)
defineExpose({ element })
</script>

<template>
  <div
    :ref="setElement"
    class="action-bar-group"
    data-component="ActionBar.Group"
    :data-overflowing="dataOverflowing"
  >
    <slot />
  </div>
</template>
