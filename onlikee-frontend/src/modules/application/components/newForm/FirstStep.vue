<script setup lang="ts">
import { useId } from 'vue'
import { FrameworkSelect } from '@/components/business/ControlGroupControls'
import { ControlGroup } from '@/components/common/ControlGroup'
import { FormControlValidation } from '@/components/primer-vue/FormControl'
import type { FrameworkValue } from './useCreateApplicationForm'

interface Props {
  selectedFramework: FrameworkValue | null
  invalid?: boolean
  validation?: string
}

withDefaults(defineProps<Props>(), {
  invalid: false,
  validation: '',
})

const emit = defineEmits<{
  'update:selected-framework': [value: FrameworkValue]
}>()

const validationId = useId()
</script>

<template>
  <div class="first-step">
    <ControlGroup :class="{ 'framework-group--invalid': invalid }">
      <ControlGroup.Item label="前端框架" required>
        <template #description>所选框架决定下一步的代码上传方式。</template>
        <template #control>
          <FrameworkSelect
            :model-value="selectedFramework"
            :invalid="invalid"
            :described-by="invalid && validation ? validationId : undefined"
            @update:model-value="(value) => emit('update:selected-framework', value)"
          />
        </template>
      </ControlGroup.Item>
    </ControlGroup>

    <FormControlValidation v-if="invalid && validation" :id="validationId" variant="error">
      {{ validation }}
    </FormControlValidation>
  </div>
</template>

<style scoped>
.first-step {
  display: grid;
  gap: 8px;
}

.framework-group--invalid {
  border-color: var(--borderColor-danger-emphasis, #cf222e);
}
</style>
