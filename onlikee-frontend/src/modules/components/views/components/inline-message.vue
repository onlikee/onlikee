<script setup lang="ts">
import { h, useId as useDocumentationId } from 'vue'
import { InfoIcon, LockIcon } from '@onlikee/octicons-vue'
import { InlineMessage } from '@/components/primer-vue/InlineMessage'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const documentationId = useDocumentationId()
const customIcon = h(InfoIcon, { size: 24, 'aria-label': '详细信息' })
const basicCode = `<script setup lang="ts">
import { InlineMessage } from '@/components/primer-vue/InlineMessage'
<\/script>

<template>
  <InlineMessage>这是一条行内提示。</InlineMessage>
</template>`
const variantsCode = `<InlineMessage variant="critical">保存失败，请检查输入内容。</InlineMessage>
<InlineMessage variant="success">更改已保存。</InlineMessage>
<InlineMessage variant="unavailable">此功能暂不可用。</InlineMessage>
<InlineMessage variant="warning">请在离开前保存更改。</InlineMessage>`
const sizesCode = `<InlineMessage size="small" variant="success">更改已保存。</InlineMessage>
<InlineMessage size="medium" variant="success">更改已保存。</InlineMessage>
<InlineMessage size="small">未指定 variant 时仍使用 16px InfoIcon。</InlineMessage>`
const visualCode = `<script setup lang="ts">
import { h } from 'vue'
import { InfoIcon, LockIcon } from '@onlikee/octicons-vue'
import { InlineMessage } from '@/components/primer-vue/InlineMessage'

const customIcon = h(InfoIcon, { size: 24, 'aria-label': '详细信息' })
<\/script>

<template>
  <InlineMessage variant="unavailable" :leading-visual="LockIcon">此内容已锁定。</InlineMessage>
  <InlineMessage :leading-visual="customIcon">节点保留自己的属性和尺寸。</InlineMessage>
  <InlineMessage variant="warning" :leading-visual="null">此提示不显示图标。</InlineMessage>
</template>`
const multilineCode = `<div style="max-width: 30ch">
  <InlineMessage variant="success">
    An example inline message that spans multiple lines
  </InlineMessage>
</div>`
const columns: DocumentationColumn[] = [
  { field: 'name', header: '属性名', rowHeader: true, minWidth: '140px' },
  { field: 'type', header: '类型', minWidth: '180px' },
  { field: 'default', header: '默认值', minWidth: '100px' },
  { field: 'description', header: '说明', minWidth: '240px' },
]
const rows = [
  {
    id: 'size',
    name: 'size',
    type: 'small | medium',
    default: 'medium',
    description: 'small 使用小号文字和 12px 实心状态图标；medium 使用 16px 轮廓图标。',
  },
  {
    id: 'variant',
    name: 'variant',
    type: 'critical | success | unavailable | warning',
    default: '—',
    description: '决定文字颜色及默认图标。省略时使用默认文字颜色和 16px InfoIcon。',
  },
  {
    id: 'leadingVisual',
    name: 'leadingVisual',
    type: 'Component | VNodeChild',
    default: '—',
    description: '替换默认图标。组件自动接收图标类名；现成节点保持原样。null 或 false 不显示图标。',
  },
  {
    id: 'className',
    name: 'className',
    type: 'string',
    default: '—',
    description: '与 Vue class 和组件类名合并到根 div。',
  },
  {
    id: 'native',
    name: '原生 div 属性',
    type: 'HTMLAttributes',
    default: '—',
    description:
      'id、style、ARIA、data-* 和原生事件透传到根 div；data-size、data-variant、data-component 由组件设置。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="InlineMessage 行内提示"
      description="在内容附近显示简短的状态、警告或辅助信息。"
    />
    <ComponentDocsSection title="基础用法">
      <template #description
        >省略 variant 时使用默认文字颜色和 InfoIcon，默认尺寸为 medium。</template
      >
      <ComponentDocsDemoBlock :code="basicCode">
        <InlineMessage>这是一条行内提示。</InlineMessage>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="状态">
      <ComponentDocsDemoBlock :code="variantsCode">
        <div class="message-stack">
          <InlineMessage variant="critical">保存失败，请检查输入内容。</InlineMessage>
          <InlineMessage variant="success">更改已保存。</InlineMessage>
          <InlineMessage variant="unavailable">此功能暂不可用。</InlineMessage>
          <InlineMessage variant="warning">请在离开前保存更改。</InlineMessage>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="尺寸">
      <ComponentDocsDemoBlock :code="sizesCode">
        <div class="message-stack">
          <InlineMessage size="small" variant="success">更改已保存。</InlineMessage>
          <InlineMessage size="medium" variant="success">更改已保存。</InlineMessage>
          <InlineMessage size="small">未指定 variant 时仍使用 16px InfoIcon。</InlineMessage>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="自定义视觉内容">
      <template #description
        >leadingVisual 优先于状态图标，组件和现成节点均保留其自身默认尺寸。</template
      >
      <ComponentDocsDemoBlock :code="visualCode">
        <div class="message-stack">
          <InlineMessage variant="unavailable" :leading-visual="LockIcon"
            >此内容已锁定。</InlineMessage
          >
          <InlineMessage :leading-visual="customIcon">节点保留自己的属性和尺寸。</InlineMessage>
          <InlineMessage variant="warning" :leading-visual="null">此提示不显示图标。</InlineMessage>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="多行内容">
      <template #description>文字换行时图标保持顶部对齐。</template>
      <ComponentDocsDemoBlock :code="multilineCode">
        <div class="multiline-message">
          <InlineMessage variant="success"
            >An example inline message that spans multiple lines</InlineMessage
          >
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="API" variant="api">
      <template #description>
        导出 InlineMessage 和 InlineMessageProps。React children 对应默认插槽，内容直接放在根 div
        中。 组件不自动设置 role 或 aria-live；动态通知可按场景传入
        role="status"、aria-live="polite"。 默认图标对辅助技术隐藏，提示含义应由文字表达。
      </template>
      <VisuallyHidden :id="`${documentationId}-api-table`"
        >InlineMessage 行内提示 API</VisuallyHidden
      >
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table`"
        :columns="columns"
        :data="rows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.message-stack {
  display: grid;
  gap: 1rem;
  min-width: 0;
}

.multiline-message {
  max-width: 30ch;
}
</style>
