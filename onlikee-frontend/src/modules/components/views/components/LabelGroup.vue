<script setup lang="ts">
import { ref, useId } from 'vue'
import { Label, type LabelColorOptions } from '@/components/primer-vue/Label'
import { LabelGroup } from '@/components/primer-vue/LabelGroup'
import { Token } from '@/components/primer-vue/Token'
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
const previewWidth = ref(260)
const labels: { text: string; variant: LabelColorOptions }[] = [
  { text: 'bug', variant: 'danger' },
  { text: 'enhancement', variant: 'accent' },
  { text: 'help wanted', variant: 'success' },
  { text: 'documentation', variant: 'default' },
  { text: 'good first issue', variant: 'done' },
]
const labelMarkup = labels
  .map(({ text, variant }) => `  <Label variant="${variant}">${text}</Label>`)
  .join('\n')
const linkedLabelMarkup = labels
  .map(({ text, variant }) => `  <Label as="a" href="#属性" variant="${variant}">${text}</Label>`)
  .join('\n')

const codes = {
  basic: `<script setup lang="ts">
import { Label } from '@/components/primer-vue/Label'
import { LabelGroup } from '@/components/primer-vue/LabelGroup'
<\/script>

<template>
  <LabelGroup>
${labelMarkup.replace(/^/gm, '  ')}
  </LabelGroup>
</template>`,
  overlay: `<LabelGroup :visible-child-count="2" overflow-style="overlay">
${labelMarkup}
</LabelGroup>`,
  inline: `<LabelGroup :visible-child-count="2" overflow-style="inline">
${linkedLabelMarkup}
</LabelGroup>`,
  auto: `<div class="label-container">
  <LabelGroup visible-child-count="auto">
${labelMarkup.replace(/^/gm, '  ')}
  </LabelGroup>
</div>

<style scoped>
.label-container {
  width: 260px;
  max-width: 100%;
}
</style>`,
  tokens: `<div class="label-container">
  <LabelGroup visible-child-count="auto" overflow-style="inline">
    <Token v-for="text in ['One', 'Two', 'Three', 'Four', 'Five', 'Six']" :key="text" as="button" :text="text" />
  </LabelGroup>
</div>

<style scoped>
.label-container {
  width: 180px;
  max-width: 100%;
}
</style>`,
  elements: `<LabelGroup as="ol">
${labelMarkup}
</LabelGroup>

<LabelGroup as="div" class-name="spaced-labels">
${labelMarkup}
</LabelGroup>

<style scoped>
.spaced-labels {
  gap: 8px;
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
    default: 'ul',
    description: '根元素或组件；ul / ol 自动生成 li 包装。自定义组件启用折叠时须转发根 DOM 引用。',
  },
  {
    id: 'visibleChildCount',
    name: 'visibleChildCount',
    type: "'auto' | number",
    default: 'undefined',
    description:
      '正整数限制可见子项数量；auto 根据可用宽度折叠。未设置或设为 0 时显示全部并允许换行。',
  },
  {
    id: 'overflowStyle',
    name: 'overflowStyle',
    type: "'inline' | 'overlay'",
    default: 'overlay',
    description: 'inline 在原处展开并允许换行；overlay 在浮层中展示全部标签。仅在启用折叠时生效。',
  },
  {
    id: 'className',
    name: 'className',
    type: 'string',
    default: '—',
    description: '根容器的附加样式类，与内置类合并；也支持 Vue class。',
  },
]
const slotRows: DocumentationRow[] = [
  {
    id: 'default',
    name: 'default',
    type: '—',
    default: '—',
    description:
      '标签子项，支持 Label、Token 和 v-for；显式 Fragment 作为一个折叠单位，无插槽参数。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="LabelGroup 标签组"
      description="组织一组标签，支持按数量或容器宽度折叠，并通过行内展开或浮层查看完整内容。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        默认使用 ul 容器，自动为每个子项添加 li。直接放置 Label，无需手动包裹列表项。 未设置
        visibleChildCount 时显示全部标签，空间不足时自动换行。
      </template>
      <ComponentDocsDemoBlock :code="codes.basic">
        <LabelGroup>
          <Label v-for="label in labels" :key="label.text" :variant="label.variant">
            {{ label.text }}
          </Label>
        </LabelGroup>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="按数量折叠与浮层展开">
      <template #description>
        使用 :visible-child-count="2" 保留前两个标签，其余标签通过 +N 按钮展开。 默认的 overlay
        模式会在浮层中展示全部标签，而非仅展示隐藏部分。 点击关闭按钮或按 Escape
        关闭后，焦点返回展开按钮。
      </template>
      <ComponentDocsDemoBlock :code="codes.overlay">
        <LabelGroup :visible-child-count="2" overflow-style="overlay">
          <Label v-for="label in labels" :key="label.text" :variant="label.variant">
            {{ label.text }}
          </Label>
        </LabelGroup>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="行内展开">
      <template #description>
        overflowStyle="inline" 在原处显示隐藏标签并允许换行，使用 Show less 收起。
        展开时聚焦第一个新显示子项中的可聚焦元素；若该子项没有可聚焦内容，则聚焦收起按钮。
        收起后焦点返回 +N 按钮。以下示例使用链接标签展示焦点移动。
      </template>
      <ComponentDocsDemoBlock :code="codes.inline">
        <LabelGroup :visible-child-count="2" overflow-style="inline">
          <Label
            v-for="label in labels"
            :key="label.text"
            as="a"
            href="#属性"
            :variant="label.variant"
          >
            {{ label.text }}
          </Label>
        </LabelGroup>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="按宽度自动折叠">
      <template #description>
        visibleChildCount="auto" 根据容器的可用宽度隐藏放不下的标签，并为 +N 按钮预留空间。
        请限制容器宽度；拖动滑块可观察可见标签数量的变化。此示例使用默认的浮层展开方式。
      </template>
      <ComponentDocsDemoBlock :code="codes.auto">
        <div class="auto-demo">
          <label :for="`${documentationId}-width`"
            >容器宽度：{{ previewWidth }}px（不超过可用空间）</label
          >
          <input
            :id="`${documentationId}-width`"
            v-model.number="previewWidth"
            type="range"
            min="180"
            max="560"
            step="20"
          />
          <div class="auto-preview" :style="{ width: `${previewWidth}px` }">
            <LabelGroup visible-child-count="auto">
              <Label v-for="label in labels" :key="label.text" :variant="label.variant">
                {{ label.text }}
              </Label>
            </LabelGroup>
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="交互式 Token 组合">
      <template #description>
        Token 使用 as="button" 保留键盘交互。自动折叠后，行内展开会聚焦第一个新增的 Token；
        收起后焦点返回 +N 按钮。自定义根组件需通过 expose({ element }) 转发根 DOM 引用。
      </template>
      <ComponentDocsDemoBlock :code="codes.tokens">
        <div class="auto-preview label-container">
          <LabelGroup visible-child-count="auto" overflow-style="inline">
            <Token
              v-for="text in ['One', 'Two', 'Three', 'Four', 'Five', 'Six']"
              :key="text"
              as="button"
              :text="text"
            />
          </LabelGroup>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="语义元素与自定义样式">
      <template #description>
        使用 as="ol" 保留有序列表语义，或使用 as="div" 渲染普通容器。 className 或 Vue class
        可定制根容器样式；每个标签的颜色与尺寸由 Label 自身设置。
      </template>
      <ComponentDocsDemoBlock :code="codes.elements">
        <div class="demo-stack">
          <LabelGroup as="ol">
            <Label v-for="label in labels" :key="label.text" :variant="label.variant">
              {{ label.text }}
            </Label>
          </LabelGroup>
          <LabelGroup as="div" class-name="spaced-labels">
            <Label v-for="label in labels" :key="label.text" :variant="label.variant">
              {{ label.text }}
            </Label>
          </LabelGroup>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="使用说明">
      <template #description>
        默认插槽的每个直接子项作为一个折叠单位；v-for 生成的列表会展开计数，显式 Fragment
        作为一个子项，注释不计入总数。需要具名分组时，在外层容器设置 role 和 aria-label。
        数量应传入正整数；未设置或设为 0 表示不折叠。
      </template>
      <p class="usage-note">
        数字折叠和 auto 模式均在挂载后计算，服务端初始输出完整子项。auto 模式依赖
        IntersectionObserver，运行环境需提供该 API。内置按钮与浮层名称目前使用英文（Show +N
        more、Show less、Close、All N labels），未提供自定义文案属性。
      </p>
    </ComponentDocsSection>

    <ComponentDocsSection title="属性" variant="api">
      <template #description>
        仅接收下列属性，不透传原生属性或事件，也不公开 DOM ref。展开状态由组件内部管理，
        没有自定义事件或受控展开属性。 导出类型为 LabelGroupOptions 和 LabelGroupProps。
      </template>
      <VisuallyHidden :id="`${documentationId}-props`">LabelGroup 标签组属性</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-props`"
        :columns="columns"
        :data="rows"
      />
    </ComponentDocsSection>

    <ComponentDocsSection title="插槽" variant="api">
      <VisuallyHidden :id="`${documentationId}-slots`">LabelGroup 标签组插槽</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-slots`"
        :columns="columns"
        :data="slotRows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.demo-stack,
.auto-demo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
  min-width: 0;
}

.auto-demo label,
.usage-note {
  color: var(--fgColor-muted);
  font-size: 14px;
  line-height: 1.5;
}

.auto-demo input,
.auto-preview {
  max-width: 100%;
}

.auto-demo input {
  width: 260px;
}

.spaced-labels {
  gap: 8px;
}

.label-container {
  width: 180px;
  max-width: 100%;
}
</style>
