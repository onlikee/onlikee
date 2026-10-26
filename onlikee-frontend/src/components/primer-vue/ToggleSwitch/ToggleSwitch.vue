<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef, useAttrs, watch } from 'vue'
import Spinner from '../Spinner/Spinner.vue'
import VisuallyHidden from '../VisuallyHidden/VisuallyHidden.vue'
import AriaStatus from '../internal/components/AriaStatus.vue'
import { normalizeReactStyle } from '../internal/style'
import type { ToggleSwitchProps } from './types'

defineOptions({ name: 'ToggleSwitch', inheritAttrs: false })
const props = withDefaults(defineProps<ToggleSwitchProps>(), {
  checked: undefined,
  buttonType: 'button',
  size: 'medium',
  statusLabelPosition: 'start',
  loadingLabelDelay: 2000,
  loadingLabel: 'Loading',
})
const normalizedProps = props as typeof props & {
  ariaLabelledby: string
  ariaDescribedby?: string
}
const attrs = useAttrs()
const element = shallowRef<HTMLButtonElement | null>(null)
const internalChecked = shallowRef(Boolean(props.defaultChecked))
const isOn = computed(() => props.checked ?? internalChecked.value)
const acceptsInteraction = computed(() => !props.disabled && !props.loading)
const isLoadingLabelVisible = shallowRef(false)
// The reference passes this literal to useId, which preserves supplied IDs.
const loadingLabelId = 'loadingLabel'
const describedBy = computed(() =>
  isLoadingLabelVisible.value || normalizedProps.ariaDescribedby
    ? [loadingLabelId, normalizedProps.ariaDescribedby].filter(Boolean).join(' ')
    : undefined,
)
const timers = new Set<ReturnType<typeof setTimeout>>()

onMounted(() => {
  watch(
    [() => props.loading, isLoadingLabelVisible, () => props.loadingLabelDelay],
    () => {
      if (!props.loading && isLoadingLabelVisible.value) {
        isLoadingLabelVisible.value = false
      } else if (props.loading && !isLoadingLabelVisible.value) {
        timers.add(setTimeout(() => (isLoadingLabelVisible.value = true), props.loadingLabelDelay))
      }
    },
    { immediate: true, flush: 'post' },
  )
})
onBeforeUnmount(() => timers.forEach((timer) => clearTimeout(timer)))

function handleToggleClick(event: MouseEvent) {
  if (!acceptsInteraction.value) return
  const next = !isOn.value
  if (props.checked === undefined) internalChecked.value = next
  props.onChange?.(next)
  props.onClick?.(event)
}

defineExpose({ element })
</script>

<template>
  <div
    :class="[$style.ToggleSwitch, className]"
    :data-status-label-position="statusLabelPosition"
    v-bind="attrs"
    :style="normalizeReactStyle(attrs.style)"
  >
    <VisuallyHidden>
      <AriaStatus :id="loadingLabelId" announce-on-show>
        {{ isLoadingLabelVisible ? loadingLabel : '' }}
      </AriaStatus>
    </VisuallyHidden>
    <div
      v-if="loading"
      :class="$style.LoadingSpinner"
      :data-status-label-position="statusLabelPosition"
    >
      <Spinner size="small" :sr-text="null" />
    </div>
    <span
      :class="$style.StatusText"
      :data-size="size"
      :data-disabled="!acceptsInteraction"
      aria-hidden="true"
      @click="handleToggleClick"
    >
      <span :class="$style.StatusTextItem" :data-hidden="!isOn">{{ buttonLabelOn ?? 'On' }}</span>
      <span :class="$style.StatusTextItem" :data-hidden="isOn">{{ buttonLabelOff ?? 'Off' }}</span>
    </span>
    <button
      ref="element"
      :type="buttonType"
      :class="$style.SwitchButton"
      :data-size="size"
      :data-checked="isOn"
      :data-disabled="!acceptsInteraction"
      :aria-labelledby="normalizedProps.ariaLabelledby"
      :aria-describedby="describedBy"
      :aria-pressed="isOn"
      :aria-disabled="!acceptsInteraction"
      @click="handleToggleClick"
    >
      <div :class="$style.SwitchButtonContent" aria-hidden="true">
        <div
          :class="[$style.IconContainer, $style.LineIconContainer]"
          :data-checked="isOn"
          :data-disabled="!acceptsInteraction"
        >
          <svg
            aria-hidden="true"
            :width="size === 'small' ? '12' : '16'"
            :height="size === 'small' ? '12' : '16'"
            viewBox="0 0 16 16"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M8 2a.75.75 0 0 1 .75.75v11.5a.75.75 0 0 1-1.5 0V2.75A.75.75 0 0 1 8 2Z"
            />
          </svg>
        </div>
        <div
          :class="[$style.IconContainer, $style.CircleIconContainer]"
          :data-checked="isOn"
          :data-disabled="!acceptsInteraction"
        >
          <svg
            aria-hidden="true"
            :width="size === 'small' ? '12' : '16'"
            :height="size === 'small' ? '12' : '16'"
            viewBox="0 0 16 16"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M8 12.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12Z"
            />
          </svg>
        </div>
      </div>
      <div
        :class="$style.ToggleKnob"
        :data-checked="isOn"
        :data-disabled="!acceptsInteraction"
        aria-hidden="true"
      />
    </button>
  </div>
</template>

<style module src="./ToggleSwitch.module.css" />
