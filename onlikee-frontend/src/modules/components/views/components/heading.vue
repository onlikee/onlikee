<script setup lang="ts">
import { shallowRef, useId } from 'vue'
import { Heading, type HeadingLevels, type HeadingOptions } from '@/components/primer-vue/Heading'
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
const heading = shallowRef<InstanceType<typeof Heading> | null>(null)

function focusHeading() {
  heading.value?.element?.focus()
}

const levels: HeadingLevels[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
const variants: NonNullable<HeadingOptions['variant']>[] = ['large', 'medium', 'small']

const codes = {
  basic: `<script setup lang="ts">
import { Heading } from '@/components/primer-vue/Heading'
<\/script>

<template>
  <Heading>仓库概览</Heading>
</template>`,
  variants: `<Heading variant="large">大尺寸标题</Heading>
<Heading variant="medium">中尺寸标题</Heading>
<Heading variant="small">小尺寸标题</Heading>`,
  levels: `<Heading as="h1" variant="medium">h1 标题</Heading>
<Heading as="h2" variant="medium">h2 标题</Heading>
<Heading as="h3" variant="medium">h3 标题</Heading>
<Heading as="h4" variant="medium">h4 标题</Heading>
<Heading as="h5" variant="medium">h5 标题</Heading>
<Heading as="h6" variant="medium">h6 标题</Heading>`,
  custom: `<Heading as="h3" variant="small" class="accent-heading">
  项目 <span class="heading-detail">onlikee</span>
</Heading>

<style scoped>
.accent-heading {
  padding-inline-start: 12px;
  border-inline-start: 3px solid var(--borderColor-accent-emphasis);
  color: var(--fgColor-accent);
}

.heading-detail {
  color: var(--fgColor-muted);
  font-weight: var(--base-text-weight-normal);
}
</style>`,
  element: `<script setup lang="ts">
import { shallowRef } from 'vue'
import { Heading } from '@/components/primer-vue/Heading'

const heading = shallowRef<InstanceType<typeof Heading> | null>(null)

function focusHeading() {
  heading.value?.element?.focus()
}
<\/script>

<template>
  <Heading ref="heading" tabindex="-1">搜索结果</Heading>
  <button type="button" @click="focusHeading">聚焦标题</button>
</template>`,
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
    type: "'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'",
    default: 'h2',
    description: '渲染的原生标题元素，决定文档的语义层级，不决定视觉尺寸。',
  },
  {
    id: 'variant',
    name: 'variant',
    type: "'large' | 'medium' | 'small'",
    default: '—',
    description: '设置标题的字体样式；未设置时使用 large 字号与 semibold 字重。',
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
    type: 'HTMLHeadingElement | null',
    default: 'null',
    description: '通过组件模板 ref 访问根标题元素；挂载后可用于聚焦或测量。',
  },
]
const slotRows: DocumentationRow[] = [
  {
    id: 'default',
    name: 'default',
    type: '—',
    default: '—',
    description: '标题内容，支持文本、内联元素或组件，无插槽参数。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Heading 标题"
      description="为页面和内容分区提供语义化标题，支持独立设置标题层级与视觉尺寸。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        默认渲染为 h2，使用 large 字号和 semibold 字重，外边距为 0。通过默认插槽设置标题内容。
      </template>
      <ComponentDocsDemoBlock :code="codes.basic">
        <Heading>仓库概览</Heading>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="视觉尺寸">
      <template #description>
        variant 提供 large、medium 和 small 三种字体样式，使用主题中的标题排版变量。
        它只影响视觉呈现，不会改变渲染的标题标签。未设置 variant 时不会输出 data-variant。
      </template>
      <ComponentDocsDemoBlock :code="codes.variants">
        <div class="demo-column">
          <div v-for="variant in variants" :key="variant" class="demo-row">
            <span class="demo-label">{{ variant }}</span>
            <Heading :variant="variant"
              >{{ { large: '大', medium: '中', small: '小' }[variant] }}尺寸标题</Heading
            >
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="标题层级">
      <template #description>
        使用 as 选择 h1–h6，按页面内容结构组织标题，避免跳过层级。以下示例统一使用 medium
        尺寸，展示语义层级与外观可以独立设置。请勿将 as 设置为非标题元素；开发环境会对此发出警告。
      </template>
      <ComponentDocsDemoBlock :code="codes.levels">
        <div class="demo-column">
          <Heading v-for="level in levels" :key="level" :as="level" variant="medium">
            {{ level }} 标题
          </Heading>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="自定义样式与内容">
      <template #description>
        使用 class、className 或 style 定制样式，默认插槽可以组合内联内容。 style
        中需要长度单位的数字会按 px 处理，lineHeight 等无单位属性和 CSS 自定义属性保留原值。
        标题应保留清晰、简洁的文字，便于屏幕阅读器用户通过标题导航。
      </template>
      <ComponentDocsDemoBlock :code="codes.custom">
        <Heading as="h3" variant="small" class="accent-heading">
          项目 <span class="heading-detail">onlikee</span>
        </Heading>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="访问标题元素">
      <template #description>
        通过模板 ref 的 element 访问根 DOM 元素。标题默认不可聚焦；需要程序化聚焦时可添加
        tabindex="-1"，不会将标题加入 Tab 键导航顺序。
      </template>
      <ComponentDocsDemoBlock :code="codes.element">
        <div class="demo-column">
          <Heading ref="heading" tabindex="-1"> 搜索结果 </Heading>
          <button type="button" @click="focusHeading">聚焦标题</button>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="属性" variant="api">
      <template #description>
        支持原生 HTML 属性与事件，id、class、style、tabindex、aria-*、data-*
        和事件监听器会透传给根标题元素。 组件没有自定义事件。导出类型包括
        HeadingLevels、HeadingOptions 和 HeadingProps。
      </template>
      <VisuallyHidden :id="`${documentationId}-props`">Heading 标题属性</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-props`"
        :columns="columns"
        :data="rows"
      />
    </ComponentDocsSection>

    <ComponentDocsSection title="组件实例" variant="api">
      <VisuallyHidden :id="`${documentationId}-instance`">Heading 标题组件实例</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-instance`"
        :columns="columns"
        :data="instanceRows"
      />
    </ComponentDocsSection>

    <ComponentDocsSection title="插槽" variant="api">
      <VisuallyHidden :id="`${documentationId}-slots`">Heading 标题插槽</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-slots`"
        :columns="columns"
        :data="slotRows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.demo-column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 16px;
}

.demo-label {
  min-width: 64px;
  color: var(--fgColor-muted);
  font-size: 12px;
}

.accent-heading {
  padding-inline-start: 12px;
  border-inline-start: 3px solid var(--borderColor-accent-emphasis);
  color: var(--fgColor-accent);
}

.heading-detail {
  color: var(--fgColor-muted);
  font-weight: var(--base-text-weight-normal);
}
</style>
