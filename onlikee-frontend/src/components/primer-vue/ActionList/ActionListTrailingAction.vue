<script setup lang="ts">
import classes from './ActionList.module.css'
import { computed, ref, useAttrs } from 'vue'
import Button from '../SelectPanel/SelectPanelButton.vue'
import { exposeElement } from './context'
import { normalizeReactStyle } from '../internal/style'
import type { ActionListTrailingActionProps } from './types'
defineOptions({
  name: 'ActionListTrailingAction',
  __SLOT__: Symbol('ActionList.TrailingAction'),
  inheritAttrs: false,
})
const props = withDefaults(defineProps<ActionListTrailingActionProps>(), {
  as: 'button',
  tooltipDirection: 'w',
  loading: undefined,
  icon: undefined,
  className: undefined,
  style: undefined,
})
const attrs = useAttrs()
const button = ref<InstanceType<typeof Button> | null>(null)
const element = computed(() => button.value?.element ?? null)
defineExpose(exposeElement(element))
</script>
<template>
  <span
    :class="[classes['action-list-trailing-action'], className, attrs.class]"
    data-component="ActionList.TrailingAction"
    :style="normalizeReactStyle(style ?? attrs.style)"
  >
    <Button
      ref="button"
      :as="props.as"
      :href="href ?? null"
      type="button"
      :icon="icon"
      :aria-label="icon ? label : undefined"
      variant="invisible"
      :tooltip-direction="tooltipDirection"
      :loading="loading"
      :data-loading="Boolean(loading)"
      :data-has-label="icon ? undefined : true"
      :class="[classes['action-list-trailing-action-button']]"
      v-bind="
        Object.fromEntries(
          Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style'),
        )
      "
      :unsafe-disable-tooltip="!icon"
      >{{ icon ? undefined : label }}</Button
    >
  </span>
</template>
