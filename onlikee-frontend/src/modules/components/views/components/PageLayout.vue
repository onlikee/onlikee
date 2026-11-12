<script setup lang="ts">
import { shallowRef, useId } from 'vue'
import {
  PageLayout,
  PageLayoutHeader,
  PageLayoutContent,
  PageLayoutPane,
  PageLayoutSidebar,
  PageLayoutFooter,
} from '@/components/primer-vue/PageLayout'
import { Button } from '@/components/primer-vue/Button'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'

const documentationId = useId()
const currentWidth = shallowRef<number | undefined>(320)
const sidebarVisible = shallowRef(true)
const importCode = `import {
  PageLayout, PageLayoutHeader, PageLayoutContent,
  PageLayoutPane, PageLayoutSidebar, PageLayoutFooter,
} from '@/components/primer-vue/PageLayout'`
const basicCode = `<PageLayout>
  <PageLayoutHeader divider="line">页眉</PageLayoutHeader>
  <PageLayoutContent aria-label="主要内容">主要内容</PageLayoutContent>
  <PageLayoutPane position="end" divider="line">辅助面板</PageLayoutPane>
  <PageLayoutFooter divider="line">页脚</PageLayoutFooter>
</PageLayout>`
const responsiveCode = `<PageLayout container-width="full" padding="condensed" row-gap="condensed">
  <PageLayoutHeader :divider="{ narrow: 'filled', regular: 'line' }">响应式布局</PageLayoutHeader>
  <PageLayoutContent width="medium">主要内容</PageLayoutContent>
  <PageLayoutPane
    :position="{ narrow: 'end', regular: 'start' }"
    :hidden="{ narrow: false, wide: true }"
    :divider="{ narrow: 'filled', regular: 'line' }"
  >窄屏在下方，常规屏幕在左侧，宽屏隐藏</PageLayoutPane>
</PageLayout>`
const resizeCode = `<PageLayout>
  <PageLayoutContent>使用鼠标拖动分隔条，或聚焦后使用方向键每次调整 3px。</PageLayoutContent>
  <PageLayoutPane
    resizable
    :width="{ min: '200px', default: '320px', max: '600px' }"
    :current-width="currentWidth"
    :on-resize-end="(width) => { currentWidth = width }"
    aria-label="可调整的面板"
  >双击分隔条恢复到 320px。当前宽度 {{ currentWidth }}px。</PageLayoutPane>
</PageLayout>`
const sidebarCode = `<PageLayout container-width="full" padding="none">
  <PageLayoutSidebar
    :hidden="!sidebarVisible"
    width="small"
    divider="line"
    resizable
    width-storage-key="page-layout-docs-sidebar"
    aria-label="导航侧栏"
  >跨越页眉、正文和页脚的侧栏</PageLayoutSidebar>
  <PageLayoutHeader>页眉</PageLayoutHeader>
  <PageLayoutContent>主要内容</PageLayoutContent>
  <PageLayoutFooter>页脚</PageLayoutFooter>
</PageLayout>`
const columns: DocumentationColumn[] = [
  { field: 'name', header: '属性', rowHeader: true },
  { field: 'type', header: '类型' },
  { field: 'default', header: '默认值' },
  { field: 'description', header: '说明' },
]
const rootRows = [
  {
    id: 'containerWidth',
    name: 'containerWidth',
    type: "'full' | 'medium' | 'large' | 'xlarge'",
    default: 'xlarge',
    description: '容器最大宽度分别为 100%、768、1012、1280px。',
  },
  ...['padding', 'rowGap', 'columnGap'].map((name) => ({
    id: name,
    name,
    type: "'none' | 'condensed' | 'normal'",
    default: 'normal',
    description:
      name === 'padding'
        ? '容器内边距。condensed 16px；normal 在 1012px 起为 24px。'
        : '区域之间的行或列间距。',
  })),
]
const regionRows = [
  {
    id: 'padding',
    name: 'padding',
    type: "'none' | 'condensed' | 'normal'",
    default: 'none',
    description: '区域内部间距。',
  },
  {
    id: 'hidden',
    name: 'hidden',
    type: 'boolean | ResponsiveValue<boolean>',
    default: 'false',
    description: '通过 CSS 隐藏，保留组件状态。所有区域均支持。',
  },
  {
    id: 'divider',
    name: 'divider',
    type: "'none' | 'line' | ResponsiveValue<'none' | 'line', 'none' | 'line' | 'filled'>",
    default: 'none',
    description: 'Header、Footer、Pane 支持响应式分隔线；filled 仅供 narrow。',
  },
  {
    id: 'dividerWhenNarrow',
    name: 'dividerWhenNarrow',
    type: "'inherit' | 'none' | 'line' | 'filled'",
    default: 'inherit',
    description: '已弃用。请使用响应式 divider。',
  },
  {
    id: 'label',
    name: 'aria-label / aria-labelledby',
    type: 'string',
    default: '—',
    description:
      'Header、Content、Footer 的 landmark 名称；Pane、Sidebar 仅在内容溢出时变为可聚焦且有名称的 region。',
  },
  {
    id: 'as',
    name: 'Content.as',
    type: 'string | Component',
    default: 'main',
    description: 'Content 外层语义元素或 Vue 组件。',
  },
  {
    id: 'width',
    name: 'Content.width',
    type: "'full' | 'medium' | 'large' | 'xlarge'",
    default: 'full',
    description: '正文最大宽度。',
  },
]
const paneRows = [
  {
    id: 'position',
    name: 'position',
    type: "'start' | 'end' | ResponsiveValue<'start' | 'end'>",
    default: 'end',
    description: 'Pane 的位置；Sidebar 仅接受 start/end，默认 start。',
  },
  {
    id: 'positionWhenNarrow',
    name: 'positionWhenNarrow',
    type: "'inherit' | 'start' | 'end'",
    default: 'inherit',
    description: 'Pane 的旧窄屏位置属性，已弃用。请使用响应式 position。',
  },
  {
    id: 'width',
    name: 'width',
    type: "'small' | 'medium' | 'large' | { min: `${number}px`, default: `${number}px`, max: `${number}px` }",
    default: 'medium',
    description: '命名宽度随断点变化；可调整时用作初始宽度、重置值与边界。',
  },
  {
    id: 'minWidth',
    name: 'minWidth',
    type: 'number',
    default: '256',
    description: '命名宽度的最小像素宽度，自定义 width 使用 width.min。',
  },
  {
    id: 'resizable',
    name: 'resizable',
    type: 'boolean',
    default: 'false',
    description: '启用指针拖动、方向键和双击重置。',
  },
  {
    id: 'currentWidth',
    name: 'currentWidth + onResizeEnd',
    type: 'number | undefined + (width: number) => void',
    default: '—',
    description: '受控宽度与操作结束回调必须一起传入。回调模式不使用 localStorage。',
  },
  {
    id: 'widthStorageKey',
    name: 'widthStorageKey',
    type: 'string',
    default: "Pane: 'paneWidth'; Sidebar: undefined",
    description: '非受控且 resizable 时持久化宽度。Sidebar 省略该属性时不使用存储。',
  },
  {
    id: 'sticky',
    name: 'sticky',
    type: 'boolean',
    default: 'false',
    description: '滚动时保持区域可见。',
  },
  {
    id: 'offsetHeader',
    name: 'Pane.offsetHeader',
    type: 'string | number',
    default: '0',
    description: '吸顶 Pane 距视口顶部的距离，数字按 px 处理。',
  },
  {
    id: 'responsiveVariant',
    name: 'Sidebar.responsiveVariant',
    type: "'default' | 'fullscreen'",
    default: 'default',
    description: 'fullscreen 在窄屏覆盖视口；此选项只改变布局，应用负责开关与焦点管理。',
  },
  {
    id: 'divider',
    name: 'Sidebar.divider',
    type: "'none' | 'line'",
    default: 'none',
    description: '侧栏分隔线；resizable 时固定显示 line。',
  },
  {
    id: 'id',
    name: 'id',
    type: 'string',
    default: '—',
    description:
      '写入内容节点；组件 ref 的 element 也指向此节点。class/className/style 作用于外层布局节点。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="PageLayout 页面布局"
      description="以页眉、正文、辅助面板、侧栏和页脚组合页面，支持响应式分隔线与可调整宽度。"
    />
    <ComponentDocsSection title="引入">
      <ComponentDocsDemoBlock :code="importCode"
        ><code
          >PageLayout / Header / Content / Pane / Sidebar / Footer</code
        ></ComponentDocsDemoBlock
      >
    </ComponentDocsSection>
    <ComponentDocsSection title="基础布局">
      <template #description
        >Header、Footer、Sidebar 由父组件按区域安置；Content 和 Pane 保留在默认插槽的顺序。也可使用
        PageLayout.Header 等组合成员。</template
      >
      <ComponentDocsDemoBlock :code="basicCode">
        <div class="demo-frame">
          <PageLayout>
            <PageLayoutHeader divider="line"><div class="demo-region">页眉</div></PageLayoutHeader>
            <PageLayoutContent aria-label="主要内容"
              ><div class="demo-region demo-content">主要内容</div></PageLayoutContent
            >
            <PageLayoutPane position="end" divider="line"
              ><div class="demo-region">辅助面板</div></PageLayoutPane
            >
            <PageLayoutFooter divider="line"><div class="demo-region">页脚</div></PageLayoutFooter>
          </PageLayout>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="响应式区域">
      <template #description
        >narrow 小于 768px，regular 从 768px 起，wide 从 1400px 起。Pane
        在窄屏堆叠到正文上方或下方。响应式属性由 CSS 处理，无需在渲染时读取视口。</template
      >
      <ComponentDocsDemoBlock :code="responsiveCode"
        ><div class="demo-frame">
          <PageLayout container-width="full" padding="condensed" row-gap="condensed">
            <PageLayoutHeader :divider="{ narrow: 'filled', regular: 'line' }"
              ><div class="demo-region">响应式布局</div></PageLayoutHeader
            >
            <PageLayoutContent width="medium"
              ><div class="demo-region demo-content">
                调整窗口宽度，查看辅助面板的位置和可见性。
              </div></PageLayoutContent
            >
            <PageLayoutPane
              :position="{ narrow: 'end', regular: 'start' }"
              :hidden="{ narrow: false, wide: true }"
              :divider="{ narrow: 'filled', regular: 'line' }"
              ><div class="demo-region">窄屏在下方，常规屏幕在左侧，宽屏隐藏</div></PageLayoutPane
            >
          </PageLayout>
        </div></ComponentDocsDemoBlock
      >
    </ComponentDocsSection>
    <ComponentDocsSection title="调整面板宽度">
      <template #description
        >聚焦分隔条后，左/下方向键减小 3px，右/上方向键增加 3px。双击恢复 width
        的默认值。受控模式通过 onResizeEnd 保存最终宽度。</template
      >
      <ComponentDocsDemoBlock :code="resizeCode"
        ><div class="demo-frame">
          <PageLayout>
            <PageLayoutContent
              ><div class="demo-region demo-content">
                使用鼠标拖动分隔条，或聚焦后使用方向键每次调整 3px。
              </div></PageLayoutContent
            >
            <PageLayoutPane
              resizable
              :width="{ min: '200px', default: '320px', max: '600px' }"
              :current-width="currentWidth"
              :on-resize-end="
                (width) => {
                  currentWidth = width
                }
              "
              aria-label="可调整的面板"
              ><div class="demo-region">
                双击分隔条恢复到 320px。当前宽度 {{ currentWidth }}px。
              </div></PageLayoutPane
            >
          </PageLayout>
        </div></ComponentDocsDemoBlock
      >
    </ComponentDocsSection>
    <ComponentDocsSection title="贯穿页面的侧栏">
      <template #description
        >Sidebar 放在主页面容器旁，跨越页眉和页脚；Pane 只与正文并列。侧栏可位于
        start/end、吸顶，或设置 responsiveVariant="fullscreen" 在窄屏覆盖视口。</template
      >
      <ComponentDocsDemoBlock :code="sidebarCode"
        ><Button @click="sidebarVisible = !sidebarVisible">切换侧栏</Button>
        <div class="demo-frame">
          <PageLayout container-width="full" padding="none">
            <PageLayoutSidebar
              :hidden="!sidebarVisible"
              width="small"
              divider="line"
              resizable
              width-storage-key="page-layout-docs-sidebar"
              aria-label="导航侧栏"
              ><div class="demo-region">跨越页眉、正文和页脚的侧栏</div></PageLayoutSidebar
            >
            <PageLayoutHeader><div class="demo-region">页眉</div></PageLayoutHeader>
            <PageLayoutContent
              ><div class="demo-region demo-content">主要内容</div></PageLayoutContent
            >
            <PageLayoutFooter><div class="demo-region">页脚</div></PageLayoutFooter>
          </PageLayout>
        </div></ComponentDocsDemoBlock
      >
    </ComponentDocsSection>
    <ComponentDocsSection title="PageLayout API" variant="api"
      ><VisuallyHidden :id="`${documentationId}-root`">PageLayout API</VisuallyHidden
      ><ComponentDocsTable
        :aria-labelledby="`${documentationId}-root`"
        :columns="columns"
        :data="rootRows"
    /></ComponentDocsSection>
    <ComponentDocsSection title="区域 API" variant="api"
      ><VisuallyHidden :id="`${documentationId}-regions`">PageLayout 区域 API</VisuallyHidden
      ><ComponentDocsTable
        :aria-labelledby="`${documentationId}-regions`"
        :columns="columns"
        :data="regionRows"
    /></ComponentDocsSection>
    <ComponentDocsSection title="Pane / Sidebar API" variant="api">
      <template #description
        >默认插槽放置区域内容。通过 class/className/style 设定外层布局，data-component
        可覆盖组件标记。Pane/Sidebar 的 ref 暴露 element DOM 节点。SSR 使用默认宽度；localStorage
        只在浏览器可用，已存宽度可能在 hydration 时带来短暂位移。需要服务端一致的宽度时使用
        currentWidth 与 onResizeEnd。</template
      >
      <VisuallyHidden :id="`${documentationId}-pane`">Pane 与 Sidebar API</VisuallyHidden
      ><ComponentDocsTable
        :aria-labelledby="`${documentationId}-pane`"
        :columns="columns"
        :data="paneRows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.demo-frame {
  width: 100%;
  border: 1px solid var(--borderColor-default);
  border-radius: var(--borderRadius-medium);
}
.demo-region {
  padding: 16px;
  background: var(--bgColor-muted);
}
.demo-content {
  min-height: 160px;
}
</style>
