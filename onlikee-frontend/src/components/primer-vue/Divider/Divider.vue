<template>
  <hr
    :class="[$style['divider'], { [$style['divider--vertical']]: direction === 'vertical' }]"
    :style="direction === 'vertical' ? (height ? { height } : undefined) : (width ? { width } : undefined)"
  >
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  direction?: 'horizontal' | 'vertical'
  height?: string
  width?: string
}>(), {
  direction: 'horizontal',
  height: '',
  width: '',
})
</script>

<style module src="./Divider.module.css"></style>
