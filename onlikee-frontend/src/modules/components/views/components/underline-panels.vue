<script setup lang="ts">
import { shallowRef } from 'vue'
import { UnderlinePanels } from '@/components/primer-vue/UnderlinePanels'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import { CodeIcon, IssueOpenedIcon } from '@/components/octicons-vue3'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const selected = shallowRef('code')

const basicCode = `<script setup lang="ts">
import { shallowRef } from 'vue'
import { UnderlinePanels } from '@/components/primer-vue/UnderlinePanels'
import { CodeIcon, IssueOpenedIcon } from '@/components/octicons-vue3'

const selected = shallowRef('code')
<\/script>

<template>
  <UnderlinePanels v-model:value="selected" aria-label="Repository sections">
    <UnderlinePanels.Tab value="code" :leading-visual="CodeIcon">Code</UnderlinePanels.Tab>
    <UnderlinePanels.Tab value="issues" :leading-visual="IssueOpenedIcon" :counter="12">Issues</UnderlinePanels.Tab>
    <UnderlinePanels.Panel value="code">Repository files</UnderlinePanels.Panel>
    <UnderlinePanels.Panel value="issues">Open issues</UnderlinePanels.Panel>
  </UnderlinePanels>
</template>`

const manualCode = `<template>
  <UnderlinePanels aria-label="Settings" activation-mode="manual" default-value="profile">
    <UnderlinePanels.Tab value="profile">Profile</UnderlinePanels.Tab>
    <UnderlinePanels.Tab value="security">Security</UnderlinePanels.Tab>
    <UnderlinePanels.Panel value="profile">Profile settings</UnderlinePanels.Panel>
    <UnderlinePanels.Panel value="security">Security settings</UnderlinePanels.Panel>
  </UnderlinePanels>
</template>`

const columns: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '150px' },
  { key: 'type', label: '类型', minWidth: '200px' },
  { key: 'default', label: '默认值', minWidth: '100px' },
  { key: 'description', label: '说明', wrap: true }
]

const rootRows = [
  { name: 'value / v-model:value', type: 'string', default: '—', description: '受控选中值；Tab 与 Panel 用相同 value 配对。' },
  { name: 'defaultValue', type: 'string', default: '首项', description: '非受控模式的初始选中值。' },
  { name: 'activationMode', type: 'automatic | manual', default: 'automatic', description: '方向键移动焦点时是否立即切换面板。' },
  { name: 'loadingCounters', type: 'boolean', default: 'false', description: '统一显示计数加载状态。' },
  { name: 'id', type: 'string', default: '自动生成', description: 'Tab 与 Panel 关联 ID 的前缀。' },
  { name: 'as', type: 'string', default: 'div', description: '选项卡列表的容器元素。' },
  { name: 'change', type: '{ value: string }', default: '—', description: '选中值改变时触发。' }
]

const tabRows = [
  { name: 'value', type: 'string', default: '按位置配对', description: '与 Panel 的 value 对应。' },
  { name: 'counter', type: 'number | string', default: '—', description: '标签后的计数。' },
  { name: 'leadingVisual', type: 'Component', default: '—', description: '标签前的图标组件。' },
  { name: 'select', type: 'event', default: '—', description: '点击或按 Enter、Space 时触发。' }
]

const panelRows = [
  { name: 'value', type: 'string', default: '按位置配对', description: '与 Tab 的 value 对应；选中时显示面板。' },
  { name: 'default', type: 'slot', default: '—', description: '面板内容。' }
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="UnderlinePanels 下划线选项卡"
      description="在同一区域切换关联的内容面板。"
    />

    <ComponentDocsSection title="受控选择">
      <ComponentDocsDemoBlock :code="basicCode">
        <UnderlinePanels
          v-model:value="selected"
          aria-label="Repository sections"
        >
          <UnderlinePanels.Tab
            value="code"
            :leading-visual="CodeIcon"
          >
            Code
          </UnderlinePanels.Tab>
          <UnderlinePanels.Tab
            value="issues"
            :counter="12"
            :leading-visual="IssueOpenedIcon"
          >
            Issues
          </UnderlinePanels.Tab>
          <UnderlinePanels.Panel value="code">
            Repository files
          </UnderlinePanels.Panel>
          <UnderlinePanels.Panel value="issues">
            Open issues
          </UnderlinePanels.Panel>
        </UnderlinePanels>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="手动激活">
      <template #description>
        方向键只移动焦点，按 Enter 或 Space 才切换面板。
      </template>
      <ComponentDocsDemoBlock :code="manualCode">
        <UnderlinePanels
          aria-label="Settings"
          activation-mode="manual"
          default-value="profile"
        >
          <UnderlinePanels.Tab value="profile">
            Profile
          </UnderlinePanels.Tab>
          <UnderlinePanels.Tab value="security">
            Security
          </UnderlinePanels.Tab>
          <UnderlinePanels.Panel value="profile">
            Profile settings
          </UnderlinePanels.Panel>
          <UnderlinePanels.Panel value="security">
            Security settings
          </UnderlinePanels.Panel>
        </UnderlinePanels>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection
      title="API"
      variant="api"
    >
      <h3>UnderlinePanels</h3>
      <Table
        :columns="columns"
        :data="rootRows"
        row-key="name"
        compact
        :hoverable="false"
      />
      <h3>UnderlinePanels.Tab</h3>
      <Table
        :columns="columns"
        :data="tabRows"
        row-key="name"
        compact
        :hoverable="false"
      />
      <h3>UnderlinePanels.Panel</h3>
      <Table
        :columns="columns"
        :data="panelRows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>
