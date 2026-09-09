<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Blankslate 空状态"
      description="用于在内容缺失时说明原因，并引导用户继续下一步操作。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        使用 <code>Blankslate</code> 作为容器，并通过 <code>Visual</code>、<code>Heading</code>、<code>Description</code> 和 <code>PrimaryAction</code> 组合空状态内容。
      </template>

      <ComponentDocsDemoBlock :code="basicDemoCode">
        <Blankslate>
          <Blankslate.Visual>
            <BookIcon />
          </Blankslate.Visual>
          <Blankslate.Heading>
            欢迎来到知识库
          </Blankslate.Heading>
          <Blankslate.Description>
            知识库可以帮助团队沉淀路线图、项目状态和协作文档。
          </Blankslate.Description>
          <Blankslate.PrimaryAction>
            创建第一页
          </Blankslate.PrimaryAction>
        </Blankslate>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="次要操作">
      <template #description>
        次要操作以文本链接呈现，适合放置文档、指南或更多说明。
      </template>

      <ComponentDocsDemoBlock :code="secondaryDemoCode">
        <Blankslate>
          <Blankslate.Visual>
            <RepoIcon />
          </Blankslate.Visual>
          <Blankslate.Heading>
            还没有仓库内容
          </Blankslate.Heading>
          <Blankslate.Description>
            创建第一个文件后，团队成员就可以开始提交和协作。
          </Blankslate.Description>
          <Blankslate.PrimaryAction>
            新建文件
          </Blankslate.PrimaryAction>
          <Blankslate.SecondaryAction href="https://docs.github.com">
            了解仓库协作
          </Blankslate.SecondaryAction>
        </Blankslate>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="窄版">
      <template #description>
        设置 <code>narrow</code> 后会收窄最大宽度，并降低间距和字号，适合侧栏、弹层或较窄容器。
      </template>

      <ComponentDocsDemoBlock :code="narrowDemoCode">
        <div class="blankslate-narrow-demo">
          <Blankslate narrow>
            <Blankslate.Visual>
              <ChecklistIcon />
            </Blankslate.Visual>
            <Blankslate.Heading as="h3">
              暂无任务
            </Blankslate.Heading>
            <Blankslate.Description>
              新任务会显示在这里，方便你快速跟进。
            </Blankslate.Description>
            <Blankslate.PrimaryAction>
              添加任务
            </Blankslate.PrimaryAction>
          </Blankslate>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="宽松版">
      <template #description>
        设置 <code>spacious</code> 后会增加上下留白，适合页面主体区域的首屏空状态。
      </template>

      <ComponentDocsDemoBlock :code="spaciousDemoCode">
        <Blankslate spacious>
          <Blankslate.Visual>
            <CodeOfConductIcon />
          </Blankslate.Visual>
          <Blankslate.Heading>
            创建社区准则
          </Blankslate.Heading>
          <Blankslate.Description>
            社区准则可以帮助参与者理解协作边界，并建立更清晰的贡献预期。
          </Blankslate.Description>
          <Blankslate.PrimaryAction>
            添加准则
          </Blankslate.PrimaryAction>
        </Blankslate>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="带边框">
      <template #description>
        设置 <code>border</code> 后会显示边框，用于页面中同时存在其他内容、需要明确结构边界的场景。
      </template>

      <ComponentDocsDemoBlock :code="borderDemoCode">
        <Blankslate border>
          <Blankslate.Visual>
            <InboxIcon />
          </Blankslate.Visual>
          <Blankslate.Heading>
            暂无消息
          </Blankslate.Heading>
          <Blankslate.Description>
            有新的系统通知或协作消息时，会优先显示在这里。
          </Blankslate.Description>
          <Blankslate.PrimaryAction>
            刷新消息
          </Blankslate.PrimaryAction>
        </Blankslate>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection
      title="API"
      variant="api"
    >
      <h3>Blankslate Props</h3>
      <Table
        :columns="apiTableColumns"
        :data="rootPropsRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h3>Blankslate.Heading Props</h3>
      <Table
        :columns="apiTableColumns"
        :data="headingPropsRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h3>Action Props</h3>
      <Table
        :columns="apiTableColumns"
        :data="actionPropsRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h3>插槽</h3>
      <Table
        :columns="slotTableColumns"
        :data="slotTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h3>事件</h3>
      <Table
        :columns="eventTableColumns"
        :data="eventTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { Blankslate } from '@/components/primer-vue/Blankslate'
import { BookIcon, ChecklistIcon, CodeOfConductIcon, InboxIcon, RepoIcon } from '@/components/octicons-vue3'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const basicDemoCode = `<script setup lang="ts">
import { Blankslate } from '@/components/primer-vue/Blankslate'
import { BookIcon } from '@/components/octicons-vue3'
<\/script>

<template>
  <Blankslate>
    <Blankslate.Visual>
      <BookIcon />
    </Blankslate.Visual>
    <Blankslate.Heading>欢迎来到知识库</Blankslate.Heading>
    <Blankslate.Description>
      知识库可以帮助团队沉淀路线图、项目状态和协作文档。
    </Blankslate.Description>
    <Blankslate.PrimaryAction>创建第一页</Blankslate.PrimaryAction>
  </Blankslate>
</template>`

