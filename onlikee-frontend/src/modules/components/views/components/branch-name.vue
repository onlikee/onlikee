<script setup lang="ts">
import { shallowRef } from 'vue'
import { RouterLink } from 'vue-router'
import { GitBranchIcon } from '@onlikee/octicons-vue'
import { BranchName } from '@/components/primer-vue/BranchName'
import { Stack } from '@/components/primer-vue/Stack'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const activations = shallowRef(0)
const basicCode = `<BranchName href="#">main</BranchName>
<BranchName>branch_without_href</BranchName>`
const rootCode = `<BranchName as="span">feature/new-page</BranchName>
<BranchName as="button" type="button" @click="handleClick">switch_branch</BranchName>
<BranchName :as="RouterLink" to="/component">main</BranchName>`
const contentCode = `<BranchName href="#">
  <Stack direction="horizontal" gap="condensed" align="center">
    <GitBranchIcon />
    branch_name
  </Stack>
</BranchName>`
const columns: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '140px' },
  { key: 'type', label: '类型', minWidth: '180px', wrap: true },
  { key: 'default', label: '默认值', minWidth: '100px' },
  { key: 'description', label: '说明', minWidth: '240px', wrap: true },
]
const rows = [
  {
    name: 'as',
    type: '原生标签 | Component',
    default: 'a',
    description: '指定根元素或自定义组件；非 a 元素使用弱化文字颜色',
  },
  {
    name: 'className',
    type: 'string',
    default: '—',
    description: '与组件类名合并，Vue class 属性也会合并到根元素',
  },
  {
    name: '原生或组件属性',
    type: '由 as 决定',
    default: '—',
    description: 'href、ARIA、style、事件等直接透传；不自动设置 href、target、rel 或按钮 type',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="BranchName 分支名"
      description="以等宽字体和背景色显示分支名，支持链接及自定义根元素。"
    />
    <ComponentDocsSection title="基础用法">
      <template #description>
        默认渲染 a，href 可选。没有 href 的 a 保持链接文字颜色，但不会获得原生链接的跳转和 Tab
        焦点行为。
      </template>
      <ComponentDocsDemoBlock :code="basicCode">
        <div class="branch-row">
          <BranchName href="#">main</BranchName>
          <BranchName>branch_without_href</BranchName>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="自定义根元素">
      <template #description>
        span、button 等非 a
        元素使用弱化颜色。按钮行为由原生属性和事件决定，组件不增加额外语义或标签限制。
      </template>
      <ComponentDocsDemoBlock :code="rootCode">
        <div class="branch-row">
          <BranchName as="span">feature/new-page</BranchName>
          <BranchName as="button" type="button" @click="activations += 1">switch_branch</BranchName>
          <BranchName :as="RouterLink" to="/component">main</BranchName>
        </div>
        <p>按钮激活次数：{{ activations }}</p>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="组合内容">
      <template #description>默认插槽接受文本和其他节点；图标、复制按钮等由调用方组合。</template>
      <ComponentDocsDemoBlock :code="contentCode">
        <BranchName href="#">
          <Stack direction="horizontal" gap="condensed" align="center">
            <GitBranchIcon />
            branch_name
          </Stack>
        </BranchName>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="API" variant="api">
      <template #description>
        导出 BranchNameProps&lt;As&gt;。React children 对应默认插槽；组件 ref 的 element
        在原生标签下为对应 DOM 元素，在自定义组件下为组件公开实例，卸载后为 null。事件采用 Vue
        的原生事件类型。
      </template>
      <Table :columns="columns" :data="rows" row-key="name" compact :hoverable="false" />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.branch-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}
</style>
