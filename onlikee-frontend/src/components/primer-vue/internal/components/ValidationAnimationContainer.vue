<template>
  <div
    v-if="shouldRender"
    v-bind="attrs"
    :class="className"
    :style="[normalizeReactStyle(attrs.style), { height: show ? 'auto' : 0, overflow: 'hidden' }]"
  >
    <div
      class="validation-animation"
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
watch(() => props.show, (show) => { if (show) shouldRender.value = true }, { flush: 'sync' })
function onAnimationEnd() { if (!props.show) shouldRender.value = false }
</script>
<style scoped>
.validation-animation:where([data-show]) {
  animation: validation-fade-in 170ms cubic-bezier(0.44, 0.74, 0.36, 1);
}
@keyframes validation-fade-in {
  from { opacity: 0; transform: translateY(-100%); }
  to { opacity: 1; transform: translateY(0); }
}
/* 源 ValidationAnimationContainer.module.css:4 的 `@media (prefers-reduced-motion)` 不带值，
   在 reduce 与 no-preference 下都匹配（恒真）→ 动画始终被禁用。这是上游 bug，
   按移植承诺忠实保留（审计 L41），不"修复"为 `: reduce`。 */
@media (prefers-reduced-motion) {
  .validation-animation:where([data-show]) { animation: none; }
}
</style>
