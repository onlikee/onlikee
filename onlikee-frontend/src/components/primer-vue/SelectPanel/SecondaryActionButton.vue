<script setup lang="ts">
import { Button } from '../Button'
defineOptions({ name: 'SelectPanelSecondaryActionButton', inheritAttrs: false })
</script>
<template>
  <Button block data-component="SelectPanel.SecondaryActionButton" v-bind="$attrs">
    <slot />
  </Button>
</template>
