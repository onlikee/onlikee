<script setup lang="ts">
import { FrameworkSelect } from '@/components/business/ControlGroupControls'
import { ControlGroup } from '@/components/common/ControlGroup'

defineProps<{ selectedFramework: string }>()

const emit = defineEmits<{
  'update:selected-framework': [value: string]
}>()
</script>

<template>
  <ControlGroup>
    <ControlGroup.Item label="前端框架" required>
      <template #description>所选框架决定下一步的代码上传方式。</template>
      <template #control>
        <FrameworkSelect
          :model-value="selectedFramework"
          @update:model-value="(value) => emit('update:selected-framework', value)"
        />
      </template>
    </ControlGroup.Item>
  </ControlGroup>
</template>
