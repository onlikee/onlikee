<script setup lang="ts">
import { useId as useDocumentationId } from 'vue'
import { Hidden } from '@/components/primer-vue/Hidden'
import { Button } from '@/components/primer-vue/Button'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const documentationId = useDocumentationId()
const importCode = "import { Hidden } from '@/components/primer-vue/Hidden'"
const singleCode = `<template>
  <Hidden when="narrow">在 regular 和 wide 视口显示</Hidden>
  <Hidden when="regular">在 narrow 和 wide 视口显示</Hidden>
  <Hidden when="wide">在 narrow 和 regular 视口显示</Hidden>
</template>`
const multipleCode = `<template>
  <Hidden :when="['regular', 'wide']">仅在 narrow 视口显示</Hidden>
  <Hidden :when="['narrow', 'wide']">仅在 regular 视口显示</Hidden>
  <Hidden :when="['narrow', 'regular']">仅在 wide 视口显示</Hidden>
</template>`
const actionsCode = `<template>
  <Hidden when="narrow">
    <Button variant="primary">新建 Webhook</Button>
  </Hidden>
  <Hidden :when="['regular', 'wide']">
    <Button variant="primary">新建</Button>
  </Hidden>
</template>`
const columns: DocumentationColumn[] = [
  { field: 'name', header: '属性名', rowHeader: true },
  { field: 'type', header: '类型' },
  { field: 'default', header: '默认值' },
  { field: 'description', header: '说明' },
]
const rows = [
  {
    id: 'when',
    name: 'when',
    type: 'Viewport | Viewport[]',
    default: '必填',
    description: "隐藏内容的视口，Viewport = 'narrow' | 'regular' | 'wide'。空数组不隐藏任何视口。",
  },
  {
    id: 'className',
    name: 'className',
    type: 'string',
    default: '—',
    description: '根 div 的附加类名，也支持 Vue 的 class。',
  },
  {
    id: 'style',
    name: 'style',
    type: 'CSSProperties',
    default: '—',
    description: '根 div 的内联样式，优先于组件生成的 CSS 变量。',
  },
  {
    id: 'default',
    name: '默认插槽',
    type: 'slot',
    default: '—',
    description: '对应 React children，内容始终挂载。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Hidden 响应式隐藏"
      description="在指定视口通过 CSS 隐藏内容，保留内容的挂载状态。"
    />
    <ComponentDocsSection title="引入">
      <ComponentDocsDemoBlock :code="importCode">
        <code>Hidden</code>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="单个视口">
      <template #description>
        调整浏览器窗口宽度查看变化。默认字体大小下，narrow 小于 768px，regular 为 768px 至
        1400px，wide 从 1400px 起。断点使用 48rem 和 87.5rem，与 React 源码的编译结果一致。
      </template>
      <ComponentDocsDemoBlock :code="singleCode">
        <div class="hidden-demo">
          <Hidden when="narrow">在 regular 和 wide 视口显示</Hidden>
          <Hidden when="regular">在 narrow 和 wide 视口显示</Hidden>
          <Hidden when="wide">在 narrow 和 regular 视口显示</Hidden>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="多个视口">
      <template #description>
        when 数组中的视口分别隐藏，不继承相邻断点。隐藏使用 display:
        none，内容及其可聚焦元素会从布局和无障碍树中移除，但子组件不会卸载。
      </template>
      <ComponentDocsDemoBlock :code="multipleCode">
        <div class="hidden-demo">
          <Hidden :when="['regular', 'wide']">仅在 narrow 视口显示</Hidden>
          <Hidden :when="['narrow', 'wide']">仅在 regular 视口显示</Hidden>
          <Hidden :when="['narrow', 'regular']">仅在 wide 视口显示</Hidden>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="响应式操作文案">
      <template #description>在窄屏显示简短文案，其余视口显示完整文案。</template>
      <ComponentDocsDemoBlock :code="actionsCode">
        <Hidden when="narrow">
          <Button variant="primary">新建 Webhook</Button>
        </Hidden>
        <Hidden :when="['regular', 'wide']">
          <Button variant="primary">新建</Button>
        </Hidden>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="API" variant="api">
      <template #description>
        根节点固定为 div。与 React 源码一致，仅接收表中属性，不透传其他 HTML
        属性或事件；需要时将属性放在插槽内容上。Hidden 隐藏整个内容，VisuallyHidden
        则用于仅视觉隐藏、仍供屏幕阅读器读取的内容。
      </template>
      <VisuallyHidden :id="`${documentationId}-api-table`">Hidden 响应式隐藏 API</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table`"
        :columns="columns"
        :data="rows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.hidden-demo {
  display: grid;
  gap: 12px;
  width: 100%;
}
</style>
