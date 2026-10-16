<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Blankslate 空状态"
      description="用于在内容缺失时说明原因，并引导用户继续下一步操作。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        使用 <code>Blankslate</code> 作为容器，并通过
        <code>Visual</code>、<code>Heading</code>、<code>Description</code> 和
        <code>PrimaryAction</code> 组合空状态内容。
      </template>

      <ComponentDocsDemoBlock :code="basicDemoCode">
        <div class="blankslate-demo">
          <Blankslate>
            <Blankslate.Visual>
              <BookIcon aria-hidden="true" />
            </Blankslate.Visual>
            <Blankslate.Heading> 欢迎来到知识库 </Blankslate.Heading>
            <Blankslate.Description>
              知识库可以帮助团队沉淀路线图、项目状态和协作文档。
            </Blankslate.Description>
            <Blankslate.PrimaryAction> 创建第一页 </Blankslate.PrimaryAction>
          </Blankslate>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="次要操作">
      <template #description> 次要操作以文本链接呈现，适合放置文档、指南或更多说明。 </template>

      <ComponentDocsDemoBlock :code="secondaryDemoCode">
        <div class="blankslate-demo">
          <Blankslate>
            <Blankslate.Visual>
              <RepoIcon aria-hidden="true" />
            </Blankslate.Visual>
            <Blankslate.Heading> 还没有仓库内容 </Blankslate.Heading>
            <Blankslate.Description>
              创建第一个文件后，团队成员就可以开始提交和协作。
            </Blankslate.Description>
            <Blankslate.PrimaryAction> 新建文件 </Blankslate.PrimaryAction>
            <Blankslate.SecondaryAction href="https://docs.github.com">
              了解仓库协作
            </Blankslate.SecondaryAction>
          </Blankslate>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="窄版">
      <template #description>
        设置 <code>narrow</code> 后将最大宽度限制为 485px。容器宽度不超过 34rem
        时，字号、间距和留白由容器查询调整。
      </template>

      <ComponentDocsDemoBlock :code="narrowDemoCode">
        <div class="blankslate-narrow-demo">
          <Blankslate narrow>
            <Blankslate.Visual>
              <ChecklistIcon aria-hidden="true" />
            </Blankslate.Visual>
            <Blankslate.Heading as="h3"> 暂无任务 </Blankslate.Heading>
            <Blankslate.Description> 新任务会显示在这里，方便你快速跟进。 </Blankslate.Description>
            <Blankslate.PrimaryAction> 添加任务 </Blankslate.PrimaryAction>
          </Blankslate>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="宽松版">
      <template #description>
        设置 <code>spacious</code> 后会增加上下留白，适合页面主体区域的首屏空状态。
      </template>

      <ComponentDocsDemoBlock :code="spaciousDemoCode">
        <div class="blankslate-demo">
          <Blankslate spacious>
            <Blankslate.Visual>
              <CodeOfConductIcon aria-hidden="true" />
            </Blankslate.Visual>
            <Blankslate.Heading> 创建社区准则 </Blankslate.Heading>
            <Blankslate.Description>
              社区准则可以帮助参与者理解协作边界，并建立更清晰的贡献预期。
            </Blankslate.Description>
            <Blankslate.PrimaryAction> 添加准则 </Blankslate.PrimaryAction>
          </Blankslate>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="带边框">
      <template #description>
        设置 <code>border</code> 后会显示边框，用于页面中同时存在其他内容、需要明确结构边界的场景。
      </template>

      <ComponentDocsDemoBlock :code="borderDemoCode">
        <div class="blankslate-demo">
          <Blankslate border>
            <Blankslate.Visual>
              <InboxIcon aria-hidden="true" />
            </Blankslate.Visual>
            <Blankslate.Heading> 暂无消息 </Blankslate.Heading>
            <Blankslate.Description>
              有新的系统通知或协作消息时，会优先显示在这里。
            </Blankslate.Description>
            <Blankslate.PrimaryAction> 刷新消息 </Blankslate.PrimaryAction>
          </Blankslate>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="尺寸">
      <template #description>
        <code>size</code> 支持 small、medium 和 large；small
        的主操作使用小按钮，其余使用默认按钮尺寸。
      </template>
      <ComponentDocsDemoBlock :code="sizeDemoCode">
        <div class="blankslate-demo blankslate-sizes">
          <Blankslate v-for="size in sizes" :key="size" :size="size" border>
            <Blankslate.Visual><BookIcon aria-hidden="true" /></Blankslate.Visual>
            <Blankslate.Heading>{{ size }} 空状态</Blankslate.Heading>
            <Blankslate.Description>尺寸控制留白、排版与操作间距。</Blankslate.Description>
            <Blankslate.PrimaryAction>创建内容</Blankslate.PrimaryAction>
          </Blankslate>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="主操作链接与按钮">
      <template #description>
        主操作接受 href 时使用链接；按钮模式支持原生按钮属性和携带原生事件的 click
        监听。次要操作仅接受必填 href 和插槽内容。
      </template>
      <ComponentDocsDemoBlock :code="actionDemoCode">
        <div class="blankslate-demo">
          <Blankslate>
            <Blankslate.Heading>开始创建</Blankslate.Heading>
            <Blankslate.Description>打开文档或使用按钮执行页面操作。</Blankslate.Description>
            <Blankslate.PrimaryAction href="/component">查看组件文档</Blankslate.PrimaryAction>
            <Blankslate.SecondaryAction href="/component/guide"
              >阅读指南</Blankslate.SecondaryAction
            >
          </Blankslate>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="API" variant="api">
      <h3>Blankslate Props</h3>
      <DataTable
        :columns="apiTableColumns"
        :data="rootPropsRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h3>Blankslate.Heading Props</h3>
      <DataTable
        :columns="apiTableColumns"
        :data="headingPropsRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h3>Blankslate.PrimaryAction Props</h3>
      <DataTable
        :columns="apiTableColumns"
        :data="primaryActionPropsRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h3>Blankslate.SecondaryAction Props</h3>
      <DataTable
        :columns="apiTableColumns"
        :data="secondaryActionPropsRows"
        row-key="name"
        compact
        :hoverable="false"
      />
      <p>
        容器的原生属性、style 和事件传给外层 div；className 与 Vue class 合并到内层。Visual、Heading
        和 Description 的原生属性及类名传给各自根元素。
      </p>

      <h3>插槽</h3>
      <DataTable
        :columns="slotTableColumns"
        :data="slotTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h3>事件</h3>
      <DataTable
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
import {
  BookIcon,
  ChecklistIcon,
  CodeOfConductIcon,
  InboxIcon,
  RepoIcon,
} from '@onlikee/octicons-vue'
import { DataTable, type DataTableColumn } from '@/components/primer-vue/DataTable'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const basicDemoCode = `<script setup lang="ts">
import { Blankslate } from '@/components/primer-vue/Blankslate'
import { BookIcon } from '@onlikee/octicons-vue'
<\/script>

<template>
  <div class="blankslate-demo">
    <Blankslate>
      <Blankslate.Visual>
        <BookIcon aria-hidden="true" />
      </Blankslate.Visual>
      <Blankslate.Heading>欢迎来到知识库</Blankslate.Heading>
      <Blankslate.Description>
        知识库可以帮助团队沉淀路线图、项目状态和协作文档。
      </Blankslate.Description>
      <Blankslate.PrimaryAction>创建第一页</Blankslate.PrimaryAction>
    </Blankslate>
  </div>
</template>

<style scoped>
.blankslate-demo {
  width: 100%;
}
</style>`

