<script setup lang="ts">
import Spinner from '../Spinner/Spinner.vue'
defineProps<{
  id?: string
  position: 'leading' | 'trailing'
  hasVisual: boolean
  hasLoading: boolean
  showLoading: boolean
}>()
</script>
<template>
  <span
    v-if="hasVisual || (hasLoading && (position === 'trailing' || showLoading))"
    :id="hasLoading ? undefined : id"
    class="TextInput-icon"
    :data-component="
      position === 'leading' ? 'TextInput.LeadingVisual' : 'TextInput.TrailingVisual'
    "
    :aria-hidden="hasLoading ? undefined : true"
  >
    <template v-if="!hasLoading"><slot /></template>
    <div v-else :id="id" :class="$style['visual-box']">
      <div
        v-if="hasVisual"
        :class="showLoading ? $style['visual-hidden'] : $style['visual-visible']"
      >
        <slot />
      </div>
      <Spinner
        :class="[
          showLoading ? $style['visual-visible'] : $style['visual-hidden'],
          {
            [$style['visual-spinner-overlay']]: hasVisual,
            [$style['visual-spinner-leading']]: hasVisual && position === 'leading',
          },
        ]"
        :sr-text="null"
        :size="hasVisual ? 'medium' : 'small'"
      />
    </div>
  </span>
</template>
<style module src="./TextInputVisual.module.css" />
