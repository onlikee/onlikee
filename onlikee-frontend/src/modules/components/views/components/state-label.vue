<script setup lang="ts">
import { useId } from 'vue'
import { StateLabel, type StateLabelStatus } from '@/components/primer-vue/StateLabel'
import { Stack } from '@/components/primer-vue/Stack'
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
const statuses: StateLabelStatus[] = [
  'issueOpened',
  'issueClosed',
  'issueClosedNotPlanned',
  'issueDraft',
  'pullOpened',
  'pullClosed',
  'pullMerged',
  'draft',
  'pullQueued',
  'unavailable',
  'alertOpened',
  'alertFixed',
  'alertDismissed',
  'alertClosed',
  'archived',
  'open',
  'closed',
]
const basicCode = `<StateLabel status="issueOpened">Open</StateLabel>
<StateLabel status="pullMerged">Merged</StateLabel>
<StateLabel status="alertFixed">Fixed</StateLabel>`
const sizeCode = `<StateLabel status="issueOpened" size="small">Open</StateLabel>
<StateLabel status="issueOpened" size="medium">Open</StateLabel>`
const compositionCode = `<Stack direction="horizontal" align="center" gap="condensed" wrap="wrap">
  <StateLabel status="pullMerged" size="small">Merged</StateLabel>
  <span>更改已合并到主分支。</span>
  <Button size="small">查看更改</Button>
</Stack>`
const columns: DocumentationColumn[] = [
  { field: 'name', header: '属性名', rowHeader: true },
  { field: 'type', header: '类型' },
  { field: 'default', header: '默认值' },
  { field: 'description', header: '说明' },
]
const rows = [
  {
    id: 'status',
    name: 'status',
    type: 'StateLabelStatus',
    default: '必填',
    description: statuses.join(' / '),
  },
  {
    id: 'size',
    name: 'size',
    type: "'small' | 'medium'",
    default: 'medium',
    description: '标签尺寸；优先于 variant。',
  },
  {
    id: 'variant',
    name: 'variant',
    type: "'normal' | 'small'",
    default: '—',
    description: '已弃用，请使用 size。normal 对应 medium。',
  },
  {
    id: 'className',
    name: 'className / class',
    type: 'string',
    default: '—',
    description: '附加到根 span 的样式类。原生 span 属性、事件和 style 同样透传。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="StateLabel 状态标签"
      description="通过图标、颜色和文本展示议题、拉取请求及安全告警的状态。"
    />
    <ComponentDocsSection title="基础用法">
      <template #description
        >status 决定图标和颜色，默认插槽提供状态文字。图标包含对应对象的无障碍名称。</template
      >
      <ComponentDocsDemoBlock :code="basicCode">
        <Stack direction="horizontal" gap="condensed" wrap="wrap">
          <StateLabel status="issueOpened">Open</StateLabel>
          <StateLabel status="pullMerged">Merged</StateLabel>
          <StateLabel status="alertFixed">Fixed</StateLabel>
        </Stack>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="全部状态">
      <template #description>open 和 closed 仅显示文字，其余状态带有图标。</template>
      <Stack direction="horizontal" gap="condensed" wrap="wrap">
        <StateLabel v-for="status in statuses" :key="status" :status="status" size="small">{{
          status
        }}</StateLabel>
      </Stack>
    </ComponentDocsSection>
    <ComponentDocsSection title="尺寸">
      <ComponentDocsDemoBlock :code="sizeCode">
        <Stack direction="horizontal" align="center" gap="condensed">
          <StateLabel status="issueOpened" size="small">Open</StateLabel>
          <StateLabel status="issueOpened" size="medium">Open</StateLabel>
        </Stack>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="与 Stack、Button 组合">
      <ComponentDocsDemoBlock :code="compositionCode">
        <Stack direction="horizontal" align="center" gap="condensed" wrap="wrap">
          <StateLabel status="pullMerged" size="small">Merged</StateLabel>
          <span>更改已合并到主分支。</span>
          <Button size="small">查看更改</Button>
        </Stack>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="API" variant="api">
      <VisuallyHidden :id="`${documentationId}-api`">StateLabel API</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api`"
        :columns="columns"
        :data="rows"
      />
      <p>组件 ref 通过 element 提供根 span；默认插槽支持文本和其他内容。</p>
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>
