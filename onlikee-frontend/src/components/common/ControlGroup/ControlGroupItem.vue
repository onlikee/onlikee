<script setup lang="ts">
defineProps<{
  label: string
  required?: boolean
}>()

defineSlots<{
  description?: () => unknown
  control: () => unknown
}>()
</script>

<template>
  <div class="control-group-item">
    <div class="control-group-text">
      <h4 class="control-group-label">{{ label }}<template v-if="required"> *</template></h4>
      <div v-if="$slots.description" class="control-group-description">
        <slot name="description" />
      </div>
    </div>
    <div>
      <slot name="control" />
    </div>
  </div>
</template>

<style scoped>
.control-group-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px;
}

.control-group-text {
  min-width: 0;
}

.control-group-label {
  margin: 0;
  color: var(--fgColor-default);
  font-size: 14px;
  font-weight: 600;
}

.control-group-description {
  margin-top: 2px;
  color: var(--fgColor-muted);
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .control-group-item {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
