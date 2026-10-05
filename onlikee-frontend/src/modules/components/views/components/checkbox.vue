<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '@/components/primer-vue/Checkbox'
import { CheckboxGroup } from '@/components/primer-vue/CheckboxGroup'
import { FormControl } from '@/components/primer-vue/FormControl'
import { Button } from '@/components/primer-vue/Button'
import ComponentDocsPage from '../../components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsHeader from '../../components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsSection from '../../components/ComponentDocsPage/ComponentDocsSection.vue'
import ComponentDocsDemoBlock from '../../components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
const checked = ref(false)
const disabled = ref(false)
const selected = ref<string[]>(['email'])
const options = [{ value: 'email', label: '邮件通知' }, { value: 'push', label: '推送通知' }]
const codes = {
  basic: '<FormControl><Checkbox v-model:checked="checked" value="accept" /><FormControl.Label>接收通知</FormControl.Label></FormControl>',
  mixed: '<FormControl><Checkbox indeterminate /><FormControl.Label>部分选中</FormControl.Label></FormControl>',
  group: '<CheckboxGroup @change="selected = $event"><CheckboxGroup.Label>通知方式</CheckboxGroup.Label><FormControl><Checkbox value="email" default-checked /><FormControl.Label>邮件通知</FormControl.Label></FormControl></CheckboxGroup>'
}
</script>
<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Checkbox 复选框"
      description="原生复选框，支持受控选中、默认选中、部分选中及组级校验。"
    />
    <ComponentDocsSection title="受控选中">
      <ComponentDocsDemoBlock :code="codes.basic">
        <FormControl>
          <Checkbox
            v-model:checked="checked"
            value="accept"
          />
          <FormControl.Label>接收通知</FormControl.Label>
          <FormControl.Caption>使用空格键切换选中状态。</FormControl.Caption>
        </FormControl>
        <p>选中：{{ checked }}</p>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="部分选中">
      <ComponentDocsDemoBlock :code="codes.mixed">
        <FormControl>
          <Checkbox
            indeterminate
            value="mixed"
          /><FormControl.Label>部分选中</FormControl.Label>
        </FormControl>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="CheckboxGroup 与组级校验">
      <ComponentDocsDemoBlock :code="codes.group">
        <CheckboxGroup
          id="notification-options"
          :disabled="disabled"
          required
          @change="selected = $event"
        >
          <CheckboxGroup.Label>通知方式</CheckboxGroup.Label>
          <CheckboxGroup.Caption>可选择多个通知方式。</CheckboxGroup.Caption>
          <CheckboxGroup.Validation
            v-if="!selected.length"
            variant="error"
          >
            至少选择一种通知方式。
          </CheckboxGroup.Validation>
          <FormControl
            v-for="option in options"
            :key="option.value"
          >
            <Checkbox
              :value="option.value"
              :default-checked="option.value === 'email'"
            />
            <FormControl.Label>{{ option.label }}</FormControl.Label>
          </FormControl>
        </CheckboxGroup>
        <p>当前选择：{{ selected.join('、') || '无' }}</p>
        <Button @click="disabled = !disabled">
          {{ disabled ? '启用' : '禁用' }}整组
        </Button>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>
