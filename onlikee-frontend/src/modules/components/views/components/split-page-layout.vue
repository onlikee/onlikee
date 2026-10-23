<script setup lang="ts">
import { useId } from 'vue'
import { SplitPageLayout } from '@/components/primer-vue/SplitPageLayout'
import { NavList } from '@/components/primer-vue/NavList'
import { Heading } from '@/components/primer-vue/Heading'
import { Stack } from '@/components/primer-vue/Stack'
import { StateLabel } from '@/components/primer-vue/StateLabel'
import { Button } from '@/components/primer-vue/Button'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'

const documentationId = useId()
const basicCode = `<SplitPageLayout>
  <SplitPageLayout.Header><Heading as="h2">项目设置</Heading></SplitPageLayout.Header>
  <SplitPageLayout.Pane :sticky="false" aria-label="设置导航">
    <NavList aria-label="设置">
      <NavList.Item href="#profile" aria-current="page">个人资料</NavList.Item>
      <NavList.Item href="#notifications">通知</NavList.Item>
    </NavList>
  </SplitPageLayout.Pane>
  <SplitPageLayout.Content>
    <Stack gap="normal">
      <StateLabel status="issueOpened" size="small">Open</StateLabel>
      <p>管理项目的基本信息。</p>
      <Button>保存设置</Button>
    </Stack>
  </SplitPageLayout.Content>
  <SplitPageLayout.Footer>设置会应用于当前项目。</SplitPageLayout.Footer>
</SplitPageLayout>`
const resizeCode = `<SplitPageLayout>
  <SplitPageLayout.Sidebar :hidden="{ narrow: true, regular: false }">
    跨越页头、正文和页脚的侧边栏
  </SplitPageLayout.Sidebar>
  <SplitPageLayout.Header>调整布局</SplitPageLayout.Header>
  <SplitPageLayout.Pane resizable :sticky="false" width-storage-key="split-docs-pane" aria-label="可调整导航">
    拖动分隔线，或聚焦手柄后使用方向键调整宽度。
  </SplitPageLayout.Pane>
  <SplitPageLayout.Content>正文</SplitPageLayout.Content>
  <SplitPageLayout.Footer>页脚</SplitPageLayout.Footer>
</SplitPageLayout>`
const columns: DocumentationColumn[] = [
  { field: 'name', header: '组件', rowHeader: true },
  { field: 'default', header: '默认值' },
  { field: 'description', header: '说明' },
]
const rows = [
  {
    id: 'root',
    name: 'SplitPageLayout',
    default: 'containerWidth=full，padding/columnGap/rowGap=none',
    description: '通过 className/class 设置根布局样式。',
  },
  {
    id: 'header',
    name: 'Header / Footer',
    default: 'padding=normal，divider=line',
    description: '沿用 PageLayout.Header / Footer 的属性。',
  },
  {
    id: 'content',
    name: 'Content',
    default: 'width=large，padding=normal',
    description: '沿用 PageLayout.Content，支持 as、hidden 与可访问名称。',
  },
  {
    id: 'pane',
    name: 'Pane',
    default: 'position=start，sticky=true，padding=normal，divider=line',
    description: '沿用 PageLayout.Pane，支持响应式位置、隐藏、分隔线和受控/非受控宽度调整。',
  },
  {
    id: 'sidebar',
    name: 'Sidebar',
    default: 'position=start，padding=normal，divider=line',
    description: '沿用 PageLayout.Sidebar，跨越页头和页脚；支持宽度调整和 fullscreen 窄屏布局。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="SplitPageLayout 分栏页面布局"
      description="复用 PageLayout 的页面区域，以无外边距、带分隔线的默认样式组织导航和正文。"
    />
    <ComponentDocsSection title="与导航、状态标签和按钮组合">
      <template #description
        >区域作为直接子组件传入。Pane 默认固定在滚动区域；演示中关闭
        sticky，以适应嵌入式预览。</template
      >
      <ComponentDocsDemoBlock :code="basicCode">
        <div class="layout-preview">
          <SplitPageLayout>
            <SplitPageLayout.Header><Heading as="h2">项目设置</Heading></SplitPageLayout.Header>
            <SplitPageLayout.Pane :sticky="false" aria-label="设置导航">
              <NavList aria-label="设置">
                <NavList.Item href="#profile" aria-current="page">个人资料</NavList.Item>
                <NavList.Item href="#notifications">通知</NavList.Item>
              </NavList>
            </SplitPageLayout.Pane>
            <SplitPageLayout.Content>
              <Stack gap="normal">
                <StateLabel status="issueOpened" size="small">Open</StateLabel>
                <p>管理项目的基本信息。</p>
                <Button>保存设置</Button>
              </Stack>
            </SplitPageLayout.Content>
            <SplitPageLayout.Footer>设置会应用于当前项目。</SplitPageLayout.Footer>
          </SplitPageLayout>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="可调整宽度与响应式 Sidebar">
      <template #description
        >Sidebar 跨越整个布局；768px 以下隐藏。Pane
        的分隔手柄支持拖动、方向键和双击重置，宽度保存在本地。</template
      >
      <ComponentDocsDemoBlock :code="resizeCode">
        <div class="layout-preview">
          <SplitPageLayout>
            <SplitPageLayout.Sidebar :hidden="{ narrow: true, regular: false }"
              >跨越页头、正文和页脚的侧边栏</SplitPageLayout.Sidebar
            >
            <SplitPageLayout.Header>调整布局</SplitPageLayout.Header>
            <SplitPageLayout.Pane
              resizable
              :sticky="false"
              width-storage-key="split-docs-pane"
              aria-label="可调整导航"
              >拖动分隔线，或聚焦手柄后使用方向键调整宽度。</SplitPageLayout.Pane
            >
            <SplitPageLayout.Content>正文</SplitPageLayout.Content>
            <SplitPageLayout.Footer>页脚</SplitPageLayout.Footer>
          </SplitPageLayout>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="API" variant="api">
      <VisuallyHidden :id="`${documentationId}-api`">SplitPageLayout API</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api`"
        :columns="columns"
        :data="rows"
      />
      <p>
        所有区域均使用默认插槽承载内容；与 PageLayout 对应区域共享插槽标记，也支持通过 asSlot
        创建的包装组件。
      </p>
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.layout-preview {
  width: 100%;
  border: 1px solid var(--borderColor-default);
  border-radius: var(--borderRadius-medium);
  overflow: auto;
}
</style>
