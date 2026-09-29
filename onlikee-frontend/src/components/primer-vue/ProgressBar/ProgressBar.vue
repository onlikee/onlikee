<template>
  <span
    class="progress-bar"
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

withDefaults(defineProps<{
  progress?: string | number
  bg?: string
  barSize?: 'small' | 'default' | 'large'
  inline?: boolean
  animated?: boolean
  ariaLabel?: string
  ariaValuenow?: number | string
  ariaValuetext?: string
}>(), {
  progress: undefined,
  bg: 'success.emphasis',
  barSize: 'default',
  inline: false,
  animated: false,
  ariaLabel: undefined,
  ariaValuenow: undefined,
  ariaValuetext: undefined
})
</script>

<style scoped>
.progress-bar {
  display: flex;
  overflow: hidden;
  gap: 2px;
  background-color: var(--progressBar-track-bgColor, var(--borderColor-default, #d1d9e0));
  border-radius: var(--borderRadius-small, 3px);
  outline: solid 1px var(--progressBar-track-borderColor, transparent);
  outline-offset: -1px;
}

.progress-bar[data-progress-display='inline'] {
  display: inline-flex;
}

.progress-bar[data-progress-bar-size='small'] {
  height: 5px;
}

.progress-bar[data-progress-bar-size='default'] {
  height: 8px;
}

.progress-bar[data-progress-bar-size='large'] {
  height: 10px;
}

@media (forced-colors: active) {
  .progress-bar {
    background-color: CanvasText;
    forced-color-adjust: none;
  }
}
</style>
