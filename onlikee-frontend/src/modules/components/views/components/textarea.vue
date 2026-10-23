<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Textarea 文本域"
      description="原生多行输入组件，支持 v-model:value、自动高度、字符计数与校验状态。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description> 通过 <code>v-model:value</code> 双向绑定多行文本内容。 </template>
      <ComponentDocsDemoBlock :code="demo1Code">
        <Textarea
          v-model:value="val1"
          class="demo-textarea"
          rows="4"
          placeholder="请输入详细描述"
        />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="预设行数与长度限制">
      <template #description>
        可通过透传原生属性设置 <code>rows</code>、<code>maxlength</code>、<code>placeholder</code>
        等参数。
      </template>
      <ComponentDocsDemoBlock :code="demo2Code">
        <Textarea
          v-model:value="val2"
          class="demo-textarea"
          rows="6"
          maxlength="120"
          placeholder="最多输入 120 个字符"
        />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="禁用状态">
      <template #description> 设置原生属性 <code>disabled</code> 后文本域不可编辑。 </template>
      <ComponentDocsDemoBlock :code="demo3Code">
        <Textarea v-model:value="val3" class="demo-textarea" rows="4" disabled />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="结合 FormControl">
      <template #description>
        与 <code>FormControl</code> 组合，可快速添加标签、校验信息和辅助文案。
      </template>
      <ComponentDocsDemoBlock :code="demo4Code">
        <FormControl>
          <FormControl.Label>Project Description</FormControl.Label>
          <Textarea v-model:value="description" class="demo-textarea" rows="5" maxlength="120" />
          <FormControl.Validation v-if="descriptionTooLong" variant="error">
            Keep the description under 80 characters
          </FormControl.Validation>
          <FormControl.Caption> This will be shown on the project detail page </FormControl.Caption>
        </FormControl>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="自动高度与字符计数">
      <template #description>
        <code>autoSize</code> 使用原生
        <code>field-sizing: content</code> 根据内容增长，需要浏览器支持该 CSS 属性；<code
          >minHeight</code
        >
        和 <code>maxHeight</code> 限制高度。
        <code>characterLimit</code> 显示剩余字符及超限错误，不阻止继续输入。
      </template>
      <ComponentDocsDemoBlock :code="autoSizeDemoCode">
        <Textarea
          v-model:value="autoSizeValue"
          auto-size
          block
          :min-height="60"
          :max-height="180"
          :character-limit="120"
          placeholder="输入多行内容，文本域会自动增长"
        />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="API" variant="api">
      <h3>属性</h3>
      <VisuallyHidden :id="`${documentationId}-api-table-0`">Textarea 文本域 属性</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-0`"
        :columns="apiCols"
        :data="apiRows"
      />
      <h3>原生属性透传（常用）</h3>
      <VisuallyHidden :id="`${documentationId}-api-table-1`"
        >Textarea 文本域 原生属性透传（常用）</VisuallyHidden
      >
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-1`"
        :columns="apiCols"
        :data="nativeRows"
      />
      <h3>事件</h3>
      <VisuallyHidden :id="`${documentationId}-api-table-2`">Textarea 文本域 事件</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-2`"
        :columns="eventCols"
        :data="eventRows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { useId as useDocumentationId } from 'vue'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'

import { computed, ref } from 'vue'
import { FormControl } from '@/components/primer-vue/FormControl'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import { Textarea } from '@/components/primer-vue/Textarea'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const documentationId = useDocumentationId()

const val1 = ref('')
const val2 = ref('支持多行文本输入，适合描述、备注和说明等场景。')
const val3 = ref('Disabled textarea value')
const description = ref('Build a collaborative audio workspace for distributed teams.')
const autoSizeValue = ref('')
const autoSizeDemoCode = `<Textarea v-model:value="description" auto-size block :min-height="60" :max-height="180" :character-limit="120" />`

const descriptionTooLong = computed(() => description.value.length > 80)

const demo1Code = `<template>
  <Textarea v-model:value="val" rows="4" placeholder="请输入详细描述" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Textarea } from '@/components/primer-vue/Textarea'

