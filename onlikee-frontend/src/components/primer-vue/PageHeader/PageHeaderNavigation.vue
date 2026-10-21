<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import type { NavigationProps } from './types'
import { getHiddenDataAttributes } from './responsive'

defineOptions({ name: 'PageHeaderNavigation' })
const props = withDefaults(
  defineProps<
    Omit<NavigationProps, 'aria-label' | 'aria-labelledby'> & {
      ariaLabel?: string
      ariaLabelledby?: string
    }
  >(),
  { as: 'div', hidden: false, ariaLabel: undefined, ariaLabelledby: undefined },
)
defineSlots<{ default?: () => unknown }>()
const hiddenAttributes = computed(() => getHiddenDataAttributes(props.hidden))
watchEffect(() => {
  if (import.meta.env.DEV && props.as === 'nav' && !props.ariaLabel && !props.ariaLabelledby) {
    console.warn(
      'Warning:',
      'Use `aria-label` or `aria-labelledby` prop to provide an accessible label to the `nav` landmark for assistive technology',
    )
  }
})
</script>

<template>
  <component
    :is="as"
    :aria-label="as === 'nav' ? props.ariaLabel : undefined"
    :aria-labelledby="as === 'nav' ? props.ariaLabelledby : undefined"
    :class="[$style.Navigation, className]"
    data-component="PH_Navigation"
    v-bind="hiddenAttributes"
    ><slot
  /></component>
</template>

<style module src="./PageHeader.module.css" />
