<template>
  <form class="website-form" @submit.prevent>
    <FormControl required>
      <FormControl.Label> 应用名称 </FormControl.Label>
      <TextInput
        block
        :value="appName"
        placeholder="请输入应用名称"
        maxlength="100"
        @update:value="(value) => emit('update:app-name', value)"
      />
      <FormControl.Validation v-if="appNameError" variant="error">
        {{ appNameError }}
      </FormControl.Validation>
    </FormControl>

    <FormControl required>
      <FormControl.Label> 网站地址 </FormControl.Label>
      <TextInput
        block
        :value="appUrl"
        placeholder="请输入网站地址"
        @update:value="(value) => emit('update:app-url', value)"
      />
      <FormControl.Validation v-if="appUrlError" variant="error">
        {{ appUrlError }}
      </FormControl.Validation>
    </FormControl>

    <ControlGroup>
      <ControlGroup.Item label="选择可见性" required>
        <template #description>选择你的应用公开的还是私有的。</template>
        <template #control>
          <VisibilitySelect
            :model-value="visibility"
            @update:model-value="(value) => emit('update:visibility', value)"
          />
        </template>
      </ControlGroup.Item>
    </ControlGroup>

    <FormControl required>
      <FormControl.Label> 应用描述 </FormControl.Label>
      <Textarea
        block
        :value="appDescription"
        placeholder="请输入应用描述"
        maxlength="1000"
        rows="7"
        @update:value="(value) => emit('update:app-description', value)"
      />
      <FormControl.Validation v-if="appDescriptionError" variant="error">
        {{ appDescriptionError }}
      </FormControl.Validation>
      <FormControl.Caption>
        {{ `${appDescription.length} / 1000` }}
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
  appName: string
  appUrl: string
  visibility: string
  appDescription: string
  appNameError?: string
  appUrlError?: string
  appDescriptionError?: string
}

withDefaults(defineProps<Props>(), {
  appNameError: '',
  appUrlError: '',
  appDescriptionError: '',
})

const emit = defineEmits<{
  'update:app-name': [value: string]
  'update:app-url': [value: string]
  'update:visibility': [value: string]
  'update:app-description': [value: string]
}>()
</script>

<style scoped>
.website-form {
  display: grid;
  gap: 12px;
}
</style>
