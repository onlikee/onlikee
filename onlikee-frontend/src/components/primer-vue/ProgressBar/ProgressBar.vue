<template>
  <span
    :class="$style['progress-bar']"
    data-component="ProgressBar"
    :data-progress-display="inline ? 'inline' : 'block'"
    :data-progress-bar-size="barSize"
  >
    <slot>
      <ProgressBarItem
        :progress="progress"
        :bg="bg"
        :data-animated="animated"
        :aria-label="ariaLabel"
        :aria-valuenow="ariaValuenow"
        :aria-valuetext="ariaValuetext"
      />
    </slot>
  </span>
</template>

<script setup lang="ts">
import ProgressBarItem from './ProgressBarItem.vue'

withDefaults(
  defineProps<{
    progress?: string | number
    bg?: string
    barSize?: 'small' | 'default' | 'large'
    inline?: boolean
    animated?: boolean
    ariaLabel?: string
    ariaValuenow?: number | string
    ariaValuetext?: string
  }>(),
  {
    progress: undefined,
    bg: 'success.emphasis',
    barSize: 'default',
    inline: false,
    animated: false,
    ariaLabel: undefined,
    ariaValuenow: undefined,
    ariaValuetext: undefined,
  },
)
</script>
<style module src="./ProgressBar.module.css" />
