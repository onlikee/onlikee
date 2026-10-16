<script setup lang="ts">
import { ButtonGroup } from '@/components/primer-vue/ButtonGroup'
import { Button, IconButton } from '@/components/primer-vue/Button'
import { PlusIcon, DashIcon } from '@onlikee/octicons-vue'
import { DataTable, type DataTableColumn } from '@/components/primer-vue/DataTable'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const basicCode = `<ButtonGroup>
  <Button>Left</Button>
  <Button>Middle</Button>
  <Button>Right</Button>
</ButtonGroup>`
const toolbarCode = `<ButtonGroup role="toolbar" aria-label="编辑操作">
  <Button>Undo</Button>
  <Button disabled>Redo</Button>
  <Button>Save</Button>
</ButtonGroup>`
const iconCode = `<ButtonGroup aria-label="缩放操作">
  <IconButton :icon="PlusIcon" aria-label="放大" />
  <IconButton :icon="DashIcon" aria-label="缩小" />
</ButtonGroup>`
const loadingCode = `<ButtonGroup>
  <Button loading>Loading</Button>
  <Button as="a" href="/component">Link</Button>
  <Button>Action</Button>
</ButtonGroup>`
const columns: DataTableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '140px' },
  { key: 'type', label: '类型', minWidth: '160px', wrap: true },
  { key: 'default', label: '默认值', minWidth: '100px' },
  { key: 'description', label: '说明', minWidth: '240px', wrap: true },
]
const rows = [
  {
    name: 'as',
    type: '原生标签 | Component',
    default: 'div',
    description: '指定根元素或自定义组件',
  },
  {
    name: 'role',
    type: 'string',
    default: '—',
    description: '仅 toolbar 启用左右方向键导航，并在首尾循环',
  },
  {
    name: 'className',
    type: 'string',
    default: '—',
    description: '合并根元素类名，也支持 Vue class',
  },
  {
    name: '原生或组件属性',
    type: '由 as 决定',
    default: '—',
    description: 'ARIA、id、style 和事件传给根元素；组件不设置默认 role 或标签',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="ButtonGroup 按钮组"
      description="将相邻按钮或链接组合为连续的操作区域。"
    />
    <ComponentDocsSection title="基础用法">
      <template #description>每个默认插槽子项都会包在独立的 div 中，首尾项保留外侧圆角。</template>
      <ComponentDocsDemoBlock :code="basicCode">
        <ButtonGroup
          ><Button>Left</Button><Button>Middle</Button><Button>Right</Button></ButtonGroup
        >
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="工具栏键盘导航">
      <template #description>
        role="toolbar" 时，Tab
        进入一个活动项，左右方向键在可聚焦项之间循环，并跳过禁用按钮。普通按钮组保留各项原生 Tab
        行为，不启用方向键导航。
      </template>
      <ComponentDocsDemoBlock :code="toolbarCode">
        <ButtonGroup role="toolbar" aria-label="编辑操作">
          <Button>Undo</Button><Button disabled>Redo</Button><Button>Save</Button>
        </ButtonGroup>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="图标按钮">
      <template #description
        >使用 IconButton 的可访问名称及 Tooltip 行为，组内包装层不替换按钮组件。</template
      >
      <ComponentDocsDemoBlock :code="iconCode">
        <ButtonGroup aria-label="缩放操作">
          <IconButton :icon="PlusIcon" aria-label="放大" />
          <IconButton :icon="DashIcon" aria-label="缩小" />
        </ButtonGroup>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="加载状态和链接">
      <ComponentDocsDemoBlock :code="loadingCode">
        <ButtonGroup>
          <Button loading>Loading</Button><Button as="a" href="/component">Link</Button
          ><Button>Action</Button>
        </ButtonGroup>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="API" variant="api">
      <template #description>
        默认插槽提供组内子项。导出 ButtonGroupProps；原生属性由 as 推导。组件 ref 的 element
        为实际根元素或自定义组件公开实例，卸载后为 null。自定义根组件需要最终提供 HTMLElement
        才能启用工具栏焦点导航。
      </template>
      <DataTable :columns="columns" :data="rows" row-key="name" compact :hoverable="false" />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>
