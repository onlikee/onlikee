<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Textarea 文本域"
      description="多行文本输入组件，支持 v-model 与原生 textarea 属性透传。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        通过 <code>v-model</code> 双向绑定多行文本内容。
      </template>
      <ComponentDocsDemoBlock :code="demo1Code">
        <Textarea
          v-model="val1"
          class="demo-textarea"
          rows="4"
          placeholder="请输入详细描述"
        />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="预设行数与长度限制">
      <template #description>
        可通过透传原生属性设置 <code>rows</code>、<code>maxlength</code>、<code>placeholder</code> 等参数。
      </template>
      <ComponentDocsDemoBlock :code="demo2Code">
        <Textarea
          v-model="val2"
          class="demo-textarea"
          rows="6"
          maxlength="120"
          placeholder="最多输入 120 个字符"
        />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="禁用状态">
      <template #description>
        设置原生属性 <code>disabled</code> 后文本域不可编辑。
      </template>
      <ComponentDocsDemoBlock :code="demo3Code">
        <Textarea
          v-model="val3"
          class="demo-textarea"
          rows="4"
          disabled
        />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="结合 FormControl">
      <template #description>
        与 <code>FormControl</code> 组合，可快速添加标签、校验信息和辅助文案。
      </template>
      <ComponentDocsDemoBlock :code="demo4Code">
        <FormControl>
          <FormControl.Label>Project Description</FormControl.Label>
          <Textarea
            v-model="description"
            class="demo-textarea"
            rows="5"
            maxlength="120"
          />
          <FormControl.Validation
            v-if="descriptionTooLong"
            variant="error"
          >
            Keep the description under 80 characters
          </FormControl.Validation>
          <FormControl.Caption>
            This will be shown on the project detail page
          </FormControl.Caption>
        </FormControl>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection
      title="API"
      variant="api"
    >
      <h3>属性</h3>
      <Table
        :columns="apiCols"
        :data="apiRows"
        row-key="name"
        compact
        :hoverable="false"
      />
      <h3>原生属性透传（常用）</h3>
      <Table
        :columns="apiCols"
        :data="nativeRows"
        row-key="name"
        compact
        :hoverable="false"
      />
      <h3>事件</h3>
      <Table
        :columns="eventCols"
        :data="eventRows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { FormControl } from '@/components/primer-vue/FormControl'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import { Textarea } from '@/components/primer-vue/Textarea'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const val1 = ref('')
const val2 = ref('支持多行文本输入，适合描述、备注和说明等场景。')
const val3 = ref('Disabled textarea value')
const description = ref('Build a collaborative audio workspace for distributed teams.')

const descriptionTooLong = computed(() => description.value.length > 80)

const demo1Code = `<template>
  <Textarea v-model="val" rows="4" placeholder="请输入详细描述" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Textarea } from '@/components/primer-vue/Textarea'

const val = ref('')
<\/script>`

const demo2Code = `<template>
  <Textarea
    v-model="val"
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
  <Textarea v-model="val" rows="4" disabled />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Textarea } from '@/components/primer-vue/Textarea'

const val = ref('Disabled textarea value')
<\/script>`

const demo4Code = `<template>
  <FormControl>
    <FormControl.Label>Project Description</FormControl.Label>
    <Textarea v-model="description" rows="5" maxlength="120" />
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

const apiCols: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '140px' },
  { key: 'default', label: '默认值', minWidth: '120px' },
  { key: 'type', label: '类型', minWidth: '220px', wrap: true },
  { key: 'description', label: '说明', minWidth: '220px', wrap: true }
]

const apiRows = [
  { name: 'modelValue', description: '绑定值（v-model）', type: 'string', default: "''" }
]

const nativeRows = [
  { name: 'placeholder', description: '占位文本', type: 'string', default: '-' },
  { name: 'rows', description: '默认可见行数', type: 'number | string', default: '-' },
  { name: 'disabled', description: '禁用文本域', type: 'boolean', default: 'false' },
  { name: 'maxlength', description: '最大输入长度', type: 'number | string', default: '-' },
  { name: 'id / name / aria-*', description: '其他原生属性会透传到 textarea 元素', type: 'string', default: '-' }
]

const eventCols: TableColumn[] = [
  { key: 'name', label: '事件名', rowHeader: true, minWidth: '180px' },
  { key: 'description', label: '说明', minWidth: '240px', wrap: true },
  { key: 'type', label: '回调参数', minWidth: '200px', wrap: true }
]

const eventRows = [
  { name: 'update:modelValue', description: '输入值变化时触发（IME 组合输入在 compositionend 后更新）', type: 'string' }
]
</script>

<style scoped>
</style>
