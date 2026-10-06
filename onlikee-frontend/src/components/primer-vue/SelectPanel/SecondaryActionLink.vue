<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import Button from './SelectPanelButton.vue'
defineOptions({ name: 'SelectPanelSecondaryActionLink', inheritAttrs: false })
const attrs = useAttrs()
const resolvedAs = computed(() => (attrs.as as string | undefined) ?? 'a')
</script>
<template>
  <Button
    v-bind="$attrs"
    :as="resolvedAs"
    variant="invisible"
    block
    data-component="SelectPanel.SecondaryActionLink"
  >
    <slot />
  </Button>
</template>
