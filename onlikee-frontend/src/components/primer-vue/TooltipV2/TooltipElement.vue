<script setup lang="ts">
import { computed, type ComponentPublicInstance } from 'vue'
import VisuallyHidden from '../internal/components/VisuallyHidden.vue'
import KeybindingHint from '../KeybindingHint/KeybindingHint.vue'
import { getAccessibleKeybindingHintString } from '../KeybindingHint/utils'
import { usePlatform } from '../KeybindingHint/platform'
import type { TooltipDirection, TooltipType } from './types'

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
  <span
    :class="[$style['primer-tooltip'], className]"
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
                                                       }}<!-- 将按键提示从无障碍标签中排除，使用纯文本描述。 -->
        <VisuallyHidden>({{ accessibleHintString }})</VisuallyHidden></span>
      <span
        :class="[
          $style['primer-tooltip__keybinding-hint-container'],
          {
            [$style['primer-tooltip__has-text-before']]: text,
            [$style['primer-tooltip__has-multiple-hints']]: keybindingHints.length > 1,
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
<style module src="./Tooltip.module.css" />
