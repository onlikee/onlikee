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
    <div class="control-group-content">
      <div class="control-group-title">
        <h3 class="control-group-label">{{ label }}<template v-if="required"> *</template></h3>
      </div>
      <div v-if="$slots.description" class="control-group-description">
        <slot name="description" />
      </div>
      <div class="control-group-control">
        <slot name="control" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.control-group-item {
  container-type: inline-size;
  padding-inline: 16px;
}

.control-group-content {
  display: grid;
  grid-template:
    'title control'
    'description control' / minmax(0, 1fr) auto;
  align-content: center;
  padding-block: 12px;
}

.control-group-title {
  grid-area: title;
  align-self: center;
}

.control-group-label {
  margin: 0;
  color: var(--fgColor-default);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
}

.control-group-description {
  grid-area: description;
  margin-block-start: 2px;
  color: var(--fgColor-muted);
  font-size: 12px;
  line-height: 1.5;
}

.control-group-control {
  grid-area: control;
  align-self: center;
  padding-inline-start: 16px;
}

@container (max-width: 320px) {
  .control-group-content {
    grid-template:
      'title'
      'description'
      'control' / minmax(0, 1fr);
  }

  .control-group-control {
    padding-block-start: 8px;
    padding-inline-start: 0;
  }
}
</style>
