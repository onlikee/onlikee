<script setup lang="ts">
import { Link } from '../Link'

defineOptions({ name: 'BlankslateSecondaryAction', inheritAttrs: false })
defineProps<{ href: string }>()
defineSlots<{ default?: () => unknown }>()
</script>

<template>
  <div :class="['Blankslate-Action', $style.Action]" data-component="Blankslate.SecondaryAction">
    <Link :href="href"><slot /></Link>
  </div>
</template>

<style module src="./Blankslate.module.css" />
