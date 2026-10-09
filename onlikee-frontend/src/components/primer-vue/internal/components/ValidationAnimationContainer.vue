<template>
  <div
    v-if="shouldRender"
    v-bind="attrs"
    :class="className"
    :style="[normalizeReactStyle(attrs.style), { height: show ? 'auto' : 0, overflow: 'hidden' }]"
  >
    <div
      :class="[$style['validation-animation']]"
      :data-show="show ? '' : undefined"
      @animationend="onAnimationEnd"
    >
      <slot />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, useAttrs, watch } from 'vue'
import { normalizeReactStyle } from '../style'
defineOptions({ inheritAttrs: false })
const props = defineProps<{ show?: boolean; className?: string }>()
const attrs = useAttrs()
const shouldRender = ref(Boolean(props.show))
watch(
  () => props.show,
  (show) => {
    if (show) shouldRender.value = true
  },
  { flush: 'sync' },
)
function onAnimationEnd() {
  if (!props.show) shouldRender.value = false
}
</script>
<style module src="./ValidationAnimationContainer.module.css"></style>
