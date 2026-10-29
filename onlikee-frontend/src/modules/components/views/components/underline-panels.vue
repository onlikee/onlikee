<script setup lang="ts">
import { useId as useDocumentationId } from 'vue'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'

import { h, shallowRef } from 'vue'
import { UnderlinePanels } from '@/components/primer-vue/UnderlinePanels'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import { CodeIcon, IssueOpenedIcon } from '@onlikee/octicons-vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const documentationId = useDocumentationId()

import { AnchoredOverlay } from '@/components/primer-vue/AnchoredOverlay'
import { Button } from '@/components/primer-vue/Button'
import type { AnchorRenderProps } from '@/components/primer-vue/AnchoredOverlay'
import TabsActionListExample from '../../components/TabsActionListExample.vue'
import actionListCode from '../../components/TabsActionListExample.vue?raw'

const open = shallowRef(false)
const renderAnchor = (props: AnchorRenderProps) =>
  h(Button, props, { default: () => 'Select ref type' })
const overlayCode = `<script setup lang="ts">
import { h, shallowRef } from 'vue'
import { AnchoredOverlay, type AnchorRenderProps } from '@/components/primer-vue/AnchoredOverlay'
import { Button } from '@/components/primer-vue/Button'
import { UnderlinePanels } from '@/components/primer-vue/UnderlinePanels'

const open = shallowRef(false)
const renderAnchor = (props: AnchorRenderProps) => h(Button, props, { default: () => 'Select ref type' })
<\/script>

<template>
  <AnchoredOverlay :open="open" :render-anchor="renderAnchor" :focus-zone-settings="{ disabled: true }"
    @open="open = true" @close="open = false">
    <div style="display: flex; flex-direction: column; width: 320px">
      <UnderlinePanels aria-label="Ref type">
        <UnderlinePanels.Tab>Branches</UnderlinePanels.Tab>
        <UnderlinePanels.Tab>Tags</UnderlinePanels.Tab>
        <UnderlinePanels.Panel>Branch panel</UnderlinePanels.Panel>
        <UnderlinePanels.Panel>Tag panel</UnderlinePanels.Panel>
      </UnderlinePanels>
    </div>
  </AnchoredOverlay>
</template>`

const selected = shallowRef('code')

const basicCode = `<script setup lang="ts">
import { shallowRef } from 'vue'
import { UnderlinePanels } from '@/components/primer-vue/UnderlinePanels'
import { CodeIcon, IssueOpenedIcon } from '@onlikee/octicons-vue'

const selected = shallowRef('code')
<\/script>

<template>
  <div style="display: flex; flex-direction: column; width: 100%">
  <UnderlinePanels v-model:value="selected" aria-label="Repository sections">
    <UnderlinePanels.Tab value="code" :icon="CodeIcon">Code</UnderlinePanels.Tab>
    <UnderlinePanels.Tab value="issues" :icon="IssueOpenedIcon" :counter="12">Issues</UnderlinePanels.Tab>
    <UnderlinePanels.Panel value="code">Repository files</UnderlinePanels.Panel>
    <UnderlinePanels.Panel value="issues">Open issues</UnderlinePanels.Panel>
  </UnderlinePanels>
  </div>
</template>`

const manualCode = `<template>
  <div style="display: flex; flex-direction: column; width: 100%">
  <UnderlinePanels aria-label="Settings" activation-mode="manual" default-value="profile">
    <UnderlinePanels.Tab value="profile">Profile</UnderlinePanels.Tab>
    <UnderlinePanels.Tab value="security">Security</UnderlinePanels.Tab>
    <UnderlinePanels.Panel value="profile">Profile settings</UnderlinePanels.Panel>
    <UnderlinePanels.Panel value="security">Security settings</UnderlinePanels.Panel>
  </UnderlinePanels>
  </div>
</template>`

const columns: DocumentationColumn[] = [
  { field: 'name', header: '属性名', rowHeader: true, minWidth: '150px' },
  { field: 'type', header: '类型', minWidth: '200px' },
  { field: 'default', header: '默认值', minWidth: '100px' },
  { field: 'description', header: '说明' },
]

const rootRows = [
  {
    id: 'value / v-model:value',
    name: 'value / v-model:value',
    type: 'string',
    default: '—',
    description: '受控选中值；Tab 与 Panel 用相同 value 配对。',
  },
  {
    id: 'defaultValue',
    name: 'defaultValue',
    type: 'string',
    default: '首项',
    description: '非受控模式的初始选中值。',
  },
  {
    id: 'activationMode',
    name: 'activationMode',
    type: 'automatic | manual',
    default: 'automatic',
    description: '方向键移动焦点时是否立即切换面板。',
  },
  {
    id: 'loadingCounters',
    name: 'loadingCounters',
    type: 'boolean',
    default: 'false',
    description: '统一显示计数加载状态。',
  },
  {
    id: 'id',
    name: 'id',
    type: 'string',
    default: '自动生成',
    description: 'Tab 与 Panel 关联 ID 的前缀。',
  },
  {
    id: 'as',
    name: 'as',
    type: 'string | Component',
    default: 'div',
    description: '选项卡列表的容器元素。',
  },
  {
    id: 'change',
    name: 'change',
    type: '{ value: string }',
    default: '—',
    description: '选中值改变时触发。',
  },
]