const secondaryDemoCode = `<script setup lang="ts">
import { Blankslate } from '@/components/primer-vue/Blankslate'
import { RepoIcon } from '@onlikee/octicons-vue'
<\/script>

<template>
  <div class="blankslate-demo">
    <Blankslate>
      <Blankslate.Visual>
        <RepoIcon aria-hidden="true" />
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
  </div>
</template>

<style scoped>
.blankslate-demo {
  width: 100%;
}
</style>`

const narrowDemoCode = `<script setup lang="ts">
import { Blankslate } from '@/components/primer-vue/Blankslate'
import { ChecklistIcon } from '@onlikee/octicons-vue'
<\/script>

<template>
  <div class="blankslate-narrow-demo">
    <Blankslate narrow>
      <Blankslate.Visual>
        <ChecklistIcon aria-hidden="true" />
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
import { CodeOfConductIcon } from '@onlikee/octicons-vue'
<\/script>

<template>
  <div class="blankslate-demo">
    <Blankslate spacious>
      <Blankslate.Visual>
        <CodeOfConductIcon aria-hidden="true" />
      </Blankslate.Visual>
      <Blankslate.Heading>创建社区准则</Blankslate.Heading>
      <Blankslate.Description>
        社区准则可以帮助参与者理解协作边界，并建立更清晰的贡献预期。
      </Blankslate.Description>
      <Blankslate.PrimaryAction>添加准则</Blankslate.PrimaryAction>
    </Blankslate>
  </div>
</template>

<style scoped>
.blankslate-demo {
  width: 100%;
}
</style>`

const borderDemoCode = `<script setup lang="ts">
import { Blankslate } from '@/components/primer-vue/Blankslate'
import { InboxIcon } from '@onlikee/octicons-vue'
<\/script>

<template>
  <div class="blankslate-demo">
    <Blankslate border>
      <Blankslate.Visual>
        <InboxIcon aria-hidden="true" />
      </Blankslate.Visual>
      <Blankslate.Heading>暂无消息</Blankslate.Heading>
      <Blankslate.Description>
        有新的系统通知或协作消息时，会优先显示在这里。
      </Blankslate.Description>
      <Blankslate.PrimaryAction>刷新消息</Blankslate.PrimaryAction>
    </Blankslate>
  </div>
</template>

<style scoped>
.blankslate-demo {
  width: 100%;
}
</style>`

