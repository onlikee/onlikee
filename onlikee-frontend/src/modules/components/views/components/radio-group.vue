<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="RadioGroup 单选框组"
      description="将相关单选框组织为一组，统一管理标题、辅助说明、禁用状态和校验提示。"
    />
    <ComponentDocsSection title="基础用法">
      <template #description>
        设置 name 并使用 Label 添加组标题。每个选项由 FormControl 和 Radio 组成，Radio
        自动继承组名。
      </template>
      <ComponentDocsDemoBlock :code="codes.basic">
        <div class="examples">
          <RadioGroup name="group-plan" @change="onPlanChange">
            <RadioGroup.Label>选择计划</RadioGroup.Label>
            <FormControl>
              <Radio value="free" /><FormControl.Label>免费计划</FormControl.Label>
            </FormControl>
            <FormControl>
              <Radio value="pro" /><FormControl.Label>专业计划</FormControl.Label>
            </FormControl>
          </RadioGroup>
          <p class="info">最近选择：{{ plan ?? '未选择' }}</p>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="说明与校验">
      <template #description>
        使用 Caption 补充选择说明，使用 Validation 显示校验结果。校验提示会同时提供给辅助技术。
      </template>
      <ComponentDocsDemoBlock :code="codes.validation">
        <RadioGroup id="group-validation" name="group-frequency" @change="onFrequencyChange">
          <RadioGroup.Label>通知频率</RadioGroup.Label>
          <RadioGroup.Caption>选择接收更新的频率。</RadioGroup.Caption>
          <RadioGroup.Validation v-if="!frequency" variant="error">
            请选择一种频率。
          </RadioGroup.Validation>
          <FormControl>
            <Radio value="daily" /><FormControl.Label>每天</FormControl.Label
            ><FormControl.Caption>每天汇总一次更新。</FormControl.Caption>
          </FormControl>
          <FormControl>
            <Radio value="weekly" /><FormControl.Label>每周</FormControl.Label>
          </FormControl>
        </RadioGroup>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="禁用与必填标记">
      <template #description>
        disabled 禁用整组选项。required 在组标题上显示必填标记，选择校验由业务逻辑处理。
      </template>
      <ComponentDocsDemoBlock :code="codes.states">
        <div class="examples">
          <RadioGroup name="group-disabled" :disabled="disabled" required>
            <RadioGroup.Label>通知渠道</RadioGroup.Label>
            <FormControl>
              <Radio value="email" default-checked /><FormControl.Label>邮件</FormControl.Label>
            </FormControl>
            <FormControl>
              <Radio value="app" /><FormControl.Label>站内消息</FormControl.Label>
            </FormControl>
          </RadioGroup>
          <Button @click="disabled = !disabled">
            {{ disabled ? '启用整组' : '禁用整组' }}
          </Button>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="受控选项">
      <template #description>
        给每个 Radio 设置 checked，并在 RadioGroup 的 change 事件中更新当前值。
      </template>
      <ComponentDocsDemoBlock :code="codes.controlled">
        <div class="examples">
          <RadioGroup name="group-controlled" @change="onControlledChange">
            <RadioGroup.Label>受控选项</RadioGroup.Label>
            <FormControl>
              <Radio value="a" :checked="selected === 'a'" /><FormControl.Label
                >选项 A</FormControl.Label
              >
            </FormControl>
            <FormControl>
              <Radio value="b" :checked="selected === 'b'" /><FormControl.Label
                >选项 B</FormControl.Label
              >
            </FormControl>
          </RadioGroup>
          <p class="info" aria-live="polite">当前值：{{ selected }}</p>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="隐藏标题与外部标签">
      <template #description>
        使用 visuallyHidden 隐藏组标题，同时保留可访问名称。已有外部标题时，可通过 aria-labelledby
        关联。
      </template>
      <ComponentDocsDemoBlock :code="codes.external">
        <div class="examples">
          <span id="external-group-label">外观偏好</span>
          <RadioGroup id="external-group" name="group-theme" aria-labelledby="external-group-label">
            <RadioGroup.Caption>选择显示外观。</RadioGroup.Caption>
            <FormControl>
              <Radio value="system" default-checked /><FormControl.Label
                >跟随系统</FormControl.Label
              >
            </FormControl>
            <FormControl>
              <Radio value="dark" /><FormControl.Label>深色</FormControl.Label>
            </FormControl>
          </RadioGroup>
          <RadioGroup name="group-hidden">
            <RadioGroup.Label visually-hidden> 隐藏标题的选项组 </RadioGroup.Label>
            <FormControl>
              <Radio value="one" /><FormControl.Label>可见选项</FormControl.Label>
            </FormControl>
          </RadioGroup>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="属性" variant="api">
      <Table :columns="columns" :data="rows" row-key="name" compact :hoverable="false" />
    </ComponentDocsSection>
    <ComponentDocsSection title="子组件" variant="api">
      <Table :columns="columns" :data="childRows" row-key="name" compact :hoverable="false" />
    </ComponentDocsSection>
    <ComponentDocsSection title="事件" variant="api">
      <Table :columns="columns" :data="eventRows" row-key="name" compact :hoverable="false" />
    </ComponentDocsSection>
    <ComponentDocsSection title="插槽" variant="api">
      <template #description>
        单项的属性与事件请参阅 <RouterLink to="/component/radio"> Radio 文档 </RouterLink>。
      </template>
      <Table :columns="columns" :data="slotRows" row-key="name" compact :hoverable="false" />
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
const plan = ref<string | null>(null)
const frequency = ref<string | null>(null)
const disabled = ref(true)
const selected = ref('a')
function onPlanChange(value: string | null) {
  plan.value = value
}
function onFrequencyChange(value: string | null) {
  frequency.value = value
}
function onControlledChange(value: string | null) {
  selected.value = value ?? ''
}
const codes = {
  basic: `<RadioGroup name="plan" @change="onChange">
  <RadioGroup.Label>选择计划</RadioGroup.Label>
  <FormControl><Radio value="free" /><FormControl.Label>免费计划</FormControl.Label></FormControl>
  <FormControl><Radio value="pro" /><FormControl.Label>专业计划</FormControl.Label></FormControl>
</RadioGroup>`,
  validation: `<RadioGroup id="frequency" name="frequency">
  <RadioGroup.Label>通知频率</RadioGroup.Label>
  <RadioGroup.Caption>选择接收更新的频率。</RadioGroup.Caption>
  <RadioGroup.Validation variant="error">请选择一种频率。</RadioGroup.Validation>
  <FormControl><Radio value="daily" /><FormControl.Label>每天</FormControl.Label><FormControl.Caption>每天汇总一次更新。</FormControl.Caption></FormControl>
  <FormControl><Radio value="weekly" /><FormControl.Label>每周</FormControl.Label></FormControl>
</RadioGroup>`,
  states: `<RadioGroup name="channel" disabled required>
  <RadioGroup.Label>通知渠道</RadioGroup.Label>
  <FormControl><Radio value="email" default-checked /><FormControl.Label>邮件</FormControl.Label></FormControl>
  <FormControl><Radio value="app" /><FormControl.Label>站内消息</FormControl.Label></FormControl>
</RadioGroup>`,
  controlled: `<script setup lang="ts">
import { ref } from 'vue'
const selected = ref('a')
function onChange(value: string | null) { selected.value = value ?? '' }
<\/script>
<template>
  <RadioGroup name="controlled" @change="onChange">
    <RadioGroup.Label>受控选项</RadioGroup.Label>
    <FormControl><Radio value="a" :checked="selected === 'a'" /><FormControl.Label>选项 A</FormControl.Label></FormControl>
    <FormControl><Radio value="b" :checked="selected === 'b'" /><FormControl.Label>选项 B</FormControl.Label></FormControl>
  </RadioGroup>
</template>`,
  external: `<span id="theme-label">外观偏好</span>
<RadioGroup id="theme" name="theme" aria-labelledby="theme-label">
  <RadioGroup.Caption>选择显示外观。</RadioGroup.Caption>
  <FormControl><Radio value="system" default-checked /><FormControl.Label>跟随系统</FormControl.Label></FormControl>
  <FormControl><Radio value="dark" /><FormControl.Label>深色</FormControl.Label></FormControl>
</RadioGroup>`,
}
const columns: TableColumn[] = [
  { key: 'name', label: '名称', rowHeader: true },
  { key: 'type', label: '类型', wrap: true },
  { key: 'description', label: '说明', wrap: true },
]
const rows = [
  { name: 'name', type: 'string（必填）', description: '子 Radio 的默认 name' },
  {
    name: 'disabled',
    type: 'boolean，默认 false',
    description: '禁用整组选项',
  },
  {
    name: 'required',
    type: 'boolean，默认 false',
    description: '显示组级必填标记，选择校验由业务逻辑处理',
  },
  {
    name: 'id',
    type: 'string',
    description: '生成辅助说明及校验提示的关联标识，未设置时自动生成',
  },
  { name: 'aria-labelledby', type: 'string', description: '没有 Label 时关联外部组标题' },
  { name: 'class / className', type: 'string', description: '为选项组添加自定义样式类' },
]
const childRows = [
  {
    name: 'RadioGroup.Label',
    type: 'visuallyHidden?: boolean; className?: string',
    description: '组标题；必填时显示 *，支持视觉隐藏',
  },
  {
    name: 'RadioGroup.Caption',
    type: 'className?: string',
    description: '组级辅助说明，自动关联到选项组',
  },
  {
    name: 'RadioGroup.Validation',
    type: "variant: 'error' | 'success'",
    description: '在选项组下方显示校验提示和状态图标',
  },
]
const eventRows = [
  {
    name: 'change',
    type: '(value: string | null, event: Event) => void',
    description: '选择选项时触发，返回选项值和原生事件；先于单项 change 触发',
  },
]
const slotRows = [
  { name: 'default', type: '—', description: '放置 Label、Caption、Validation 及单选框选项' },
]
</script>

<style scoped>
.examples {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: start;
}
.info {
  margin: 0;
  color: var(--fgColor-muted, #59636e);
  font-size: 14px;
  line-height: 1.5;
}
</style>
