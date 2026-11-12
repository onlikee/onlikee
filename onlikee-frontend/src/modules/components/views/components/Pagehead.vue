<script setup lang="ts">
import { useId } from 'vue'
import { Pagehead } from '@/components/primer-vue/Pagehead'
import { Heading } from '@/components/primer-vue/Heading'
import { Button } from '@/components/primer-vue/Button'
import { Breadcrumbs, BreadcrumbsItem } from '@/components/primer-vue/Breadcrumbs'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'
import ComponentDocsTable, {
  type DocumentationColumn,
  type DocumentationRow,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsDemoBlock from '../../components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '../../components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '../../components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '../../components/ComponentDocsPage/ComponentDocsSection.vue'

const documentationId = useId()
const codes = {
  basic: `<script setup lang="ts">
import { Pagehead } from '@/components/primer-vue/Pagehead'
import { Heading } from '@/components/primer-vue/Heading'
<\/script>

<template>
  <Pagehead>
    <Heading as="h2" variant="small">Pagehead</Heading>
  </Pagehead>
</template>`,
  semantics: `<Pagehead as="header" aria-labelledby="repository-title">
  <Heading id="repository-title" as="h2" variant="small">仓库概览</Heading>
</Pagehead>`,
  composition: `<Pagehead as="header" aria-labelledby="project-title">
  <Breadcrumbs aria-label="项目路径">
    <BreadcrumbsItem href="#projects">Projects</BreadcrumbsItem>
    <BreadcrumbsItem selected>onlikee</BreadcrumbsItem>
  </Breadcrumbs>
  <div class="pagehead-row">
    <Heading id="project-title" as="h2" variant="small">onlikee</Heading>
    <Button>新建议</Button>
  </div>
</Pagehead>

<style scoped>
.pagehead-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
}
</style>`,
  custom: `<Pagehead
  as="section"
  class-name="compact-pagehead"
  aria-label="搜索结果"
  :style="{ paddingTop: 8, paddingBottom: 8, marginBottom: 0 }"
>
  <Heading as="h2" variant="small">搜索结果</Heading>
</Pagehead>`,
}
const columns: DocumentationColumn[] = [
  { field: 'name', header: '名称', rowHeader: true },
  { field: 'type', header: '类型' },
  { field: 'default', header: '默认值' },
  { field: 'description', header: '说明' },
]
const rows: DocumentationRow[] = [
  {
    id: 'as',
    name: 'as',
    type: '原生元素名 | Component',
    default: 'div',
    description: '设置根元素或组件。原生 HTML 属性仍采用 div 的公共类型合同。',
  },
  {
    id: 'className',
    name: 'className',
    type: 'string',
    default: '—',
    description: '附加样式类，与内置类和 Vue class 合并。',
  },
]
const slotRows: DocumentationRow[] = [
  {
    id: 'default',
    name: 'default',
    type: '—',
    default: '—',
    description: '页头内容，支持 Heading、导航、操作按钮和普通元素，无插槽参数。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Pagehead 页头（已弃用）"
      description="保留 Primer React 已弃用 Pagehead 的基础页头容器，用于维护现有页面。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        Pagehead 已弃用。它默认渲染 div，提供相对定位、上下 24px 内边距、24px
        下外边距和底部分隔线；标题内容由默认插槽中的 Heading 提供。
      </template>
      <ComponentDocsDemoBlock :code="codes.basic">
        <div class="demo-width">
          <Pagehead><Heading as="h2" variant="small">Pagehead</Heading></Pagehead>
          <p class="demo-content">页头下方的页面内容。</p>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="语义化根元素">
      <template #description>
        通过 as 更换根元素；组件不会自动添加标题、role 或 ARIA 关联。需要命名时，可使用
        aria-labelledby 关联内部标题。as 也接受 Vue 组件。
      </template>
      <ComponentDocsDemoBlock :code="codes.semantics">
        <Pagehead
          as="header"
          class="demo-width"
          :aria-labelledby="`${documentationId}-repository-title`"
        >
          <Heading :id="`${documentationId}-repository-title`" as="h2" variant="small">
            仓库概览
          </Heading>
        </Pagehead>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="组合导航、标题与操作">
      <template #description>
        Pagehead 不组织子组件的布局。示例通过页面自己的样式排列 Breadcrumbs、Heading 和
        Button，并在窄屏时允许操作行换行。
      </template>
      <ComponentDocsDemoBlock :code="codes.composition">
        <Pagehead
          as="header"
          class="demo-width"
          :aria-labelledby="`${documentationId}-project-title`"
        >
          <Breadcrumbs aria-label="项目路径">
            <BreadcrumbsItem href="#projects">Projects</BreadcrumbsItem>
            <BreadcrumbsItem selected>onlikee</BreadcrumbsItem>
          </Breadcrumbs>
          <div class="pagehead-row">
            <Heading :id="`${documentationId}-project-title`" as="h2" variant="small">
              onlikee
            </Heading>
            <Button>新建议</Button>
          </div>
        </Pagehead>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="自定义样式">
      <template #description>
        class、className、style、原生属性和事件会传给根元素。原生根的 style
        数字长度按像素处理；lineHeight 等无单位属性和 CSS 自定义属性保留原值。
      </template>
      <ComponentDocsDemoBlock :code="codes.custom">
        <Pagehead
          as="section"
          class="demo-width"
          class-name="compact-pagehead"
          aria-label="搜索结果"
          :style="{ paddingTop: 8, paddingBottom: 8, marginBottom: 0 }"
        >
          <Heading as="h2" variant="small">搜索结果</Heading>
        </Pagehead>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="属性" variant="api">
      <template #description>
        导出 Pagehead、PageheadOptions 和已标记 deprecated 的
        PageheadProps。默认导出与命名导出一致。 data-component 默认为
        Pagehead，可以由原生属性覆盖。组件没有自定义事件或额外实例方法。
      </template>
      <VisuallyHidden :id="`${documentationId}-props`">Pagehead 属性</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-props`"
        :columns="columns"
        :data="rows"
      />
    </ComponentDocsSection>

    <ComponentDocsSection title="插槽" variant="api">
      <VisuallyHidden :id="`${documentationId}-slots`">Pagehead 插槽</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-slots`"
        :columns="columns"
        :data="slotRows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.demo-width {
  width: 100%;
}

.demo-content {
  margin: 0;
  color: var(--fgColor-muted);
}

.pagehead-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
}
</style>