const sizes = ['small', 'medium', 'large'] as const
const sizeDemoCode = `<template>
  <div class="blankslate-demo">
    <Blankslate size="small" border>
      <Blankslate.Heading>小尺寸空状态</Blankslate.Heading>
      <Blankslate.Description>使用紧凑留白和小按钮。</Blankslate.Description>
      <Blankslate.PrimaryAction>创建内容</Blankslate.PrimaryAction>
    </Blankslate>
  </div>
  <!-- size="medium" 为默认尺寸，也支持 size="large" -->
</template>

<style scoped>
.blankslate-demo {
  width: 100%;
}
</style>`
const actionDemoCode = `<template>
  <div class="blankslate-demo">
    <Blankslate>
      <Blankslate.Heading>开始创建</Blankslate.Heading>
      <Blankslate.PrimaryAction href="/component">查看组件文档</Blankslate.PrimaryAction>
      <Blankslate.SecondaryAction href="/component/guide">阅读指南</Blankslate.SecondaryAction>
    </Blankslate>
  </div>
  <!-- 按钮模式：<Blankslate.PrimaryAction type="button" @click="handleClick">创建</Blankslate.PrimaryAction> -->
</template>

<style scoped>
.blankslate-demo {
  width: 100%;
}
</style>`

const apiTableColumns: DataTableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '150px' },
  { key: 'default', label: '默认值', minWidth: '120px' },
  { key: 'type', label: '类型', minWidth: '260px', wrap: true },
  { key: 'description', label: '说明', minWidth: '260px', wrap: true },
]

const rootPropsRows = [
  {
    name: 'border',
    default: 'false',
    type: 'boolean',
    description: '是否显示边框。',
  },
  {
    name: 'narrow',
    default: 'false',
    type: 'boolean',
    description: '将最大宽度限制为 485px，不改变 size。',
  },
  {
    name: 'spacious',
    default: 'false',
    type: 'boolean',
    description: '是否增加上下留白。',
  },
  {
    name: 'size',
    default: "'medium'",
    type: "'small' | 'medium' | 'large'",
    description: '控制留白、排版与操作间距，窄容器使用响应式规则。',
  },
]

const headingPropsRows = [
  {
    name: 'as',
    default: "'h2'",
    type: "'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'",
    description: '设置标题渲染的语义标签。',
  },
]

const primaryActionPropsRows = [
  {
    name: 'href',
    default: '—',
    type: 'string',
    description: '可选；非空地址渲染为链接。链接模式的公开属性仅含 href。',
  },
  {
    name: 'type',
    default: "'button'",
    type: "'button' | 'submit' | 'reset'",
    description: '按钮模式的原生按钮类型，默认值来自 Button。',
  },
  {
    name: 'disabled',
    default: '—',
    type: 'boolean',
    description: '按钮模式支持禁用及其他原生按钮属性。',
  },
]
const secondaryActionPropsRows = [
  {
    name: 'href',
    default: '必填',
    type: 'string',
    description: '次要操作始终为链接，仅接受 href 和默认插槽。',
  },
]

const slotTableColumns: DataTableColumn[] = [
  { key: 'name', label: '插槽名', rowHeader: true, minWidth: '180px' },
  { key: 'description', label: '说明', minWidth: '320px', wrap: true },
]

const slotTableRows = [
  {
    name: 'Blankslate default',
    description: '放置 Visual、Heading、Description 和 Action 子组件。',
  },
  { name: 'Visual default', description: '视觉元素，通常放置 Octicon 或其他轻量图形。' },
  { name: 'Heading default', description: '空状态主标题。' },
  { name: 'Description default', description: '空状态说明文本。' },
  { name: 'PrimaryAction default', description: '主操作文案。' },
  { name: 'SecondaryAction default', description: '次要操作文案。' },
]

const eventTableColumns: DataTableColumn[] = [
  { key: 'name', label: '事件名', rowHeader: true, minWidth: '160px' },
  { key: 'description', label: '说明', minWidth: '300px', wrap: true },
]

const eventTableRows = [
  {
    name: 'click',
    description:
      'PrimaryAction 按钮模式透传原生 MouseEvent；禁用按钮不激活。SecondaryAction 不提供 click 接口。',
  },
]
</script>

<style scoped>
.blankslate-demo {
  width: 100%;
}

.blankslate-narrow-demo {
  margin-inline: auto;
  max-width: 360px;
  width: 100%;
}

.blankslate-sizes {
  display: grid;
  gap: 1rem;
}
</style>
