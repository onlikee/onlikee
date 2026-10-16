<script setup lang="ts">
import { CounterLabel } from '@/components/primer-vue/CounterLabel'
import { DataTable, type DataTableColumn } from '@/components/primer-vue/DataTable'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const basicCode = `<script setup lang="ts">
import { CounterLabel } from '@/components/primer-vue/CounterLabel'
<\/script>

<template>
  <span>Issues <CounterLabel>12</CounterLabel></span>
</template>`
const variantsCode = `<CounterLabel variant="primary">12</CounterLabel>
<CounterLabel variant="secondary">12</CounterLabel>`
const contentCode = `<span>Open issues <CounterLabel>0</CounterLabel></span>
<span>Stars <CounterLabel>12K</CounterLabel></span>`
const columns: DataTableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '140px' },
  { key: 'type', label: '类型', minWidth: '180px', wrap: true },
  { key: 'default', label: '默认值', minWidth: '100px' },
  { key: 'description', label: '说明', minWidth: '240px', wrap: true },
]
const rows = [
  {
    name: 'variant',
    type: 'primary | secondary',
    default: 'secondary',
    description: 'primary 使用较深背景和反色文字；secondary 使用较浅背景和默认文字颜色。',
  },
  {
    name: 'scheme',
    type: 'primary | secondary',
    default: '—',
    description: '已弃用，请使用 variant。未指定 variant 时才使用 scheme。',
  },
  {
    name: 'className',
    type: 'string',
    default: '—',
    description: '与组件类名合并，Vue class 属性也合并到可见 span。',
  },
  {
    name: 'data-component',
    type: 'string',
    default: 'CounterLabel',
    description: '可覆盖可见 span 的组件标记；空字符串会保留。',
  },
  {
    name: '原生 span 属性',
    type: 'HTMLAttributes',
    default: '—',
    description:
      'id、style、ARIA、data-* 和原生事件透传到可见 span，可覆盖 aria-hidden 和 data-variant。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="CounterLabel 计数标签"
      description="在文本旁显示简短计数，并为屏幕阅读器提供带括号的计数文本。"
    />
    <ComponentDocsSection title="基础用法">
      <template #description>
        默认使用 secondary 外观。可见计数设置 aria-hidden="true"，相邻的 VisuallyHidden
        输出不换行空格与括号中的计数，使文本读作 Issues (12)。
      </template>
      <ComponentDocsDemoBlock :code="basicCode">
        <span>Issues <CounterLabel>12</CounterLabel></span>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="外观">
      <template #description
        >variant 优先于已弃用的 scheme；两者均未指定时使用 secondary。</template
      >
      <ComponentDocsDemoBlock :code="variantsCode">
        <div class="counter-row">
          <CounterLabel variant="primary">12</CounterLabel>
          <CounterLabel variant="secondary">12</CounterLabel>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="计数内容">
      <template #description>
        默认插槽接受数字文本或格式化字符串，组件不自动缩写数值。0 正常显示；没有内容时，CSS
        隐藏空的可见 span，隐藏文本仍保留括号。
      </template>
      <ComponentDocsDemoBlock :code="contentCode">
        <div class="counter-row">
          <span>Open issues <CounterLabel>0</CounterLabel></span>
          <span>Stars <CounterLabel>12K</CounterLabel></span>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="API" variant="api">
      <template #description>
        导出 CounterLabelProps 和 CounterLabelInstance。React children
        对应默认插槽，内容同时出现在可见 span
        和隐藏标签内。组件没有额外根容器；属性、类名与事件只应用到可见 span。组件 ref 的 element
        指向该 HTMLSpanElement，卸载后为 null。组件不添加焦点或键盘行为，事件使用 Vue 原生事件类型。
      </template>
      <DataTable :columns="columns" :data="rows" row-key="name" compact :hoverable="false" />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.counter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}
</style>
