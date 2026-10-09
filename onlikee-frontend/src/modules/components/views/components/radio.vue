<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Radio 单选框"
      description="用于从一组选项中选择一项，支持默认选中、受控状态和禁用状态。"
    />
    <ComponentDocsSection title="基础用法">
      <template #description>
        使用 FormControl 为选项添加标签和辅助说明。相同 name 的单选框只能选中一项。
      </template>
      <ComponentDocsDemoBlock :code="codes.basic">
        <FormControl>
          <Radio name="radio-default" value="default" />
          <FormControl.Label>默认选项</FormControl.Label>
        </FormControl>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="受控状态">
      <template #description> 通过 checked 设置选中状态，并在 change 事件中更新当前值。 </template>
      <ComponentDocsDemoBlock :code="codes.controlled">
        <div class="examples">
          <FormControl>
            <Radio
              name="radio-controlled"
              value="a"
              :checked="selected === 'a'"
              @change="select"
            /><FormControl.Label>选项 A</FormControl.Label>
          </FormControl>
          <FormControl>
            <Radio
              name="radio-controlled"
              value="b"
              :checked="selected === 'b'"
              @change="select"
            /><FormControl.Label>选项 B</FormControl.Label>
          </FormControl>
          <p class="demo-status">当前值：{{ selected }}</p>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="默认选中与表单重置">
      <template #description>
        使用 defaultChecked 设置默认选项。重置表单后，单选框会恢复初始选择。
      </template>
      <ComponentDocsDemoBlock :code="codes.defaultChecked">
        <form class="examples">
          <FormControl>
            <Radio name="radio-delivery" value="standard" default-checked /><FormControl.Label
              >标准配送</FormControl.Label
            >
          </FormControl>
          <FormControl>
            <Radio name="radio-delivery" value="express" /><FormControl.Label
              >加急配送</FormControl.Label
            >
          </FormControl>
          <Button type="reset"> 重置表单 </Button>
        </form>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="禁用与说明">
      <template #description>
        将 disabled 设置在 FormControl 上，可同时禁用单选框及其标签。使用 Caption 添加选项说明。
      </template>
      <ComponentDocsDemoBlock :code="codes.disabled">
        <div class="examples">
          <FormControl disabled>
            <Radio name="radio-disabled-off" value="off" /><FormControl.Label
              >禁用未选中</FormControl.Label
            >
          </FormControl>
          <FormControl disabled>
            <Radio name="radio-disabled-on" value="on" checked /><FormControl.Label
              >禁用已选中</FormControl.Label
            ><FormControl.Caption>此选项暂不可更改。</FormControl.Caption>
          </FormControl>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="RadioGroup 联动">
      <template #description>
        使用 RadioGroup 统一设置组名、标题和说明。更多用法见
        <RouterLink to="/component/radio-group"> RadioGroup 文档 </RouterLink>。
      </template>
      <ComponentDocsDemoBlock :code="codes.group">
        <RadioGroup name="radio-frequency">
          <RadioGroup.Label>通知频率</RadioGroup.Label>
          <RadioGroup.Caption>选择一种通知方式。</RadioGroup.Caption>
          <FormControl>
            <Radio value="daily" /><FormControl.Label>每天</FormControl.Label>
          </FormControl>
          <FormControl>
            <Radio value="weekly" /><FormControl.Label>每周</FormControl.Label>
          </FormControl>
        </RadioGroup>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="属性" variant="api">
      <Table :columns="columns" :data="rows" row-key="name" compact :hoverable="false" />
    </ComponentDocsSection>
    <ComponentDocsSection title="事件" variant="api">
      <Table :columns="columns" :data="eventRows" row-key="name" compact :hoverable="false" />
    </ComponentDocsSection>
    <ComponentDocsSection title="组件实例" variant="api">
      <template #description> 通过模板 ref 获取组件实例，可访问输入元素或控制焦点。 </template>
      <Table :columns="columns" :data="instanceRows" row-key="name" compact :hoverable="false" />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Radio } from '@/components/primer-vue/Radio'
