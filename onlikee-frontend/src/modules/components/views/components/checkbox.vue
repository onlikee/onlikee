<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox } from '@/components/primer-vue/Checkbox'
import { CheckboxGroup } from '@/components/primer-vue/CheckboxGroup'
import { FormControl } from '@/components/primer-vue/FormControl'
import { Button } from '@/components/primer-vue/Button'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsPage from '../../components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsHeader from '../../components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsSection from '../../components/ComponentDocsPage/ComponentDocsSection.vue'
import ComponentDocsDemoBlock from '../../components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
const checked = ref(false)
const disabled = ref(false)
const selected = ref<string[]>(['email'])
const options = [
  { value: 'email', label: '邮件通知' },
  { value: 'push', label: '推送通知' },
]
const codes = {
  basic:
    '<FormControl><Checkbox v-model:checked="checked" value="accept" /><FormControl.Label>接收通知</FormControl.Label></FormControl>',
  mixed:
    '<FormControl><Checkbox indeterminate /><FormControl.Label>部分选中</FormControl.Label></FormControl>',
  group:
    '<CheckboxGroup @change="selected = $event"><CheckboxGroup.Label>通知方式</CheckboxGroup.Label><FormControl><Checkbox value="email" default-checked /><FormControl.Label>邮件通知</FormControl.Label></FormControl></CheckboxGroup>',
}
const apiColumns: TableColumn[] = [
  { key: 'name', label: '属性 / 事件', rowHeader: true, minWidth: '180px' },
  { key: 'type', label: '类型', minWidth: '200px', wrap: true },
  { key: 'description', label: '说明', minWidth: '260px', wrap: true },
]
const checkboxRows = [
  {
    name: 'checked / v-model:checked',
    type: 'boolean',
    description: '受控选中状态；不传 checked 时由原生 input 管理选中。',
  },
  {
    name: 'defaultChecked',
    type: 'boolean',
    description: '非受控初始选中状态，也是原生表单重置的默认值。',
  },
  {
    name: 'indeterminate',
    type: 'boolean',
    description: '部分选中，优先于 checked；设置 aria-checked="mixed"。',
  },
  {
    name: 'disabled / required',
    type: 'boolean',
    description: '原生禁用与必填；与 FormControl 组合时应传给 FormControl。',
  },
  {
    name: 'validationStatus',
    type: "'error' | 'success'",
    description: '只影响 aria-invalid，不改变单个复选框的校验样式。',
  },
  { name: 'value', type: 'string', description: '提交值，并作为默认 name；原生 name 可覆盖。' },
  {
    name: 'className',
    type: 'string',
    description: '与 Vue class 合并；其他原生 input 属性和事件传给 input。',
  },
  {
    name: 'change',
    type: '(event: Event) => void',
    description: '原生 change 事件；分组 change 先于单个 Checkbox 的 change。',
  },
]
const groupRows = [
  {
    name: 'id',
    type: 'string',
    description: '用于生成 caption 和 validation 的关联 ID，不写入根元素。',
  },
  { name: 'disabled', type: 'boolean', description: '禁用 fieldset 和组内 FormControl。' },
  { name: 'required', type: 'boolean', description: '标记组级必选；不会让组内每个复选框都必填。' },
  {
    name: 'aria-labelledby',
    type: 'string',
    description: '不使用 CheckboxGroup.Label 时引用外部标签。',
  },
  {
    name: 'className / class',
    type: 'string',
    description: '应用到内层 fieldset 或 div；分组不透传其他任意 DOM 属性。',
  },
  {
    name: 'data-component',
    type: 'string',
    description: '默认 CheckboxGroup，同时决定子组件标记的前缀。',
  },
  {
    name: 'change',
    type: '(selected: string[], event?: Event) => void',
    description: '返回选中值和原生事件；初始选中从直接 FormControl 子项读取，之后由 change 更新。',
  },
  {
    name: 'Label.visuallyHidden',
    type: 'boolean',
    description: '隐藏组标签，但保留辅助技术名称。',
  },
  { name: 'Label / Caption.className', type: 'string', description: '自定义标签或说明样式。' },
  {
    name: 'Validation.variant',
    type: "'error' | 'success'",
    description: '必填，显示组级校验信息。',
  },
]
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
          <Checkbox v-model:checked="checked" value="accept" />
          <FormControl.Label>接收通知</FormControl.Label>
          <FormControl.Caption>使用空格键切换选中状态。</FormControl.Caption>
        </FormControl>
        <p>选中：{{ checked }}</p>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="部分选中">
      <ComponentDocsDemoBlock :code="codes.mixed">
        <FormControl>
          <Checkbox indeterminate value="mixed" /><FormControl.Label>部分选中</FormControl.Label>
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
          <CheckboxGroup.Validation v-if="!selected.length" variant="error">
            至少选择一种通知方式。
          </CheckboxGroup.Validation>
          <FormControl v-for="option in options" :key="option.value">
            <Checkbox :value="option.value" :default-checked="option.value === 'email'" />
            <FormControl.Label>{{ option.label }}</FormControl.Label>
          </FormControl>
        </CheckboxGroup>
        <p>当前选择：{{ selected.join('、') || '无' }}</p>
        <Button @click="disabled = !disabled"> {{ disabled ? '启用' : '禁用' }}整组 </Button>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="API" variant="api">
      <h3>Checkbox</h3>
      <Table :columns="apiColumns" :data="checkboxRows" row-key="name" compact :hoverable="false" />
      <p>组件 ref 通过 element 或 input 获取原生 input，也支持 focus() 和 blur()。</p>
      <p>
        非受控输入的 aria-checked 沿用 React 原版，在组件渲染后同步；原生选中和表单提交状态由 input
        管理。CheckboxGroup 重新渲染时也会同步组内 Checkbox 的 aria-checked。
      </p>
      <h3>CheckboxGroup</h3>
      <Table :columns="apiColumns" :data="groupRows" row-key="name" compact :hoverable="false" />
      <p>
        有 Label 时渲染 fieldset/legend；无 Label 时使用 role="group" 并关联说明、校验和必填提示。
      </p>
      <p>
        只识别直接子组件；显式 Fragment 内的内容正常渲染，但不参与组插槽提取或初始选中值收集。 Vue
        模板和 v-for 生成的结构性 Fragment 会展开。
      </p>
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>