const tabRows = [
  {
    id: 'value',
    name: 'value',
    type: 'string',
    default: '按位置配对',
    description: '与 Panel 的 value 对应。',
  },
  {
    id: 'counter',
    name: 'counter',
    type: 'number | string',
    default: '—',
    description: '标签后的计数。',
  },
  {
    id: 'icon',
    name: 'icon',
    type: 'Component',
    default: '—',
    description: '标签前的图标组件。',
  },
  {
    id: 'select',
    name: 'select',
    type: 'event',
    default: '—',
    description: '点击或按 Enter、Space 时触发。',
  },
]

const panelRows = [
  {
    id: 'value',
    name: 'value',
    type: 'string',
    default: '按位置配对',
    description: '与 Tab 的 value 对应；选中时显示面板。',
  },
  { id: 'default', name: 'default', type: 'slot', default: '—', description: '面板内容。' },
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
        <div class="panels-example">
          <UnderlinePanels v-model:value="selected" aria-label="Repository sections">
            <UnderlinePanels.Tab value="code" :icon="CodeIcon"> Code </UnderlinePanels.Tab>
            <UnderlinePanels.Tab value="issues" :counter="12" :icon="IssueOpenedIcon">
              Issues
            </UnderlinePanels.Tab>
            <UnderlinePanels.Panel value="code"> Repository files </UnderlinePanels.Panel>
            <UnderlinePanels.Panel value="issues"> Open issues </UnderlinePanels.Panel>
          </UnderlinePanels>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="手动激活">
      <template #description> 方向键只移动焦点，按 Enter 或 Space 才切换面板。 </template>
      <ComponentDocsDemoBlock :code="manualCode">
        <div class="panels-example">
          <UnderlinePanels aria-label="Settings" activation-mode="manual" default-value="profile">
            <UnderlinePanels.Tab value="profile"> Profile </UnderlinePanels.Tab>
            <UnderlinePanels.Tab value="security"> Security </UnderlinePanels.Tab>
            <UnderlinePanels.Panel value="profile"> Profile settings </UnderlinePanels.Panel>
            <UnderlinePanels.Panel value="security"> Security settings </UnderlinePanels.Panel>
          </UnderlinePanels>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="浮层内组合">
      <template #description
        >关闭 AnchoredOverlay 的 focus zone，由标签列表管理自己的 roving
        tabindex；浮层仍处理焦点约束、Escape 和焦点返回。</template
      >
      <ComponentDocsDemoBlock :code="overlayCode">
        <AnchoredOverlay
          :open="open"
          :render-anchor="renderAnchor"
          :focus-zone-settings="{ disabled: true }"
          @open="open = true"
          @close="open = false"
        >
          <div class="panels-example" style="width: 320px">
            <UnderlinePanels aria-label="Ref type">
              <UnderlinePanels.Tab>Branches</UnderlinePanels.Tab>
              <UnderlinePanels.Tab>Tags</UnderlinePanels.Tab>
              <UnderlinePanels.Panel>Branch panel</UnderlinePanels.Panel>
              <UnderlinePanels.Panel>Tag panel</UnderlinePanels.Panel>
            </UnderlinePanels>
          </div>
        </AnchoredOverlay>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="Tabs 与 ActionList 组合">
      <template #description
        >UnderlinePanels 使用无样式 Tabs 的共享逻辑。自定义外观时，可将 useTabList、useTab 和
        useTabPanel 返回的 computed 属性绑定到 ActionList
        等组件；纵向列表使用上下方向键，跳过禁用项。</template
      >
      <ComponentDocsDemoBlock :code="actionListCode"
        ><TabsActionListExample
      /></ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="API" variant="api">
      <h3>UnderlinePanels</h3>
      <VisuallyHidden :id="`${documentationId}-api-table-0`"
        >UnderlinePanels 下划线选项卡 UnderlinePanels</VisuallyHidden
      >
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-0`"
        :columns="columns"
        :data="rootRows"
      />
      <h3>UnderlinePanels.Tab</h3>
      <VisuallyHidden :id="`${documentationId}-api-table-1`"
        >UnderlinePanels 下划线选项卡 UnderlinePanels.Tab</VisuallyHidden
      >
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-1`"
        :columns="columns"
        :data="tabRows"
      />
      <h3>UnderlinePanels.Panel</h3>
      <VisuallyHidden :id="`${documentationId}-api-table-2`"
        >UnderlinePanels 下划线选项卡 UnderlinePanels.Panel</VisuallyHidden
      >
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-2`"
        :columns="columns"
        :data="panelRows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.panels-example {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
