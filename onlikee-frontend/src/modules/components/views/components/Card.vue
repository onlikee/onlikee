<script setup lang="ts">
import { useId as useDocumentationId } from 'vue'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'

import { shallowRef } from 'vue'
import {
  RepoIcon,
  RocketIcon,
  PeopleIcon,
  StarIcon,
  KebabHorizontalIcon,
} from '@onlikee/octicons-vue'
import { Card } from '@/components/primer-vue/Card'
import { ActionMenu } from '@/components/primer-vue/ActionMenu'
import { ActionList } from '@/components/primer-vue/ActionList'
import { IconButton } from '@/components/primer-vue/Button'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const documentationId = useDocumentationId()

const selectedAction = shallowRef('尚未选择操作')
const basicCode = `<script setup lang="ts">
import { Card } from '@/components/primer-vue/Card'
import { RocketIcon, PeopleIcon } from '@onlikee/octicons-vue'
<\/script>

<template>
  <Card>
    <Card.Icon :icon="RocketIcon" />
    <Card.Heading>项目路线图</Card.Heading>
    <Card.Description>集中查看计划、进展和团队协作信息。</Card.Description>
    <Card.Metadata><PeopleIcon />3 位贡献者</Card.Metadata>
  </Card>
</template>`
const compactCode = `<Card layout="compact">
  <Card.Icon :icon="RepoIcon" />
  <Card.Heading>onlikee/primer-vue</Card.Heading>
  <Card.Description>紧凑布局使用更小的标题与间距，图标不带背景容器。</Card.Description>
  <Card.Metadata><StarIcon />1.2k stars</Card.Metadata>
</Card>`
const imageCode = `<Card>
  <Card.Image src="https://github.com/octocat.png" alt="Octocat" />
  <Card.Heading>带图片的卡片</Card.Heading>
  <Card.Description>图片延伸到卡片边缘，同时提供图片和图标时优先显示图片。</Card.Description>
</Card>`
const actionCode = `<script setup lang="ts">
import { Card } from '@/components/primer-vue/Card'
import { ActionMenu } from '@/components/primer-vue/ActionMenu'
import { ActionList } from '@/components/primer-vue/ActionList'
import { IconButton } from '@/components/primer-vue/Button'
import { KebabHorizontalIcon } from '@onlikee/octicons-vue'
<\/script>

<template>
  <Card>
    <Card.Heading>项目 Alpha</Card.Heading>
    <Card.Description>通过右上角的菜单执行卡片操作。</Card.Description>
    <Card.Action>
      <ActionMenu>
        <ActionMenu.Anchor>
          <IconButton :icon="KebabHorizontalIcon" aria-label="项目 Alpha 的更多操作" variant="invisible" />
        </ActionMenu.Anchor>
        <ActionMenu.Overlay>
          <ActionList>
            <ActionList.Item>收藏</ActionList.Item>
            <ActionList.Item>关注</ActionList.Item>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </Card.Action>
  </Card>
</template>`
const sectionCode = `<Card as="section">
  <Card.Heading as="h2">独立区域</Card.Heading>
  <Card.Description>标题自动关联到 section 的 aria-labelledby。</Card.Description>
</Card>

<ul aria-label="项目列表">
  <li><Card><Card.Heading>项目 Alpha</Card.Heading></Card></li>
  <li><Card><Card.Heading>项目 Beta</Card.Heading></Card></li>
</ul>`
const appearanceCode = `<Card padding="condensed" border-radius="medium">
  <Card.Heading>紧凑留白</Card.Heading>
  <Card.Description>内边距与圆角分别独立控制。</Card.Description>
</Card>
<Card padding="none"><div style="padding: 16px">自定义内容</div></Card>`
const apiColumns: DocumentationColumn[] = [
  { field: 'name', header: '属性', rowHeader: true, minWidth: '140px' },
  { field: 'type', header: '类型', minWidth: '200px' },
  { field: 'default', header: '默认值', minWidth: '100px' },
  { field: 'description', header: '说明', minWidth: '240px' },
]
const rootRows = [
  {
    id: 'as',
    name: 'as',
    type: "'div' | 'section'",
    default: 'div',
    description: '独立卡片可使用 section；列表中的卡片使用 div。',
  },
  {
    id: 'padding',
    name: 'padding',
    type: "'none' | 'condensed' | 'normal'",
    default: 'normal',
    description: '控制内边距；compact 布局的 normal 留白更小。',
  },
  {
    id: 'borderRadius',
    name: 'borderRadius',
    type: "'medium' | 'large'",
    default: 'large',
    description: '控制卡片圆角。',
  },
  {
    id: 'layout',
    name: 'layout',
    type: "'default' | 'compact'",
    default: 'default',
    description: '纵向布局或横向紧凑布局。',
  },
  {
    id: 'className',
    name: 'className',
    type: 'string',
    default: '—',
    description: '与 Vue class 合并；原生属性与事件传给根元素。',
  },
  {
    id: 'default 插槽',
    name: 'default 插槽',
    type: 'VNode',
    default: '—',
    description: '组合子组件或提供自定义内容；无内容时不渲染。',
  },
]
const childRows = [
  {
    id: 'Icon.icon',
    name: 'Icon.icon',
    type: 'Component | string',
    default: '必填',
    description: 'Octicon 或自定义 SVG 组件，也可使用原生元素名称。',
  },
  {
    id: 'Icon.aria-label',
    name: 'Icon.aria-label',
    type: 'string',
    default: '—',
    description: '有名称时使用 role="img"；无名称时作为装饰图标。',
  },
  {
    id: 'Image.src',
    name: 'Image.src',
    type: 'string',
    default: '必填',
    description: '图片地址，支持原生 img 属性。',
  },
  {
    id: 'Image.alt',
    name: 'Image.alt',
    type: 'string',
    default: "''",
    description: '图片替代文本，默认作为装饰图片。',
  },
  {
    id: 'Heading.as',
    name: 'Heading.as',
    type: "'h2' | 'h3' | 'h4' | 'h5' | 'h6'",
    default: 'h3',
    description: '标题层级；section 自动生成关联 ID。',
  },
  {
    id: 'Heading.id',
    name: 'Heading.id',
    type: 'string',
    default: '自动生成或无',
    description: '自定义 ID 时需同时为 Card 设置 aria-labelledby。',
  },
  {
    id: 'Description',
    name: 'Description',
    type: 'default 插槽',
    default: '—',
    description: '渲染 p，内容应为段落内的文本或行内元素。',
  },
  {
    id: 'Metadata',
    name: 'Metadata',
    type: 'default 插槽',
    default: '—',
    description: '底部元数据，可组合文字、图标和其他组件。',
  },
  {
    id: 'Action',
    name: 'Action',
    type: 'default 插槽',
    default: '—',
    description: '右上角操作，只接受插槽内容；操作的名称应包含卡片上下文。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Card 卡片"
      description="用于组合图标、图片、标题、描述、元数据和操作的内容容器。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description
        >使用 Card.*
        子组件组合内容，组件会自动按图标、标题、描述、元数据、操作的结构排列。</template
      >
      <ComponentDocsDemoBlock :code="basicCode">
        <div class="card-demo">
          <Card>
            <Card.Icon :icon="RocketIcon" />
            <Card.Heading>项目路线图</Card.Heading>
            <Card.Description>集中查看计划、进展和团队协作信息。</Card.Description>
            <Card.Metadata><PeopleIcon />3 位贡献者</Card.Metadata>
          </Card>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="紧凑布局">
      <ComponentDocsDemoBlock :code="compactCode">
        <div class="card-demo">
          <Card layout="compact">
            <Card.Icon :icon="RepoIcon" />
            <Card.Heading>onlikee/primer-vue</Card.Heading>
            <Card.Description>紧凑布局使用更小的标题与间距，图标不带背景容器。</Card.Description>
            <Card.Metadata><StarIcon />1.2k stars</Card.Metadata>
          </Card>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="图片">
      <template #description
        >图片优先于图标显示；边缘延伸样式沿用源码固定的 spacious 留白计算。</template
      >
      <ComponentDocsDemoBlock :code="imageCode">
        <div class="card-demo">
          <Card>
            <Card.Image src="https://github.com/octocat.png" alt="Octocat" />
            <Card.Heading>带图片的卡片</Card.Heading>
            <Card.Description
              >图片延伸到卡片边缘，同时提供图片和图标时优先显示图片。</Card.Description
            >
          </Card>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="操作菜单">
      <template #description>操作名称包含卡片名称，方便用户区分多张卡片中的操作。</template>
      <ComponentDocsDemoBlock :code="actionCode">
        <div class="card-demo">
          <Card>
            <Card.Heading>项目 Alpha</Card.Heading>
            <Card.Description>通过右上角的菜单执行卡片操作。</Card.Description>
            <Card.Action>
              <ActionMenu>
                <ActionMenu.Anchor>
                  <IconButton
                    :icon="KebabHorizontalIcon"
                    aria-label="项目 Alpha 的更多操作"
                    variant="invisible"
                  />
                </ActionMenu.Anchor>
                <ActionMenu.Overlay>
                  <ActionList>
                    <ActionList.Item @select="selectedAction = '已收藏项目 Alpha'"
                      >收藏</ActionList.Item
                    >
                    <ActionList.Item @select="selectedAction = '已关注项目 Alpha'"
                      >关注</ActionList.Item
                    >
                  </ActionList>
                </ActionMenu.Overlay>
              </ActionMenu>
            </Card.Action>
          </Card>
          <p role="status">{{ selectedAction }}</p>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="独立区域与列表">
      <template #description>独立卡片使用 section 并自动关联标题；列表卡片保留默认 div。</template>
      <ComponentDocsDemoBlock :code="sectionCode">
        <div class="card-demo">
          <Card as="section">
            <Card.Heading as="h2">独立区域</Card.Heading>
            <Card.Description>标题自动关联到 section 的 aria-labelledby。</Card.Description>
          </Card>
          <ul class="card-list" aria-label="项目列表">
            <li>
              <Card><Card.Heading>项目 Alpha</Card.Heading></Card>
            </li>
            <li>
              <Card><Card.Heading>项目 Beta</Card.Heading></Card>
            </li>
          </ul>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="留白、圆角与自定义内容">
      <template #description
        >使用子组件时每类只保留最后一个，其他内容被忽略；完全自定义内容请放入不含直接 Card.*
        子组件的默认插槽。</template
      >
      <ComponentDocsDemoBlock :code="appearanceCode">
        <div class="card-demo">
          <Card padding="condensed" border-radius="medium">
            <Card.Heading>紧凑留白</Card.Heading>
            <Card.Description>内边距与圆角分别独立控制。</Card.Description>
          </Card>
          <Card padding="none"><div style="padding: 16px">自定义内容</div></Card>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="API" variant="api">
      <h3>Card Props</h3>
      <VisuallyHidden :id="`${documentationId}-api-table-0`">Card 卡片 Card Props</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-0`"
        :columns="apiColumns"
        :data="rootRows"
      />
      <h3>子组件</h3>
      <VisuallyHidden :id="`${documentationId}-api-table-1`">Card 卡片 子组件</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-1`"
        :columns="apiColumns"
        :data="childRows"
      />
      <p>
        子组件也可独立导入
        CardIcon、CardImage、CardHeading、CardDescription、CardAction、CardMetadata。
      </p>
      <p>
        Heading、Description、Metadata 支持原生属性和 className；Icon 支持 className 和 Vue
        class。根组件及 Heading、Description、Metadata 的 ref 通过 element 暴露 DOM 元素。
      </p>
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.card-demo {
  display: grid;
  gap: var(--stack-gap-normal);
  width: 100%;
  max-width: 400px;
}

.card-list {
  display: grid;
  gap: var(--stack-gap-normal);
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
