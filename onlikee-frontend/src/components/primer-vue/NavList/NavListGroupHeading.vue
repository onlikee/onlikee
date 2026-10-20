<script setup lang="ts">
import { useAttrs } from 'vue'
import { ActionList } from '../ActionList'
import GroupHeading from '../ActionList/ActionListGroupHeading.vue'
import { useGroupHeadingTag } from './context'
import type { NavListGroupHeadingProps } from './types'

defineOptions({ name: 'NavListGroupHeading', inheritAttrs: false, __SLOT__: GroupHeading.__SLOT__ })
defineProps<NavListGroupHeadingProps>()
const attrs = useAttrs()
const groupHeadingTag = useGroupHeadingTag()
</script>

<template>
  <ActionList.GroupHeading
    :as="as ?? groupHeadingTag()"
    :class-name="[$style.GroupHeading, className].filter(Boolean).join(' ')"
    data-component="NavList.GroupHeading"
    :heading-wrap-element="headingWrapElement ?? 'li'"
    :variant="variant"
    :auxiliary-text="auxiliaryText"
    :internal-backward-compatible-title="internalBackwardCompatibleTitle"
    v-bind="attrs"
    ><slot
  /></ActionList.GroupHeading>
</template>

<style module src="./NavList.module.css" />
