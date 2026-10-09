<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'
import Button from '../SelectPanel/SelectPanelButton.vue'
import { exposeElement } from './context'
import { normalizeReactStyle } from '../internal/style'
import type { ActionListGroupHeadingTrailingActionProps } from './types'
defineOptions({
  name: 'ActionListGroupHeadingTrailingAction',
  __SLOT__: Symbol('ActionList.GroupHeading.TrailingAction'),
  inheritAttrs: false,
})
const props = withDefaults(defineProps<ActionListGroupHeadingTrailingActionProps>(), {
  as: 'button',
  tooltipDirection: 'w',
  loading: undefined,
  className: undefined,
  style: undefined,
})
const attrs = useAttrs()
const button = ref<InstanceType<typeof Button> | null>(null)
const element = computed(() => button.value?.element ?? null)
defineExpose(exposeElement(element))
</script>
<template>
  <Button
    ref="button"
    :as="props.as"
    :href="props.href ?? null"
    type="button"
    :icon="icon"
    :loading="loading"
    :aria-label="label"
    variant="invisible"
    size="small"
    :tooltip-direction="tooltipDirection"
    data-component="ActionList.GroupHeading.TrailingAction"
    :class="[className, attrs.class]"
    v-bind="attrs"
    :style="normalizeReactStyle(style ?? attrs.style)"
  />
</template>
