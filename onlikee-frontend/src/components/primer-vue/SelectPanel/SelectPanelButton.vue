<script setup lang="ts">
import {
  Comment,
  computed,
  h,
  inject,
  onMounted,
  provide,
  reactive,
  shallowRef,
  useAttrs,
  useId,
  useSlots,
  watchEffect,
  type Component,
  type Slots,
  type VNode,
  useCssModule,
} from 'vue'
import Spinner from '../Spinner/Spinner.vue'
import AriaStatus from '../internal/components/AriaStatus.vue'
import VisuallyHidden from '../VisuallyHidden/VisuallyHidden.vue'
import CounterLabel from '../CounterLabel/CounterLabel.vue'
import { useTooltipController } from '../TooltipV2/useTooltip'
import TooltipElement from '../TooltipV2/TooltipElement.vue'
import { TOOLTIP_CONTEXT_KEY, type TooltipContextValue } from '../TooltipV2/TooltipContext'
import { TOOLTIP_CONTEXT_KEY as TOOLTIP_V1_CONTEXT_KEY } from '../Tooltip/TooltipContext'
import type { TooltipDirection, TooltipType } from '../TooltipV2/types'

defineOptions({ name: 'SelectPanelButton', inheritAttrs: false })
const styles = useCssModule()
const props = withDefaults(
  defineProps<{
    as?: string
    type?: 'button' | 'submit' | 'reset'
    block?: boolean
    variant?: 'default' | 'primary' | 'invisible' | 'danger' | 'link'
    size?: 'small' | 'medium' | 'large'
    alignContent?: 'start' | 'center'
    disabled?: boolean
    loading?: boolean
    loadingAnnouncement?: string
    inactive?: boolean
    labelWrap?: boolean
    className?: string
    id?: string
    leadingVisual?: Component
    trailingVisual?: Component
    trailingAction?: Component
    icon?: Component
    count?: number | string
    notificationIndicator?: 'button' | 'leadingVisual' | 'icon'
    description?: string
    tooltipDirection?: TooltipDirection
    unsafeDisableTooltip?: boolean
    keyshortcuts?: string
    keybindingHint?: string | string[]
  }>(),
  {
    as: 'button',
    type: undefined,
    variant: 'default',
    size: 'medium',
    alignContent: 'center',
    block: false,
    disabled: false,
    loading: undefined,
    loadingAnnouncement: 'Loading',
    inactive: undefined,
    labelWrap: undefined,
    className: undefined,
    id: undefined,
    leadingVisual: undefined,
    trailingVisual: undefined,
    trailingAction: undefined,
    icon: undefined,
    count: undefined,
    notificationIndicator: undefined,
    description: undefined,
    tooltipDirection: undefined,
    unsafeDisableTooltip: false,
    keyshortcuts: undefined,
    keybindingHint: undefined,
  },
)
const attrs = useAttrs(),
  slots = useSlots()
const element = shallowRef<HTMLElement | null>(null),
  tooltipEl = shallowRef<HTMLElement | null>(null)

const uuid = props.id ?? useId()
const labelId = `${uuid}-label`
const loadingAnnouncementId = `${uuid}-loading-announcement`
const tooltipId = useId()

const tooltipContext = inject(TOOLTIP_CONTEXT_KEY, undefined)
const tooltipContextV1 = inject(TOOLTIP_V1_CONTEXT_KEY, undefined)
const hasExternalTooltip = computed(() =>
  Boolean(tooltipContext?.tooltipId || tooltipContextV1?.tooltipId),
)
const ariaLabel = computed(() => attrs['aria-label'] as string | undefined)
const withoutTooltip = computed(
  () =>
    props.unsafeDisableTooltip ||
    props.disabled ||
    ariaLabel.value === undefined ||
    ariaLabel.value === '' ||
    hasExternalTooltip.value,
)
const tooltipEnabled = computed(() => !withoutTooltip.value)
const hasActivePopup = computed(
  () =>
    (attrs['aria-expanded'] === true || attrs['aria-expanded'] === 'true') &&
    attrs['aria-haspopup'] === 'true',
)
const tooltipText = computed(() => props.description ?? ariaLabel.value ?? '')
const tooltipType = computed<TooltipType>(() => (props.description ? 'description' : 'label'))
const tooltipKeybindingHints = computed(() => {
  const hint = props.keybindingHint ?? props.keyshortcuts
  if (hint === undefined) return []
  return Array.isArray(hint) ? hint : [hint]
})

