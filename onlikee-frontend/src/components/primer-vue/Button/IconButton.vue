<script setup lang="ts">
import { computed, getCurrentInstance, inject, shallowRef, useAttrs } from 'vue'
import ButtonBase from './ButtonBase.vue'
import Tooltip from '../TooltipV2/Tooltip.vue'
import { TOOLTIP_CONTEXT_KEY } from '../TooltipV2/TooltipContext'
import { TOOLTIP_CONTEXT_KEY as TOOLTIP_V1_CONTEXT_KEY } from '../Tooltip/TooltipContext'
import classes from './ButtonBase.module.css'
import type { IconButtonComponentProps, ButtonInstance } from './types'

defineOptions({ name: 'IconButton', inheritAttrs: false })
const props = withDefaults(defineProps<IconButtonComponentProps>(), {
  loading: undefined,
  inactive: undefined,
  labelWrap: undefined,
  unsafeDisableTooltip: false,
})
const attrs = useAttrs()
const instance = getCurrentInstance()!
const normalizedProps = props as typeof props & { ariaLabel?: string; ariaLabelledby?: string }
const tooltipContext = inject(TOOLTIP_CONTEXT_KEY, undefined)
const tooltipContextV1 = inject(TOOLTIP_V1_CONTEXT_KEY, undefined)
const withoutTooltip = computed(
  () =>
    props.unsafeDisableTooltip ||
    props.disabled ||
    normalizedProps.ariaLabel === undefined ||
    normalizedProps.ariaLabel === '' ||
    Boolean(tooltipContext?.tooltipId || tooltipContextV1?.tooltipId),
)
function hasActivePopup() {
  return (
    (attrs['aria-expanded'] === true || attrs['aria-expanded'] === 'true') &&
    attrs['aria-haspopup'] === 'true'
  )
}
function bindings(withTooltip: boolean) {
  const {
    ariaLabel,
    ariaLabelledby,
    'aria-label': _ariaLabel,
    'aria-labelledby': _ariaLabelledby,
    description: _description,
    tooltipDirection: _direction,
    unsafeDisableTooltip: _unsafeDisableTooltip,
    disabled,
    keyshortcuts,
    keybindingHint: _keybindingHint,
    className,
    type,
    ...rest
  } = normalizedProps
  return {
    'data-component': 'IconButton',
    type: instance.vnode.props && 'type' in instance.vnode.props ? type : 'button',
    ...(withTooltip ? { 'aria-keyshortcuts': keyshortcuts ?? undefined } : {}),
    'aria-label': withTooltip && !props.description ? undefined : ariaLabel,
    'aria-labelledby': ariaLabelledby,
    ...rest,
    ...attrs,
    ...(!withTooltip
      ? {
          disabled: instance.vnode.props?.disabled === undefined ? undefined : disabled,
        }
      : {}),
    className: [className, classes.IconButton].filter(Boolean).join(' '),
  }
}
const button = shallowRef<ButtonInstance | null>(null)
const element = computed(() => button.value?.element ?? null)
defineExpose({
  element,
  focus: (options?: FocusOptions) => element.value?.focus(options),
  blur: () => element.value?.blur(),
})
</script>

<template>
  <ButtonBase v-if="withoutTooltip" v-bind="bindings(false)" ref="button" />
  <Tooltip
    v-else
    :text="description ?? normalizedProps.ariaLabel ?? ''"
    :type="description ? undefined : 'label'"
    :direction="tooltipDirection"
    :keybinding-hint="keybindingHint ?? keyshortcuts"
    :private-disable-tooltip="hasActivePopup()"
  >
    <ButtonBase v-bind="bindings(true)" ref="button" />
  </Tooltip>
</template>