const val = ref('')
<\/script>`

const demo2Code = `<template>
  <Textarea
    v-model:value="val"
    rows="6"
    maxlength="120"
    placeholder="最多输入 120 个字符"
  />
  <p>{{ val.length }}/120</p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Textarea } from '@/components/primer-vue/Textarea'

const val = ref('支持多行文本输入，适合描述、备注和说明等场景。')
<\/script>`

const demo3Code = `<template>
  <Textarea v-model:value="val" rows="4" disabled />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Textarea } from '@/components/primer-vue/Textarea'

const val = ref('Disabled textarea value')
<\/script>`

const demo4Code = `<template>
  <FormControl>
    <FormControl.Label>Project Description</FormControl.Label>
    <Textarea v-model:value="description" rows="5" maxlength="120" />
    <FormControl.Validation v-if="descriptionTooLong" variant="error">
      Keep the description under 80 characters
    </FormControl.Validation>
    <FormControl.Caption>This will be shown on the project detail page</FormControl.Caption>
  </FormControl>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { FormControl } from '@/components/primer-vue/FormControl'
import { Textarea } from '@/components/primer-vue/Textarea'

const description = ref('Build a collaborative audio workspace for distributed teams.')
const descriptionTooLong = computed(() => description.value.length > 80)
<\/script>`

const apiCols: DocumentationColumn[] = [
  { field: 'name', header: '属性名', rowHeader: true, minWidth: '140px' },
  { field: 'default', header: '默认值', minWidth: '120px' },
  { field: 'type', header: '类型', minWidth: '220px' },
  { field: 'description', header: '说明', minWidth: '220px' },
]

const apiRows = [
  {
    id: 'value',
    name: 'value',
    description: '受控绑定值（v-model:value）',
    type: 'string | number',
    default: '—',
  },
  {
    id: 'defaultValue',
    name: 'defaultValue',
    description: '非受控初始值',
    type: 'string | number',
    default: '—',
  },
  {
    id: 'resize',
    name: 'resize',
    description: '允许用户调整尺寸的方向',
    type: "'none' | 'both' | 'horizontal' | 'vertical'",
    default: "'both'",
  },
  {
    id: 'autoSize',
    name: 'autoSize',
    description: '根据内容自动调整高度',
    type: 'boolean',
    default: 'false',
  },
  {
    id: 'minHeight / maxHeight',
    name: 'minHeight / maxHeight',
    description: '文本域高度限制，单位 px',
    type: 'number',
    default: '—',
  },
  {
    id: 'characterLimit',
    name: 'characterLimit',
    description: '字符计数与超限错误状态，不阻止输入',
    type: 'number',
    default: '—',
  },
  {
    id: 'validationStatus',
    name: 'validationStatus',
    description: '错误或成功状态',
    type: "'error' | 'success'",
    default: '—',
  },
  {
    id: 'block / contrast',
    name: 'block / contrast',
    description: '占满容器和高对比背景',
    type: 'boolean',
    default: 'false',
  },
]

const nativeRows = [
  { id: 'placeholder', name: 'placeholder', description: '占位文本', type: 'string', default: '-' },
  {
    id: 'rows / cols',
    name: 'rows / cols',
    description: '默认可见行数与列数',
    type: 'number | string',
    default: '7 / 30',
  },
  {
    id: 'disabled',
    name: 'disabled',
    description: '禁用文本域',
    type: 'boolean',
    default: 'false',
  },
  {
    id: 'maxlength',
    name: 'maxlength',
    description: '最大输入长度',
    type: 'number | string',
    default: '-',
  },
  {
    id: 'id / name / aria-*',
    name: 'id / name / aria-*',
    description: '其他原生属性会透传到 textarea 元素',
    type: 'string',
    default: '-',
  },
]

const eventCols: DocumentationColumn[] = [
  { field: 'name', header: '事件名', rowHeader: true, minWidth: '180px' },
  { field: 'description', header: '说明', minWidth: '240px' },
  { field: 'type', header: '回调参数', minWidth: '200px' },
]

const eventRows = [
  {
    id: 'update:value',
    name: 'update:value',
    description: '原生 input 修改值时触发，包括 IME 组合输入过程；重复的最终值不重复通知',
    type: 'string',
  },
]
</script>

<style scoped></style>