import { RadioGroup } from '@/components/primer-vue/RadioGroup'
import { FormControl } from '@/components/primer-vue/FormControl'
import { Button } from '@/components/primer-vue/Button'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '../../components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '../../components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '../../components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '../../components/ComponentDocsPage/ComponentDocsSection.vue'
const selected = ref('a')
function select(event: Event) {
  selected.value = (event.currentTarget as HTMLInputElement).value
}
const codes = {
  basic: `<FormControl>
  <Radio name="default" value="default" />
  <FormControl.Label>默认选项</FormControl.Label>
</FormControl>`,
  controlled: `<script setup lang="ts">
import { ref } from 'vue'
const selected = ref('a')
function select(event: Event) { selected.value = (event.currentTarget as HTMLInputElement).value }
<\/script>
<template>
  <FormControl><Radio name="choices" value="a" :checked="selected === 'a'" @change="select" /><FormControl.Label>选项 A</FormControl.Label></FormControl>
  <FormControl><Radio name="choices" value="b" :checked="selected === 'b'" @change="select" /><FormControl.Label>选项 B</FormControl.Label></FormControl>
</template>`,
  defaultChecked: `<form>
  <FormControl><Radio name="delivery" value="standard" default-checked /><FormControl.Label>标准配送</FormControl.Label></FormControl>
  <FormControl><Radio name="delivery" value="express" /><FormControl.Label>加急配送</FormControl.Label></FormControl>
  <Button type="reset">重置表单</Button>
</form>`,
  disabled: `<FormControl disabled>
  <Radio name="disabled" value="on" checked />
  <FormControl.Label>禁用已选中</FormControl.Label>
  <FormControl.Caption>此选项暂不可更改。</FormControl.Caption>
</FormControl>`,
  group: `<RadioGroup name="frequency">
  <RadioGroup.Label>通知频率</RadioGroup.Label>
  <RadioGroup.Caption>选择一种通知方式。</RadioGroup.Caption>
  <FormControl><Radio value="daily" /><FormControl.Label>每天</FormControl.Label></FormControl>
  <FormControl><Radio value="weekly" /><FormControl.Label>每周</FormControl.Label></FormControl>
</RadioGroup>`,
}
const columns: TableColumn[] = [
  { key: 'name', label: '名称', rowHeader: true },
  { key: 'type', label: '类型', wrap: true },
  { key: 'description', label: '说明', wrap: true },
]
const rows = [
  { name: 'value', type: 'string（必填）', description: '选项的表单值' },
  { name: 'name', type: 'string', description: '同组名称，未提供时继承 RadioGroup.name' },
  {
    name: 'checked',
    type: 'boolean | undefined',
    description: '受控选中状态；未提供时使用非受控模式',
  },
  { name: 'defaultChecked', type: 'boolean', description: '非受控初始状态' },
  {
    name: 'disabled',
    type: 'boolean',
    description: '禁用选项；与 FormControl 组合时，在 FormControl 上设置',
  },
  {
    name: 'required',
    type: 'boolean',
    description: '设置原生表单必填校验；与 FormControl 组合时，使用组级校验提示',
  },
  {
    name: 'id',
    type: 'string',
    description: '输入元素标识；与 FormControl 组合时，在 FormControl 上设置',
  },
  {
    name: 'class / className',
    type: 'string',
    description: '为单选框添加自定义样式类',
  },
]
const eventRows = [
  {
    name: 'change',
    type: '(event: Event) => void',
    description: '选择选项时触发，通过 event.currentTarget 获取输入元素',
  },
]
const instanceRows = [
  { name: 'input', type: 'HTMLInputElement | null', description: '单选框的输入元素' },
  { name: 'focus', type: '(options?: FocusOptions) => void', description: '让单选框获得焦点' },
  { name: 'blur', type: '() => void', description: '让单选框失去焦点' },
]
</script>

<style scoped>
.examples {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: start;
}

.demo-status {
  margin: 0;
  color: var(--fgColor-muted, #59636e);
  font-size: 14px;
  line-height: 1.5;
}
</style>
