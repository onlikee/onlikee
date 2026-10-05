<script setup lang="ts">
import { computed, type ComponentPublicInstance } from 'vue'
import VisuallyHidden from '../internal/components/VisuallyHidden.vue'
import KeybindingHint from '../KeybindingHint/KeybindingHint.vue'
import { getAccessibleKeybindingHintString } from '../KeybindingHint/utils'
import { usePlatform } from '../KeybindingHint/platform'
import type { TooltipDirection, TooltipType } from './types'

// Primer React 8c0b708: TooltipV2/Tooltip.tsx:374-423 tooltip <span> 直译（展示层）。
// 由公开 Tooltip.vue（cloneVNode 触发器路径）与 SelectPanelButton.vue（自身按钮即触发器
// 路径）复用，保证两处 DOM 完全一致。
defineOptions({ name: 'TooltipElement', inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    tooltipId: string
    text: string
    type?: TooltipType
    keybindingHints?: string[]
    hasAriaLabel?: boolean
    calculatedDirection: TooltipDirection
    className?: string
    setElement: (element: Element | ComponentPublicInstance | null) => void
  }>(),
  { type: 'description', keybindingHints: () => [], hasAriaLabel: false, className: undefined },
)
defineEmits<{ mouseenter: []; mouseleave: [] }>()
const platform = usePlatform()
const accessibleHintString = computed(() =>
  props.keybindingHints.map(hint => getAccessibleKeybindingHintString(hint, platform)).join(' or '),
)
</script>
<template>
  <!-- React 属性顺序（TooltipV2/Tooltip.tsx:374-388）：className/ref/data-direction/data-component 在前，
       {...rest}（$attrs）居中——可覆盖前四者；role/aria-hidden/handlers/id 固定在后（rest 不能覆盖） -->
  <span
    :class="['primer-tooltip', className]"
    :ref="setElement"
    :data-direction="calculatedDirection"
    data-component="Tooltip"
    v-bind="$attrs"
    :role="type === 'description' ? 'tooltip' : undefined"
    aria-hidden="true"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
    :id="hasAriaLabel || keybindingHints.length === 0 ? tooltipId : undefined"
  >
    <template v-if="keybindingHints.length > 0">
      <span :id="hasAriaLabel ? undefined : tooltipId">{{ text
                                                       }}<!-- Chrome bug workaround：把按键提示排除出 accessible label，改渲染纯文本描述（React :394-401） -->
        <VisuallyHidden>({{ accessibleHintString }})</VisuallyHidden></span>
      <span
        :class="[
          'primer-tooltip__keybinding-hint-container',
          {
            'primer-tooltip__has-text-before': text,
            'primer-tooltip__has-multiple-hints': keybindingHints.length > 1,
          },
        ]"
        aria-hidden="true"
        data-component="Tooltip.KeybindingHintContainer"
      >
        <template
          v-for="(hint, i) in keybindingHints"
          :key="`${i}-${hint}`"
        ><template v-if="i > 0">{{ ' or ' }}</template><KeybindingHint
          :keys="hint"
          format="condensed"
          variant="onEmphasis"
          size="small"
        /></template>
      </span>
    </template>
    <template v-else>{{ text }}</template>
  </span>
</template>
<style src="./Tooltip.css" />
