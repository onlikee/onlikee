<script setup lang="ts">
import { shallowRef, useId } from 'vue'
import { RouterLink } from 'vue-router'
import { TopicTag } from '@/components/primer-vue/TopicTag'
import { Link } from '@/components/primer-vue/Link'
import { Stack } from '@/components/primer-vue/Stack'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const documentationId = useId()
const activations = shallowRef(0)
const tags = [
  'react',
  'nodejs',
  'javascript',
  'd3',
  'teachers',
  'community',
  'education',
  'programming',
  'curriculum',
  'math',
]
const basicCode = `<TopicTag href="#react">react</TopicTag>
<TopicTag>react</TopicTag>`
const buttonCode = `<TopicTag as="button" type="button" @click="activations += 1">react</TopicTag>
<TopicTag as="button" type="button" disabled>disabled</TopicTag>`
const groupCode = `<TopicTag.Group>
  <TopicTag v-for="tag in tags" :key="tag" :href="\`#\${tag}\`">{{ tag }}</TopicTag>
</TopicTag.Group>`
const compositionCode = `<TopicTag.Group>
  <TopicTag :as="RouterLink" to="/component/topic-tag">RouterLink</TopicTag>
  <TopicTag :as="Link" href="#composed-topic">
    <Stack direction="horizontal" gap="none">
      <strong>react</strong>
      <VisuallyHidden> topic</VisuallyHidden>
    </Stack>
  </TopicTag>
  <TopicTag as="span">static</TopicTag>
</TopicTag.Group>`
const columns: DocumentationColumn[] = [
  { field: 'name', header: '属性名', rowHeader: true, minWidth: '140px' },
  { field: 'type', header: '类型', minWidth: '180px' },
  { field: 'default', header: '默认值', minWidth: '100px' },
  { field: 'description', header: '说明', minWidth: '240px' },
]
const rows = [
  {
    id: 'as',
    name: 'as',
    type: '原生标签 | Component',
    default: 'a',
    description: 'TopicTag 根元素；自定义组件的属性和默认插槽继续透传',
  },
  {
    id: 'className',
    name: 'className',
    type: 'string',
    default: '—',
    description: 'TopicTag 和 Group 均支持；与 Vue class 和组件类名合并',
  },
  {
    id: 'attributes',
    name: '原生或组件属性',
    type: '由 as 决定',
    default: '—',
    description: 'href、ARIA、style、事件等透传；按钮不自动设置 type',
  },
  {
    id: 'group',
    name: 'TopicTag.Group',
    type: 'HTMLAttributes',
    default: 'div',
    description: '固定 div，支持默认插槽和原生属性；横向间距 2px，纵向间距 8px，自动换行',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="TopicTag 主题标签"
      description="用于展示主题的胶囊标签，支持链接、按钮和自动换行分组。对应 Primer React 的实验性 TopicTag。"
    />
    <ComponentDocsSection title="基础用法">
      <template #description
        >默认渲染 a；有 href 时使用原生链接行为，没有 href 时不会进入默认 Tab 顺序。</template
      >
      <ComponentDocsDemoBlock :code="basicCode">
        <div class="topic-row">
          <TopicTag href="#react">react</TopicTag>
          <TopicTag>react</TopicTag>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="按钮">
      <template #description
        >点击、Enter、Space 和 disabled 由原生按钮处理。在表单中不需要提交时，显式传入
        type="button"。</template
      >
      <ComponentDocsDemoBlock :code="buttonCode">
        <div class="topic-row">
          <TopicTag as="button" type="button" @click="activations += 1">react</TopicTag>
          <TopicTag as="button" type="button" disabled>disabled</TopicTag>
        </div>
        <p aria-live="polite">按钮激活次数：{{ activations }}</p>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="标签分组">
      <template #description>Group 仅负责布局，不额外增加列表角色、选择状态或键盘导航。</template>
      <ComponentDocsDemoBlock :code="groupCode">
        <TopicTag.Group class="topic-group">
          <TopicTag v-for="tag in tags" :key="tag" :href="`#${tag}`">{{ tag }}</TopicTag>
        </TopicTag.Group>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="组件组合">
      <template #description
        >as 支持 Link、RouterLink 和自定义组件；内容通过默认插槽组合。样式按实际根元素匹配，span
        保持非交互语义。</template
      >
      <ComponentDocsDemoBlock :code="compositionCode">
        <TopicTag.Group>
          <TopicTag :as="RouterLink" to="/component/topic-tag">RouterLink</TopicTag>
          <TopicTag :as="Link" href="#composed-topic">
            <Stack direction="horizontal" gap="none">
              <strong>react</strong>
              <VisuallyHidden> topic</VisuallyHidden>
            </Stack>
          </TopicTag>
          <TopicTag as="span">static</TopicTag>
        </TopicTag.Group>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="API" variant="api">
      <template #description>
        导出 TopicTagProps&lt;As&gt; 和 TopicTagGroupProps。React children 对应默认插槽。Vue ref 的
        element 在原生标签下为 DOM 元素，在自定义组件下为公开实例，卸载后为 null。
        样式使用主题变量，边框可通过 --topicTag-borderColor 定制。
      </template>
      <VisuallyHidden :id="`${documentationId}-api`">TopicTag API</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api`"
        :columns="columns"
        :data="rows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.topic-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}

.topic-group {
  max-width: 420px;
}
</style>
