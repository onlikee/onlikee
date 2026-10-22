<script setup lang="ts">
import { LinkButton } from '../Button'
defineOptions({ name: 'SelectPanelSecondaryActionLink', inheritAttrs: false })
</script>
<template>
  <LinkButton
    v-bind="$attrs"
    variant="invisible"
    block
    data-component="SelectPanel.SecondaryActionLink"
  >
    <slot />
  </LinkButton>
</template>