const { calculatedDirection, openTooltip, closeTooltip, makeTriggerHandlers } =
  useTooltipController({
    direction: () => props.tooltipDirection ?? 's',
    delay: () => 'short',
    type: () => tooltipType.value,
    enabled: () => tooltipEnabled.value,
    privateDisableTooltip: () => hasActivePopup.value,
    triggerRef: element,
    tooltipRef: tooltipEl,
  })
function setTooltipEl(node: unknown) {
  tooltipEl.value = node instanceof HTMLElement ? node : null
}
const providedTooltipContext = reactive<TooltipContextValue>({})
provide(TOOLTIP_CONTEXT_KEY, providedTooltipContext)
watchEffect(() => {
  providedTooltipContext.tooltipId = tooltipEnabled.value ? tooltipId : undefined
})

type FocusHandler = (event: FocusEvent) => void
type TouchHandler = (event: TouchEvent) => void
type MouseHandler = (event: MouseEvent) => void
const triggerHandlers = makeTriggerHandlers({
  onBlur: (event) => (attrs.onBlur as FocusHandler | undefined)?.(event),
  onFocus: (event) => (attrs.onFocus as FocusHandler | undefined)?.(event),
  onTouchend: (event) => (attrs.onTouchend as TouchHandler | undefined)?.(event),
  onMouseenter: (event) => (attrs.onMouseenter as MouseHandler | undefined)?.(event),
  onMouseleave: (event) => (attrs.onMouseleave as MouseHandler | undefined)?.(event),
})
const tooltipTriggerListeners = computed(() =>
  withoutTooltip.value
    ? {}
    : {
        blur: triggerHandlers.onBlur,
        focus: triggerHandlers.onFocus,
        touchend: triggerHandlers.onTouchend,
        mouseleave: triggerHandlers.onMouseleave,
        mouseoverCapture: triggerHandlers.onMouseoverCapture,
      },
)

const effectiveType = computed(
  () => props.type ?? (props.icon ? 'button' : props.as === 'a' ? undefined : 'button'),
)

function bindings() {
  if (
    import.meta.env.DEV &&
    props.notificationIndicator === 'leadingVisual' &&
    !props.leadingVisual
  ) {
    console.warn('Button: `notificationIndicator="leadingVisual"` requires a `leadingVisual` prop.')
  }
  const tooltipActive = !withoutTooltip.value
  const {
    onBlur: _onBlur,
    onFocus: _onFocus,
    onTouchend: _onTouchend,
    onMouseleave: _onMouseleave,
    ...restAttrs
  } = attrs as Record<string, unknown>
  const passthrough = tooltipActive ? restAttrs : attrs
  const ariaLabelledBy =
    tooltipActive && tooltipType.value === 'label'
      ? props.loading
        ? `${labelId} ${tooltipId}`
        : tooltipId
      : props.loading
        ? [labelId, attrs['aria-labelledby']].filter(Boolean).join(' ')
        : attrs['aria-labelledby']
  const existingDescribedBy = attrs['aria-describedby'] as string | undefined
  const describedByBase =
    tooltipActive && tooltipType.value === 'description'
      ? existingDescribedBy
        ? `${existingDescribedBy} ${tooltipId}`
        : tooltipId
      : existingDescribedBy
  const ariaDescribedBy =
    [props.loading ? loadingAnnouncementId : undefined, describedByBase]
      .filter(Boolean)
      .join(' ') || undefined
  return {
    'aria-disabled': props.loading ? true : undefined,
    'data-component': props.icon ? 'IconButton' : 'Button',
    ...(tooltipActive ? { 'aria-keyshortcuts': props.keyshortcuts ?? undefined } : {}),
    ...passthrough,
    ...(tooltipActive && !props.description ? { 'aria-label': undefined } : {}),
    ...(ariaLabelledBy !== undefined ? { 'aria-labelledby': ariaLabelledBy } : {}),
    'aria-describedby': ariaDescribedBy,
    onClick: props.loading ? undefined : attrs.onClick,
  }
}

const Wrapper = (_props: Record<string, never>, { slots: content }: { slots: Slots }) =>
  props.loading === undefined
    ? content.default?.()
    : h(
        'div',
        {
          class: props.block
            ? styles['select-panel-button__conditional-wrapper']
            : props.variant === 'link'
              ? styles['select-panel-button__conditional-wrapper-link']
              : undefined,
          'data-loading-wrapper': true,
        },
        content.default?.(),
      )

function hasContent(nodes: VNode[]): boolean {
  return nodes.some((node) => node.type !== Comment)
}

onMounted(() => {
  if (!import.meta.env.DEV) return
  const el = element.value
  if (
    el &&
    !(el instanceof HTMLButtonElement) &&
    !(el instanceof HTMLAnchorElement) &&
    el.tagName !== 'SUMMARY'
  ) {
    console.warn('This component should be an instanceof a semantic button or anchor')
  }
})

