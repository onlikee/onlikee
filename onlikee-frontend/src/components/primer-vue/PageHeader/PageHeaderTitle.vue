<script setup lang="ts">
import { computed } from 'vue'
import Heading from '../Heading/Heading.vue'
import type { TitleProps } from './types'
import { getHiddenDataAttributes } from './responsive'

defineOptions({ name: 'PageHeaderTitle' })
const props = withDefaults(defineProps<TitleProps>(), { as: 'h2', hidden: false })
defineSlots<{ default?: () => unknown }>()
const hiddenAttributes = computed(() => getHiddenDataAttributes(props.hidden))
</script>

<template>
  <Heading
    :as="as"
    :class="[$style.Title, className]"
    data-component="PH_Title"
    :data-hidden="hidden"
    v-bind="hiddenAttributes"
    ><slot
  /></Heading>
</template>

<style module src="./PageHeader.module.css" />
