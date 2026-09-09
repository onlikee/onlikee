<script setup lang="ts">
withDefaults(defineProps<{
  clipSidebar?: boolean
}>(), {
  clipSidebar: false
})
</script>

<template>
  <div
    class="timeline"
    :data-clip-sidebar="clipSidebar ? '' : null"
  >
    <slot />
  </div>
</template>

<style scoped>
.timeline {
  display: flex;
  flex-direction: column;
}

.timeline :deep(.timeline__item) {
  display: flex;
  margin-left: 1rem;
  padding: 1rem 0;
  position: relative;
}

.timeline[data-clip-sidebar] :deep(.timeline__item:first-child) {
  padding-top: 0;
}

.timeline[data-clip-sidebar] :deep(.timeline__item:last-child) {
  padding-bottom: 0;
}

.timeline :deep(.timeline__item::before) {
  background-color: var(--borderColor-muted, #d1d9e0b3);
  bottom: 0;
  content: "";
  display: block;
  left: 0;
  position: absolute;
  top: 0;
  width: 2px;
}

.timeline :deep(.timeline__badge-wrapper) {
  position: relative;
  z-index: 1;
}

.timeline :deep(.timeline__badge) {
  align-items: center;
  background-color: var(--timelineBadge-bgColor, #f6f8fa);
  border-color: var(--bgColor-default, #ffffff);
  border-radius: 50%;
  border-style: solid;
  border-width: 0.125rem;
  display: flex;
  flex-shrink: 0;
  height: 32px;
  justify-content: center;
  margin-left: -15px;
  margin-right: 0.5rem;
  overflow: hidden;
  width: 32px;
  color: var(--fgColor-muted, #59636e);
}

.timeline :deep(.timeline__body) {
  flex: auto;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  max-width: 100%;
  min-width: 0;
  color: var(--fgColor-muted, #59636e);
}
</style>
