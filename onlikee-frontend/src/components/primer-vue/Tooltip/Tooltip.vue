<template>
  <div :class="[$style['tooltip-wrapper']]" @mouseenter="show" @mouseleave="hide">
    <!-- 触发元素插槽 -->
    <slot />

    <!-- Tooltip 内容 -->
    <div
      v-if="visible"
      :id="tooltipId"
      role="tooltip"
      :class="[$style['tooltip'], $style[`tooltip--${placement}`]]"
    >
      <div>
        {{ content }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { provide, ref, useId } from 'vue'
import { TOOLTIP_CONTEXT_KEY } from './TooltipContext'

interface Props {
  /** Tooltip 显示的内容 */
  content: string
  /** Tooltip 显示位置 */
  placement?:
    'top' | 'bottom' | 'left' | 'right' | 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom'
  /** 延迟显示时间（毫秒） */
  showDelay?: number
  /** 延迟隐藏时间（毫秒） */
  hideDelay?: number
  /** 是否禁用 */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'top',
  showDelay: 0,
  hideDelay: 0,
  disabled: false,
})

const tooltipId = useId()
provide(TOOLTIP_CONTEXT_KEY, { tooltipId })
const visible = ref(false)
let showTimer: number | undefined
let hideTimer: number | undefined

function show() {
  if (props.disabled) return

  clearTimeout(hideTimer)

  if (props.showDelay > 0) {
    showTimer = window.setTimeout(() => {
      visible.value = true
    }, props.showDelay)
  } else {
    visible.value = true
  }
}

function hide() {
  clearTimeout(showTimer)

  if (props.hideDelay > 0) {
    hideTimer = window.setTimeout(() => {
      visible.value = false
    }, props.hideDelay)
  } else {
    visible.value = false
  }
}
</script>

<style module src="./Tooltip.module.css"></style>
