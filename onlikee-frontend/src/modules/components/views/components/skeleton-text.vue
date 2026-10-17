<script setup lang="ts">
import { ref, useId } from 'vue'
import { SkeletonText, type SkeletonTextSize } from '@/components/primer-vue/SkeletonText'
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
const lineCount = ref(3)
const sizes: SkeletonTextSize[] = [
  'display',
  'titleLarge',
  'titleMedium',
  'titleSmall',
  'bodyLarge',
  'bodyMedium',
  'bodySmall',
  'subtitle',
]

const codes = {
  basic: `<script setup lang="ts">
import { SkeletonText } from '@/components/primer-vue/SkeletonText'
<\/script>

<template>
  <SkeletonText aria-hidden="true" />
</template>`,
  sizes: sizes.map((size) => `<SkeletonText size="${size}" aria-hidden="true" />`).join('\n'),
  lines: `<script setup lang="ts">
import { ref, useId } from 'vue'
import { SkeletonText } from '@/components/primer-vue/SkeletonText'

const lineCount = ref(3)
const inputId = useId()
<\/script>

<template>
  <label :for="inputId">行数：{{ lineCount }}</label>
  <input :id="inputId" v-model.number="lineCount" type="range" min="1" max="6" step="1" />
  <SkeletonText :lines="lineCount" aria-hidden="true" />
</template>`,
  width: `<SkeletonText :max-width="240" aria-hidden="true" />
<SkeletonText max-width="65%" aria-hidden="true" />
<SkeletonText :lines="3" max-width="20rem" aria-hidden="true" />`,
  composition: `<div id="article-placeholder" class="article-skeleton" aria-hidden="true">
  <SkeletonText size="titleMedium" :max-width="240" class="rounded-lines" />
  <SkeletonText :lines="3" size="bodyMedium" :max-width="360" class="rounded-lines" />
</div>

<style scoped>
.article-skeleton {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding: 16px;
  border: 1px solid var(--borderColor-default);
  border-radius: 6px;
}

.rounded-lines {
  border-radius: 999px;
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
    id: 'size',
    name: 'size',
    type: "'display' | 'titleLarge' | 'titleMedium' | 'titleSmall' | 'bodyLarge' | 'bodyMedium' | 'bodySmall' | 'subtitle'",
    default: 'bodyMedium',
    description: '匹配对应主题排版变量的字号和行高，设置骨架线高度与垂直间距。',
  },
  {
    id: 'lines',
    name: 'lines',
    type: 'number',
    default: '1',
    description:
      '骨架行数，建议传入正整数。小于 2 时呈现单行；大于等于 2 时按向下取整后的数量生成多行。',
  },
  {
    id: 'maxWidth',
    name: 'maxWidth',
    type: 'string | number',
    default: '—',
    description:
      '最大宽度，数字按 px 处理，字符串作为 CSS 长度使用；单行应用于骨架线，多行应用于外层容器。',
  },
  {
    id: 'className',
    name: 'className',
    type: 'string',
    default: '—',
    description: '附加到每条骨架线的样式类，与 Vue class 和内置类合并，不作用于多行容器。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="SkeletonText 文本骨架"
      description="使用与文本排版匹配的骨架线展示待加载内容，支持多种字号、行数和最大宽度。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        默认显示一行 bodyMedium 文本骨架，单行宽度为 100%，由父容器决定可用空间。 组件基于
        SkeletonBox，使用主题骨架色与渐变动画，不渲染真实文本。
      </template>
      <ComponentDocsDemoBlock :code="codes.basic">
        <div class="full-width">
          <SkeletonText aria-hidden="true" />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="排版尺寸">
      <template #description>
        size 提供 8 种排版尺寸，使用对应的字号与行高变量计算骨架线高度和间距。
        应选择与加载完成后内容一致的尺寸；display 与 titleLarge 使用较大的圆角。
      </template>
      <ComponentDocsDemoBlock :code="codes.sizes">
        <div class="size-examples">
          <div v-for="size in sizes" :key="size" class="size-row">
            <span class="demo-label">{{ size }}</span>
            <SkeletonText :size="size" aria-hidden="true" />
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="多行文本">
      <template #description>
        使用 lines 设置行数。多行模式自动添加容器，最后一行的最大宽度为容器的 65%、最小宽度为 50px，
        模拟段落结尾。调整滑块可观察单行与多行布局的变化。
      </template>
      <ComponentDocsDemoBlock :code="codes.lines">
        <div class="demo-stack">
          <label :for="`${documentationId}-lines`" class="demo-label">行数：{{ lineCount }}</label>
          <input
            :id="`${documentationId}-lines`"
            v-model.number="lineCount"
            type="range"
            min="1"
            max="6"
            step="1"
            class="line-control"
          />
          <div class="line-preview">
            <SkeletonText :lines="lineCount" aria-hidden="true" />
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="限制宽度">
      <template #description>
        maxWidth 支持数字和 CSS 长度。它限制最大宽度，不会强制撑大父容器。
        多行时作用于整个段落容器，最后一行仍会按比例缩短。
      </template>
      <ComponentDocsDemoBlock :code="codes.width">
        <div class="demo-stack">
          <div class="width-example">
            <span class="demo-label">240px · 单行</span>
            <SkeletonText :max-width="240" aria-hidden="true" />
          </div>
          <div class="width-example">
            <span class="demo-label">65% · 单行</span>
            <SkeletonText max-width="65%" aria-hidden="true" />
          </div>
          <div class="width-example">
            <span class="demo-label">20rem · 三行</span>
            <SkeletonText :lines="3" max-width="20rem" aria-hidden="true" />
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="组合与自定义样式">
      <template #description>
        组合标题和正文骨架可呈现内容轮廓。使用 class 或 className 定制每条骨架线，
        容器的边框、内边距和唯一 id 放在外层元素上。下面的示例将骨架线改为胶囊圆角。
      </template>
      <ComponentDocsDemoBlock :code="codes.composition">
        <div
          :id="`${documentationId}-article-placeholder`"
          class="article-skeleton"
          aria-hidden="true"
        >
          <SkeletonText size="titleMedium" :max-width="240" class="rounded-lines" />
          <SkeletonText :lines="3" size="bodyMedium" :max-width="360" class="rounded-lines" />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="属性透传与无障碍">
      <template #description>
        单行时原生属性传给骨架线。多行时原生属性与事件监听器复制到每条线，class 和 className
        也作用于每条线，而 style 与 maxWidth 应用于外层容器。请将唯一 id
        设置在自行创建的外层元素上，避免重复。
      </template>
      <p class="usage-note">
        组件不会自动提供加载提示或隐藏装饰性内容。可为骨架设置 aria-hidden="true"，
        在真实内容容器上设置 aria-busy，并另行提供加载状态文字。动画遵循减少动态效果偏好。
        此组件没有独立的 delay 属性；需要整体延迟显示时可由外层控制挂载。
      </p>
    </ComponentDocsSection>

    <ComponentDocsSection title="属性" variant="api">
      <template #description>
        提供 SkeletonText 同名导出与默认导出，导出类型为 SkeletonTextSize、SkeletonTextOptions 和
        SkeletonTextProps。组件没有自定义事件。
      </template>
      <VisuallyHidden :id="`${documentationId}-props`">SkeletonText 文本骨架属性</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-props`"
        :columns="columns"
        :data="rows"
      />
    </ComponentDocsSection>

    <ComponentDocsSection title="插槽与组件实例" variant="api">
      <template #description>
        不提供插槽，也未通过 defineExpose 暴露 element 或其他实例方法。 需要管理整体布局或访问容器
        DOM 时，请使用自行创建的外层元素。
      </template>
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.full-width,
.size-examples,
.width-example,
.line-preview {
  width: 100%;
  min-width: 0;
}

.demo-stack,
.size-examples {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.demo-stack {
  align-items: flex-start;
  width: 100%;
  min-width: 0;
}

.size-row {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  align-items: center;
  gap: 16px;
}

.demo-label {
  color: var(--fgColor-muted);
  font-size: 12px;
  line-height: 1.5;
}

.width-example {
  display: grid;
  gap: 8px;
}

.line-control {
  width: 240px;
  max-width: 100%;
}

.line-preview {
  min-height: 180px;
}

.article-skeleton {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding: 16px;
  border: 1px solid var(--borderColor-default);
  border-radius: 6px;
}

.rounded-lines {
  border-radius: 999px;
}

.usage-note {
  color: var(--fgColor-muted);
  line-height: 1.5;
}

@media (max-width: 600px) {
  .size-row {
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
  }
}
</style>
