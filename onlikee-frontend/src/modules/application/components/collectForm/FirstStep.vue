<template>
  <form class="collect-form" @submit.prevent>
    <FormControl required>
      <FormControl.Label> 应用名称 </FormControl.Label>
      <TextInput
        block
        :value="collectName"
        placeholder="请输入应用名称"
        maxlength="100"
        @update:value="(value) => emit('update:collect-name', value)"
      />
      <FormControl.Validation v-if="collectNameError" variant="error">
        {{ collectNameError }}
      </FormControl.Validation>
    </FormControl>

    <FormControl required>
      <FormControl.Label> 网站地址 </FormControl.Label>
      <TextInput
        block
        :value="collectUrl"
        placeholder="请输入网站地址"
        @update:value="(value) => emit('update:collect-url', value)"
      />
      <FormControl.Validation v-if="collectUrlError" variant="error">
        {{ collectUrlError }}
      </FormControl.Validation>
    </FormControl>

    <ControlGroup>
      <ControlGroup.Item label="选择可见性" required>
        <template #description>选择你的应用公开的还是私有的。</template>
        <template #control>
          <VisibilitySelect
            :model-value="collectVisibility"
            @update:model-value="(value) => emit('update:collect-visibility', value)"
          />
        </template>
      </ControlGroup.Item>
    </ControlGroup>

    <FormControl required>
      <FormControl.Label> 应用描述 </FormControl.Label>
      <Textarea
        block
        :value="collectDescription"
        placeholder="请输入应用描述"
        maxlength="1000"
        rows="7"
        @update:value="(value) => emit('update:collect-description', value)"
      />
      <FormControl.Validation v-if="collectDescriptionError" variant="error">
        {{ collectDescriptionError }}
      </FormControl.Validation>
      <FormControl.Caption>
        {{ `${collectDescription.length} / 1000` }}
      </FormControl.Caption>
    </FormControl>
  </form>
</template>

<script setup lang="ts">
import { ControlGroup } from '@/components/common/ControlGroup'
import { VisibilitySelect } from '@/components/business/ControlGroupControls'
import { FormControl } from '@/components/primer-vue/FormControl'
import { TextInput } from '@/components/primer-vue/TextInput'
import { Textarea } from '@/components/primer-vue/Textarea'

interface Props {
  collectName: string
  collectUrl: string
  collectVisibility: string
  collectDescription: string
  collectNameError?: string
  collectUrlError?: string
  collectDescriptionError?: string
}

withDefaults(defineProps<Props>(), {
  collectNameError: '',
  collectUrlError: '',
  collectDescriptionError: '',
})

const emit = defineEmits<{
  'update:collect-name': [value: string]
  'update:collect-url': [value: string]
  'update:collect-visibility': [value: string]
  'update:collect-description': [value: string]
}>()
</script>

<style scoped>
.collect-form {
  display: grid;
  gap: 12px;
}
</style>
