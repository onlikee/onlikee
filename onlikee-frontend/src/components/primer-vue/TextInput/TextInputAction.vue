<script setup lang="ts">
import { computed, onMounted, ref, useAttrs, useSlots, type Component, useCssModule } from 'vue'
import Button from '../Button/Button.vue'
import SelectPanelButton from '../SelectPanel/SelectPanelButton.vue'
import Tooltip from '../TooltipV2/Tooltip.vue'
import type { TextInputActionOptions } from './types'

defineOptions({ inheritAttrs: false })
const styles = useCssModule()
const props = withDefaults(defineProps<TextInputActionOptions>(), {
  variant: 'invisible',
  tooltipDirection: undefined,
  icon: undefined,
  className: undefined,
})
const attrs = useAttrs()
const slots = useSlots()
const buttonRef = ref<{ element?: HTMLElement | null } | null>(null)

const ariaLabel = computed(() => attrs['aria-label'] as string | undefined)
const hasChildren = computed(() => Boolean(slots.default))
const iconComponent = computed(() => props.icon as Component | undefined)
const useIconButton = computed(() =>
  Boolean(iconComponent.value && !hasChildren.value && ariaLabel.value),
)

const restAttrs = computed(() => {
  const { 'aria-label': _label, 'aria-labelledby': _labelledBy, ...rest } = attrs
  return rest
})
const accessibleLabel = computed<Record<string, unknown>>(() => {
  if (ariaLabel.value) return { 'aria-label': ariaLabel.value }
  if (attrs['aria-labelledby']) return { 'aria-labelledby': attrs['aria-labelledby'] }
  return { 'aria-label': '' }
})
const buttonBindings = computed(() => ({ ...restAttrs.value, ...accessibleLabel.value }))
const buttonClassName = computed(
  () =>
    [
      props.variant === 'invisible' ? styles['text-input-action-invisible'] : undefined,
      props.className,
    ]
      .filter(Boolean)
      .join(' ') || undefined,
)

onMounted(() => {
  if (
    import.meta.env.DEV &&
    ((props.icon && !ariaLabel.value) || (!hasChildren.value && !ariaLabel.value))
  ) {
    console.warn(
      'Use the `aria-label` prop to provide an accessible label for assistive technology',
    )
  }
})

const element = computed<HTMLElement | null>(() => {
  const instance = buttonRef.value as { element?: HTMLElement | null; $el?: HTMLElement } | null
  return instance?.element ?? instance?.$el ?? null
})
defineExpose({
  element,
  focus: (options?: FocusOptions) => element.value?.focus(options),
  blur: () => element.value?.blur(),
})
</script>

<template>
  <span
    :class="['TextInput-action', $style['text-input-action']]"
    data-component="TextInput.Action"
  >
    <SelectPanelButton
      v-if="useIconButton"
      ref="buttonRef"
      :icon="iconComponent"
      :variant="variant"
      :tooltip-direction="tooltipDirection ?? 's'"
      size="small"
      type="button"
      :class-name="buttonClassName"
      v-bind="buttonBindings"
    />
    <template v-else>
      <Tooltip
        v-if="ariaLabel"
        :text="ariaLabel"
        :direction="tooltipDirection"
        :class-name="$style['text-input-action-conditional-tooltip']"
      >
        <Button
          ref="buttonRef"
          :variant="variant"
          type="button"
          :class="buttonClassName"
          v-bind="restAttrs"
        >
          <slot />
        </Button>
      </Tooltip>
      <Button
        v-else
        ref="buttonRef"
        :variant="variant"
        type="button"
        :class="buttonClassName"
        v-bind="restAttrs"
      >
        <slot />
      </Button>
    </template>
  </span>
</template>
<style module src="./TextInputAction.module.css" />