const secondaryDemoCode = `<script setup lang="ts">
import { Blankslate } from '@/components/primer-vue/Blankslate'
import { RepoIcon } from '@/components/octicons-vue3'
<\/script>

<template>
  <Blankslate>
    <Blankslate.Visual>
      <RepoIcon />
    </Blankslate.Visual>
    <Blankslate.Heading>还没有仓库内容</Blankslate.Heading>
    <Blankslate.Description>
      创建第一个文件后，团队成员就可以开始提交和协作。
    </Blankslate.Description>
    <Blankslate.PrimaryAction>新建文件</Blankslate.PrimaryAction>
    <Blankslate.SecondaryAction href="https://docs.github.com">
      了解仓库协作
    </Blankslate.SecondaryAction>
  </Blankslate>
</template>`

const narrowDemoCode = `<script setup lang="ts">
import { Blankslate } from '@/components/primer-vue/Blankslate'
import { ChecklistIcon } from '@/components/octicons-vue3'
<\/script>

<template>
  <div class="blankslate-narrow-demo">
    <Blankslate narrow>
      <Blankslate.Visual>
        <ChecklistIcon />
      </Blankslate.Visual>
      <Blankslate.Heading as="h3">暂无任务</Blankslate.Heading>
      <Blankslate.Description>
        新任务会显示在这里，方便你快速跟进。
      </Blankslate.Description>
      <Blankslate.PrimaryAction>添加任务</Blankslate.PrimaryAction>
    </Blankslate>
  </div>
</template>

<style scoped>
.blankslate-narrow-demo {
  max-width: 360px;
  margin-inline: auto;
  width: 100%;
}
</style>`

const spaciousDemoCode = `<script setup lang="ts">
import { Blankslate } from '@/components/primer-vue/Blankslate'
import { CodeOfConductIcon } from '@/components/octicons-vue3'
<\/script>

<template>
  <Blankslate spacious>
    <Blankslate.Visual>
      <CodeOfConductIcon />
    </Blankslate.Visual>
    <Blankslate.Heading>创建社区准则</Blankslate.Heading>
    <Blankslate.Description>
      社区准则可以帮助参与者理解协作边界，并建立更清晰的贡献预期。
    </Blankslate.Description>
    <Blankslate.PrimaryAction>添加准则</Blankslate.PrimaryAction>
  </Blankslate>
</template>`

const borderDemoCode = `<script setup lang="ts">
import { Blankslate } from '@/components/primer-vue/Blankslate'
import { InboxIcon } from '@/components/octicons-vue3'
<\/script>

<template>
  <Blankslate border>
    <Blankslate.Visual>
      <InboxIcon />
    </Blankslate.Visual>
    <Blankslate.Heading>暂无消息</Blankslate.Heading>
    <Blankslate.Description>
      有新的系统通知或协作消息时，会优先显示在这里。
    </Blankslate.Description>
    <Blankslate.PrimaryAction>刷新消息</Blankslate.PrimaryAction>
  </Blankslate>
</template>`

const apiTableColumns: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '150px' },
  { key: 'default', label: '默认值', minWidth: '120px' },
  { key: 'type', label: '类型', minWidth: '260px', wrap: true },
  { key: 'description', label: '说明', minWidth: '260px', wrap: true }
]

const rootPropsRows = [
  {
    name: 'border',
    default: 'false',
    type: 'boolean',
    description: '是否显示边框。'
  },
  {
    name: 'narrow',
    default: 'false',
    type: 'boolean',
    description: '是否使用窄版布局。'
  },
  {
    name: 'spacious',
    default: 'false',
    type: 'boolean',
    description: '是否增加上下留白。'
  },
  {
    name: 'size',
    default: "'medium'",
    type: "'small' | 'medium' | 'large'",
    description: '控制整体尺寸、最大宽度、间距和字号。'
  }
]

const headingPropsRows = [
  {
    name: 'as',
    default: "'h2'",
    type: "'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'",
    description: '设置标题渲染的语义标签。'
  }
]

const actionPropsRows = [
  {
    name: 'href',
    default: "''",
    type: 'string',
    description: '设置后渲染为链接，否则渲染为按钮。'
  },
  {
    name: 'newTab',
    default: 'false',
    type: 'boolean',
    description: '链接是否在新标签页打开。'
  },
  {
    name: 'type',
    default: "'button'",
    type: "'button' | 'submit' | 'reset'",
    description: '无 href 时透传给原生按钮。'
  },
  {
    name: 'disabled',
    default: 'false',
    type: 'boolean',
    description: '是否禁用操作。'
  }
]

const slotTableColumns: TableColumn[] = [
  { key: 'name', label: '插槽名', rowHeader: true, minWidth: '180px' },
  { key: 'description', label: '说明', minWidth: '320px', wrap: true }
]

const slotTableRows = [
  { name: 'Blankslate default', description: '放置 Visual、Heading、Description 和 Action 子组件。' },
  { name: 'Visual default', description: '视觉元素，通常放置 Octicon 或其他轻量图形。' },
  { name: 'Heading default', description: '空状态主标题。' },
  { name: 'Description default', description: '空状态说明文本。' },
  { name: 'PrimaryAction default', description: '主操作文案。' },
  { name: 'SecondaryAction default', description: '次要操作文案。' }
]

const eventTableColumns: TableColumn[] = [
  { key: 'name', label: '事件名', rowHeader: true, minWidth: '160px' },
  { key: 'description', label: '说明', minWidth: '300px', wrap: true }
]

const eventTableRows = [
  {
    name: 'click',
    description: 'PrimaryAction 和 SecondaryAction 在无 href 且未禁用时触发。'
  }
]
</script>

<style scoped>
.blankslate-narrow-demo {
  margin-inline: auto;
  max-width: 360px;
  width: 100%;
}
</style>
