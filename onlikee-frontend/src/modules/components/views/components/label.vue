<script setup lang="ts">
import { useId } from 'vue'
import { Label, type LabelColorOptions } from '@/components/primer-vue/Label'
import { LabelGroup } from '@/components/primer-vue/LabelGroup'
import { ActionList } from '@/components/primer-vue/ActionList'
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
const variants: { value: LabelColorOptions; text: string }[] = [
  { value: 'default', text: '公开' },
  { value: 'primary', text: '主要' },
  { value: 'secondary', text: '次要' },
  { value: 'accent', text: '新功能' },
  { value: 'success', text: '已通过' },
  { value: 'attention', text: '待确认' },
  { value: 'severe', text: '高风险' },
  { value: 'danger', text: '失败' },
  { value: 'done', text: '已完成' },
  { value: 'sponsors', text: '赞助者' },
]

const codes = {
  basic: `<script setup lang="ts">
import { Label } from '@/components/primer-vue/Label'
<\/script>

<template>
  <Label>公开</Label>
</template>`,
  variants: variants
    .map(({ value, text }) => `<Label variant="${value}">${text}</Label>`)
    .join('\n'),
  sizes: `<Label size="small" variant="accent">小尺寸</Label>
<Label size="large" variant="accent">大尺寸</Label>`,
  elements: `<Label>静态标签</Label>
<Label as="a" href="#属性" variant="accent">查看属性</Label>`,
  compositions: `<LabelGroup :visible-child-count="1" overflow-style="inline">
  <Label>公开</Label>
  <Label as="a" href="#属性" variant="accent">查看属性</Label>
  <Label variant="success">已通过</Label>
</LabelGroup>

<ActionList>
  <ActionList.Item>
    推荐仓库
    <ActionList.TrailingVisual><Label variant="success">推荐</Label></ActionList.TrailingVisual>
  </ActionList.Item>
</ActionList>`,
  custom: `<Label variant="accent" class="custom-label">
  <span aria-hidden="true">★</span>
  推荐
</Label>

<style scoped>
.custom-label {
  gap: 4px;
  border-style: dashed;
}
</style>`,
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
    type: 'keyof NativeElements | Component',
    default: 'span',
    description: '渲染的元素或组件；属性与事件透传给该元素或组件。',
  },
  {
    id: 'variant',
    name: 'variant',
    type: "'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'attention' | 'severe' | 'danger' | 'done' | 'sponsors'",
    default: 'default',
    description: '设置文字和边框的颜色，使用当前主题的颜色变量。',
  },
  {
    id: 'size',
    name: 'size',
    type: "'small' | 'large'",
    default: 'small',
    description: '设置高度与水平内边距；small 为 20px / 6px，large 为 24px / 8px。',
  },
  {
    id: 'className',
    name: 'className',
    type: 'string',
    default: '—',
    description: '附加样式类，与组件内置类和 Vue class 合并。',
  },
]
const instanceRows: DocumentationRow[] = [
  {
    id: 'element',
    name: 'element',
    type: 'HTMLElement | SVGElement | ComponentPublicInstance | null',
    default: 'null',
    description:
      '通过模板 ref 访问根元素；Primer 组件的 element 会继续转发，其他自定义组件保留其暴露的实例。',
  },
]
const slotRows: DocumentationRow[] = [
  {
    id: 'default',
    name: 'default',
    type: '—',
    default: '—',
    description: '标签内容，支持文本、内联元素或组件，无插槽参数。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Label 标签"
      description="以紧凑的圆角标签展示状态、分类或元信息，支持多种颜色与尺寸。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        默认渲染为 span，使用 small 尺寸和 default 颜色，背景透明。通过默认插槽设置标签内容。
      </template>
      <ComponentDocsDemoBlock :code="codes.basic">
        <Label>公开</Label>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="颜色变体">
      <template #description>
        variant 控制文字和边框颜色，提供以下 10
        种变体。使用明确的文字表达含义，避免仅依靠颜色传递状态。
      </template>
      <ComponentDocsDemoBlock :code="codes.variants">
        <div class="variant-grid">
          <div v-for="variant in variants" :key="variant.value" class="demo-row">
            <span class="demo-label">{{ variant.value }}</span>
            <Label :variant="variant.value">{{ variant.text }}</Label>
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="尺寸">
      <template #description>
        small 的高度为 20px、水平内边距为 6px；large 的高度为 24px、水平内边距为 8px。
        两种尺寸均使用 small 正文字号，文字保持单行；标签内容宜简短。
      </template>
      <ComponentDocsDemoBlock :code="codes.sizes">
        <div class="demo-row">
          <Label size="small" variant="accent">小尺寸</Label>
          <Label size="large" variant="accent">大尺寸</Label>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="语义元素">
      <template #description>
        静态标签使用默认的 span；需要导航时使用 as="a" 并提供 href，以保留链接的键盘操作。 as
        也支持自定义组件，组件需自行处理透传的属性和事件。
      </template>
      <ComponentDocsDemoBlock :code="codes.elements">
        <div class="demo-row">
          <Label>静态标签</Label>
          <Label as="a" href="#属性" variant="accent">查看属性</Label>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="自定义样式与内容">
      <template #description>
        使用 class、className 或 style 定制样式。插槽可以组合图标和文本；装饰性图标应设置
        aria-hidden="true"，由文字提供完整含义。
      </template>
      <ComponentDocsDemoBlock :code="codes.custom">
        <Label variant="accent" class="custom-label">
          <span aria-hidden="true">★</span>
          推荐
        </Label>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="组件组合">
      <template #description>
        LabelGroup 管理标签的折叠与展开；展开后，第一个新增的可聚焦标签会接收焦点。 在
        ActionList.TrailingVisual 中使用时，标签文本会成为列表项可访问名称的一部分。
      </template>
      <ComponentDocsDemoBlock :code="codes.compositions">
        <div class="composition-examples">
          <LabelGroup :visible-child-count="1" overflow-style="inline">
            <Label>公开</Label>
            <Label as="a" href="#属性" variant="accent">查看属性</Label>
            <Label variant="success">已通过</Label>
          </LabelGroup>
          <ActionList>
            <ActionList.Item>
              推荐仓库
              <ActionList.TrailingVisual
                ><Label variant="success">推荐</Label></ActionList.TrailingVisual
              >
            </ActionList.Item>
          </ActionList>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="使用建议">
      <template #description>
        Label 用于展示元信息。表单字段的关联标签应使用原生 label 或表单组件提供的标签。
        组件不会自动播报状态变化；需要播报动态状态时，可在外层使用适当的 live region。
      </template>
    </ComponentDocsSection>

    <ComponentDocsSection title="属性" variant="api">
      <template #description>
        支持原生属性与事件，id、class、style、aria-*、data-* 和事件监听器会透传给根元素。
        组件没有自定义事件。导出 LabelOptions、LabelColorOptions、LabelSizeKeys 和泛型 LabelProps 和
        LabelInstance；例如 LabelProps&lt;'a'&gt; 包含链接属性，as 为自定义组件时保留其必填属性。
      </template>
      <VisuallyHidden :id="`${documentationId}-props`">Label 标签属性</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-props`"
        :columns="columns"
        :data="rows"
      />
    </ComponentDocsSection>

    <ComponentDocsSection title="组件实例" variant="api">
      <template #description>
        使用组件模板 ref 的 element 读取根元素，挂载前和卸载后为 null；as 为原生标签时返回 HTML 或
        SVG 元素；Primer 组件的 element 会继续转发，其他自定义组件返回其暴露的实例。可使用
        LabelInstance 标注模板引用，访问 DOM 方法前需确认引用类型。
      </template>
      <VisuallyHidden :id="`${documentationId}-instance`">Label 标签组件实例</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-instance`"
        :columns="columns"
        :data="instanceRows"
      />
    </ComponentDocsSection>

    <ComponentDocsSection title="插槽" variant="api">
      <VisuallyHidden :id="`${documentationId}-slots`">Label 标签插槽</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-slots`"
        :columns="columns"
        :data="slotRows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.variant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 20px;
  width: 100%;
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.demo-label {
  min-width: 80px;
  color: var(--fgColor-muted);
  font-size: 12px;
}

.custom-label {
  gap: 4px;
  border-style: dashed;
}

.composition-examples {
  display: grid;
  gap: 16px;
}
</style>
