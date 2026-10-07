<template>
  <component
    :is="as"
    :class="[$style['button'], 'button']"
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading ? 'true' : undefined"
    :data-loading="loading"
    :data-size="size"
    :data-variant="variant"
    :data-icon-button="hasLabel() ? 'false' : 'true'"
    :data-block="block || undefined"
    @click="handleClick"
  >
    <span
      :class="$style['button__content']"
    >
      <span :class="$style['button__content-row']">
        <span
          v-if="leadingVisual"
          :class="$style['button__visual']"
        >
          <component :is="leadingVisual" />
        </span>
        <span
          v-if="hasLabel()"
          :class="$style['button__label']"
        >
          <slot />
        </span>
        <span
          v-if="trailingVisual"
          :class="$style['button__visual']"
        >
          <component :is="trailingVisual" />
        </span>
      </span>
      <svg
        v-if="loading && !(trailingAction && !leadingVisual && !trailingVisual)"
        aria-hidden="true"
        focusable="false"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
        :class="$style['button__spinner']"
      >
        <circle
          cx="8"
          cy="8"
          r="7"
          fill="none"
          stroke="currentColor"
          stroke-opacity="0.25"
          stroke-width="2"
          vector-effect="non-scaling-stroke"
        />
        <path
          d="M15 8a7.002 7.002 0 0 0-7-7"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-width="2"
          vector-effect="non-scaling-stroke"
        />
      </svg>
    </span>
    <span
      v-if="trailingAction"
      :class="$style['button__trailing-action']"
      data-component="trailingAction"
    >
      <svg
        v-if="loading && !leadingVisual && !trailingVisual"
        aria-hidden="true"
        focusable="false"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
        :class="$style['button__spinner']"
      >
        <circle
          cx="8"
          cy="8"
          r="7"
          fill="none"
          stroke="currentColor"
          stroke-opacity="0.25"
          stroke-width="2"
          vector-effect="non-scaling-stroke"
        />
        <path
          d="M15 8a7.002 7.002 0 0 0-7-7"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-width="2"
          vector-effect="non-scaling-stroke"
        />
      </svg>
      <component
        :is="trailingAction"
        v-else
      />
    </span>
  </component>
</template>

<script setup lang="ts">
import { Comment, useSlots, type Component, type VNode } from 'vue'

interface Props {
  as?: 'button' | 'a'
  block?: boolean
  type?: 'button' | 'submit' | 'reset'
  variant?: 'default' | 'primary' | 'invisible' | 'danger' | 'link'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  disabled?: boolean
  leadingVisual?: Component
  trailingVisual?: Component
  trailingAction?: Component
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  block: false,
  type: 'button',
  variant: 'default',
  size: 'medium',
  loading: false,
  disabled: false,
  leadingVisual: undefined,
  trailingVisual: undefined,
  trailingAction: undefined
})

const slots = useSlots()

function hasContent(nodes: VNode[]): boolean {
  return nodes.some(node => node.type !== Comment)
}

function hasLabel() {
  return hasContent(slots.default?.() ?? [])
}

function handleClick(event: MouseEvent) {
  if (props.loading) {
    event.preventDefault()
    event.stopImmediatePropagation()
  }
}
</script>

<style module src="./Button.module.css"></style>