defineExpose({ element, focus: () => element.value?.focus() })
</script>
<template>
  <Wrapper>
    <component
      :is="as"
      v-bind="bindings()"
      :id="id"
      ref="element"
      :class="[
        $style['select-panel-button'],
        className,
        { [$style['select-panel-button__icon-button']]: icon },
      ]"
      :type="effectiveType"
      :disabled="disabled ? true : undefined"
      :data-block="block ? 'block' : undefined"
      :data-inactive="inactive ? true : undefined"
      :data-loading="!!loading"
      :data-no-visuals="(!leadingVisual && !trailingVisual && !trailingAction) || undefined"
      :data-size="size"
      :data-variant="variant"
      :data-label-wrap="labelWrap"
      :data-notification-indicator="notificationIndicator"
      :data-has-count="count !== undefined ? true : undefined"
      :data-icon-only-counter="
        count !== undefined && leadingVisual && !hasContent(slots.default?.() ?? [])
          ? true
          : undefined
      "
      v-on="tooltipTriggerListeners"
    >
      <template v-if="icon">
        <Spinner v-if="loading" size="small" /><component
          :is="icon"
          v-else
          data-component="Octicon"
        />
      </template>
      <template v-else>
        <span
          :class="$style['select-panel-button__button-content']"
          data-component="buttonContent"
          :data-align="alignContent"
        >
          <span
            v-if="
              loading && !leadingVisual && !trailingVisual && !trailingAction && count === undefined
            "
            :class="[
              $style['select-panel-button__visual'],
              $style['select-panel-button__loading-spinner'],
            ]"
            data-component="loadingSpinner"
            ><Spinner size="small"
          /></span>
          <span
            v-if="leadingVisual"
            :class="[
              $style['select-panel-button__visual'],
              $style['select-panel-button__leading-visual'],
              loading
                ? $style['select-panel-button__loading-spinner']
                : $style['select-panel-button__visual-wrap'],
            ]"
            data-component="leadingVisual"
            ><Spinner v-if="loading" size="small" /><component
              :is="leadingVisual"
              v-else
              data-component="Octicon"
          /></span>
          <span
            v-if="hasContent(slots.default?.() ?? [])"
            :id="loading ? labelId : undefined"
            :class="$style['select-panel-button__label']"
            data-component="text"
            ><slot
          /></span>
          <span
            v-if="count !== undefined && !trailingVisual"
            :class="[
              loading && !leadingVisual
                ? $style['select-panel-button__loading-spinner']
                : $style['select-panel-button__visual-wrap'],
            ]"
            data-component="trailingVisual"
            ><Spinner v-if="loading && !leadingVisual" size="small" /><CounterLabel
              v-else
              :class="$style['select-panel-button__counter-label']"
              data-component="ButtonCounter"
              >{{ count }}</CounterLabel
            ></span
          >
          <span
            v-else-if="trailingVisual"
            :class="[
              $style['select-panel-button__visual'],
              loading && !leadingVisual
                ? $style['select-panel-button__loading-spinner']
                : $style['select-panel-button__visual-wrap'],
            ]"
            data-component="trailingVisual"
            ><Spinner v-if="loading && !leadingVisual" size="small" /><component
              :is="trailingVisual"
              v-else
              data-component="Octicon"
          /></span>
        </span>
        <span
          v-if="trailingAction"
          :class="[
            $style['select-panel-button__visual'],
            loading && !leadingVisual && !trailingVisual
              ? $style['select-panel-button__loading-spinner']
              : $style['select-panel-button__visual-wrap'],
          ]"
          data-component="trailingAction"
          ><Spinner v-if="loading && !leadingVisual && !trailingVisual" size="small" /><component
            :is="trailingAction"
            v-else
            data-component="Octicon"
        /></span>
      </template>
    </component>
    <VisuallyHidden v-if="loading">
      <AriaStatus :id="loadingAnnouncementId">
        {{ loadingAnnouncement }}
      </AriaStatus>
    </VisuallyHidden>
  </Wrapper>
  <TooltipElement
    v-if="tooltipEnabled"
    :tooltip-id="tooltipId"
    :text="tooltipText"
    :type="tooltipType"
    :keybinding-hints="tooltipKeybindingHints"
    :has-aria-label="false"
    :calculated-direction="calculatedDirection"
    :set-element="setTooltipEl"
    @mouseenter="openTooltip"
    @mouseleave="closeTooltip"
  />
</template>
<style module src="./SelectPanelButton.module.css" />
