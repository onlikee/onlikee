<script setup lang="ts" generic="As extends keyof NativeElements | Component = 'a'">
import { computed, shallowRef } from 'vue'
import type { Component, NativeElements } from 'vue'
import { ArrowLeftIcon } from '@onlikee/octicons-vue'
import Link from '../Link/Link.vue'
import type { LinkInstance } from '../Link/types'
import type { ResponsiveValue } from './types'
import { getHiddenDataAttributes, hiddenOnRegularAndWide } from './responsive'

defineOptions({ name: 'PageHeaderParentLink' })
const props = withDefaults(
  defineProps<{
    as?: As
    className?: string
    hidden?: boolean | ResponsiveValue<boolean>
  }>(),
  { as: undefined, className: undefined, hidden: () => hiddenOnRegularAndWide },
)
defineSlots<{ default?: () => unknown }>()
const link = shallowRef<LinkInstance | null>(null)
const element = computed(() => link.value?.element ?? null)
const hiddenAttributes = computed(() => getHiddenDataAttributes(props.hidden))
defineExpose({ element })
</script>

<template>
  <Link
    ref="link"
    :as="as ?? 'a'"
    muted
    :class="[$style.ParentLink, className]"
    data-component="PageHeader.ParentLink"
    v-bind="hiddenAttributes"
    ><ArrowLeftIcon />
    <div><slot /></div
  ></Link>
</template>

<style module src="./PageHeader.module.css" />
