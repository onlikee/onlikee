<script setup lang="ts">
import classes from './ActionBar.module.css'
import { useActionBarItem } from './context'
const { setElement, dataOverflowing } = useActionBarItem(() => ({ type: 'divider' }))
</script>

<template>
  <div
    :ref="setElement"
    :class="[classes['action-bar-divider']]"
    data-component="ActionBar.VerticalDivider"
    aria-hidden="true"
    :data-overflowing="dataOverflowing"
  />
</template>
