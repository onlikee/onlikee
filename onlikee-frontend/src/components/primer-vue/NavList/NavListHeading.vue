<script setup lang="ts">
import { useAttrs, useCssModule } from 'vue'
import Heading from '../Heading/Heading.vue'
import type { NavListHeadingProps } from './types'
import '../internal/components/VisuallyHidden.module.css'

defineOptions({ name: 'NavListHeading', inheritAttrs: false, __SLOT__: Symbol('NavList.Heading') })
withDefaults(defineProps<NavListHeadingProps>(), { as: 'h2', visuallyHidden: false })
const attrs = useAttrs()
const classes = useCssModule()
</script>

<template>
  <Heading
    :as="as"
    variant="small"
    :class="[visuallyHidden ? 'internal-visually-hidden' : classes.Heading, className, attrs.class]"
    data-component="NavList.Heading"
    v-bind="attrs"
    ><slot
  /></Heading>
</template>

<style module src="./NavList.module.css" />
