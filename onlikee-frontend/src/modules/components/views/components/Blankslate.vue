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
      <VisuallyHidden :id="`${documentationId}-api-table-0`"
        >Blankslate 空状态 Blankslate Props</VisuallyHidden
      >
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-0`"
        :columns="apiTableColumns"
        :data="rootPropsRows"
      />

      <h3>Blankslate.Heading Props</h3>
      <VisuallyHidden :id="`${documentationId}-api-table-1`"
        >Blankslate 空状态 Blankslate.Heading Props</VisuallyHidden
      >
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-1`"
        :columns="apiTableColumns"
        :data="headingPropsRows"
      />

      <h3>Blankslate.PrimaryAction Props</h3>
      <VisuallyHidden :id="`${documentationId}-api-table-2`"
        >Blankslate 空状态 Blankslate.PrimaryAction Props</VisuallyHidden
      >
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-2`"
        :columns="apiTableColumns"
        :data="primaryActionPropsRows"
      />

      <h3>Blankslate.SecondaryAction Props</h3>
      <VisuallyHidden :id="`${documentationId}-api-table-3`"
        >Blankslate 空状态 Blankslate.SecondaryAction Props</VisuallyHidden
      >
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-3`"
        :columns="apiTableColumns"
        :data="secondaryActionPropsRows"
      />
      <p>
        容器的原生属性、style 和事件传给外层 div；className 与 Vue class 合并到内层。Visual、Heading
        和 Description 的原生属性及类名传给各自根元素。
      </p>

      <h3>插槽</h3>
      <VisuallyHidden :id="`${documentationId}-api-table-4`">Blankslate 空状态 插槽</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-4`"
        :columns="slotTableColumns"
        :data="slotTableRows"
      />

      <h3>事件</h3>
      <VisuallyHidden :id="`${documentationId}-api-table-5`">Blankslate 空状态 事件</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-5`"
        :columns="eventTableColumns"
        :data="eventTableRows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { useId as useDocumentationId } from 'vue'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'

import { Blankslate } from '@/components/primer-vue/Blankslate'
import {
  BookIcon,
  ChecklistIcon,
  CodeOfConductIcon,
  InboxIcon,
  RepoIcon,
} from '@onlikee/octicons-vue'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const documentationId = useDocumentationId()

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

const apiTableColumns: DocumentationColumn[] = [
  { field: 'name', header: '属性名', rowHeader: true, minWidth: '150px' },
  { field: 'default', header: '默认值', minWidth: '120px' },
  { field: 'type', header: '类型', minWidth: '260px' },
  { field: 'description', header: '说明', minWidth: '260px' },
]

const rootPropsRows = [
  {
    id: 'border',
    name: 'border',
    default: 'false',
    type: 'boolean',
    description: '是否显示边框。',
  },
  {
    id: 'narrow',
    name: 'narrow',
    default: 'false',
    type: 'boolean',
    description: '将最大宽度限制为 485px，不改变 size。',
  },
  {
    id: 'spacious',
    name: 'spacious',
    default: 'false',
    type: 'boolean',
    description: '是否增加上下留白。',
  },
  {
    id: 'size',
    name: 'size',
    default: "'medium'",
    type: "'small' | 'medium' | 'large'",
    description: '控制留白、排版与操作间距，窄容器使用响应式规则。',
  },
]

const headingPropsRows = [
  {
    id: 'as',
    name: 'as',
    default: "'h2'",
    type: "'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'",
    description: '设置标题渲染的语义标签。',
  },
]

const primaryActionPropsRows = [
  {
    id: 'href',
    name: 'href',
    default: '—',
    type: 'string',
    description: '可选；非空地址渲染为链接。链接模式的公开属性仅含 href。',
  },
  {
    id: 'type',
    name: 'type',
    default: "'button'",
    type: "'button' | 'submit' | 'reset'",
    description: '按钮模式的原生按钮类型，默认值来自 Button。',
  },
  {
    id: 'disabled',
    name: 'disabled',
    default: '—',
    type: 'boolean',
    description: '按钮模式支持禁用及其他原生按钮属性。',
  },
]
const secondaryActionPropsRows = [
  {
    id: 'href',
    name: 'href',
    default: '必填',
    type: 'string',
    description: '次要操作始终为链接，仅接受 href 和默认插槽。',
  },
]

const slotTableColumns: DocumentationColumn[] = [
  { field: 'name', header: '插槽名', rowHeader: true, minWidth: '180px' },
  { field: 'description', header: '说明', minWidth: '320px' },
]

const slotTableRows = [
  {
    id: 'Blankslate default',
    name: 'Blankslate default',
    description: '放置 Visual、Heading、Description 和 Action 子组件。',
  },
  {
    id: 'Visual default',
    name: 'Visual default',
    description: '视觉元素，通常放置 Octicon 或其他轻量图形。',
  },
  { id: 'Heading default', name: 'Heading default', description: '空状态主标题。' },
  { id: 'Description default', name: 'Description default', description: '空状态说明文本。' },
  { id: 'PrimaryAction default', name: 'PrimaryAction default', description: '主操作文案。' },
  { id: 'SecondaryAction default', name: 'SecondaryAction default', description: '次要操作文案。' },
]

const eventTableColumns: DocumentationColumn[] = [
  { field: 'name', header: '事件名', rowHeader: true, minWidth: '160px' },
  { field: 'description', header: '说明', minWidth: '300px' },
]

const eventTableRows = [
  {
    id: 'click',
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
