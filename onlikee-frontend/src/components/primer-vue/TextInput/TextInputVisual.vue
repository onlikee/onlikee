<script setup lang="ts">
import Spinner from '../Spinner/Spinner.vue'
defineProps<{ id?: string; position: 'leading' | 'trailing'; hasVisual: boolean; hasLoading: boolean; showLoading: boolean }>()
</script>
<template>
  <span
    v-if="hasVisual || hasLoading && (position === 'trailing' || showLoading)"
    :id="hasLoading ? undefined : id"
    class="TextInput-icon"
    :data-component="position === 'leading' ? 'TextInput.LeadingVisual' : 'TextInput.TrailingVisual'"
    :aria-hidden="hasLoading ? undefined : true"
  >
    <template v-if="!hasLoading"><slot /></template>
    <div
      v-else
      :id="id"
      class="visual-box"
    >
      <!-- 源恒挂显式可见性类（SpinnerHidden/SpinnerVisible 双向切换），非仅单向 hidden。 -->
      <div
        v-if="hasVisual"
        :class="showLoading ? 'visual-hidden' : 'visual-visible'"
      ><slot /></div>
      <Spinner
        class="visual-spinner"
        :class="[showLoading ? 'visual-visible' : 'visual-hidden', { 'visual-spinner-overlay': hasVisual, 'visual-spinner-leading': hasVisual && position === 'leading' }]"
        :sr-text="null"
        :size="hasVisual ? 'medium' : 'small'"
      />
    </div>
  </span>
</template>
<style scoped>
.visual-box { position: relative; display: flex; }
.visual-box :deep(.visual-hidden) { visibility: hidden; }
.visual-box :deep(.visual-visible) { visibility: visible; }
.visual-box :deep(.visual-spinner-overlay) { position: absolute; top: 0; right: 0; max-width: 100%; height: 100%; }
.visual-box :deep(.visual-spinner-leading) { left: 0; }
</style>
