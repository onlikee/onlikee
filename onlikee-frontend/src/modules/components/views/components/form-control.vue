<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="FormControl 表单控件"
      description="用于组织标签、辅助说明和校验反馈的表单控件容器。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        使用 <code>FormControl</code>、<code>FormControl.Label</code> 和 <code>FormControl.Caption</code>
        组织一个完整的表单项。
      </template>
      <ComponentDocsDemoBlock :code="basicDemoCode">
        <FormControl>
          <FormControl.Label>应用名称</FormControl.Label>
          <TextInput
            v-model:value="appName"
            placeholder="请输入应用名称"
          />
          <FormControl.Caption>
            将显示在应用卡片和页面标题中。
          </FormControl.Caption>
        </FormControl>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="自动必填标记">
      <template #description>
        在根组件上传入 <code>required</code> 后，<code>FormControl.Label</code>
        会自动读取上下文并追加必填星号，无需手动渲染。
      </template>
      <ComponentDocsDemoBlock :code="requiredDemoCode">
        <FormControl required>
          <FormControl.Label>应用地址前缀</FormControl.Label>
          <TextInput
            v-model:value="appUrlPrefix"
            placeholder="onlikee-app"
          />
          <FormControl.Caption>
            Label 会自动显示必填标记。
          </FormControl.Caption>
        </FormControl>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="校验状态">
      <template #description>
        <code>FormControl.Validation</code> 支持 <code>error</code> 和 <code>success</code>
        两种状态；纵向普通输入由 FormControl 读取校验插槽状态。横向输入不渲染校验消息；选择控件在组级校验。使用时建议放在
        <code>FormControl.Caption</code> 上方。
      </template>
      <ComponentDocsDemoBlock :code="validationDemoCode">
        <FormControl>
          <FormControl.Label>发布地址</FormControl.Label>
          <TextInput
            v-model:value="releaseSlug"
            placeholder="onlikee-app"
          />
          <FormControl.Validation :variant="isReleaseSlugValid ? 'success' : 'error'">
            {{
              isReleaseSlugValid
                ? '格式正确，输入控件显示 success 状态。'
                : '仅支持小写字母、数字和连字符，且至少 4 个字符。'
            }}
          </FormControl.Validation>
          <FormControl.Caption>
            仅支持小写字母、数字和连字符，且至少 4 个字符。
          </FormControl.Caption>
        </FormControl>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="灵活组合">
      <template #description>
        输入控件应作为直接子组件。通过 leadingVisual 和 trailingVisual 添加前后缀；自定义包装组件使用 asSlot 和 useFormControlForwardedProps 接入。
      </template>
      <ComponentDocsDemoBlock :code="compositionDemoCode">
        <FormControl required>
          <FormControl.Label>应用域名前缀</FormControl.Label>
          <TextInput
            v-model:value="domainPrefix"
            leading-visual="https://"
            trailing-visual=".onlikee.com"
            placeholder="my-app"
          />
          <FormControl.Caption>
            你可以在结构块之间插入任意自定义内容。
          </FormControl.Caption>
          <p class="demo-preview">
            预览地址：https://{{ domainPrefix || 'your-app' }}.onlikee.com
          </p>
        </FormControl>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection
      title="API"
      variant="api"
    >
      <h3>FormControl Props</h3>
      <Table
        :columns="apiCols"
        :data="rootPropRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h3>子组件</h3>
      <Table
        :columns="subComponentCols"
        :data="subComponentRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h3>Validation Props</h3>
      <Table
        :columns="apiCols"
        :data="validationPropRows"
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
import { TextInput } from '@/components/primer-vue/TextInput'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const appName = ref('')
const appUrlPrefix = ref('onlikee-app')
const releaseSlug = ref('onlikee-app')
const domainPrefix = ref('podcast-hub')

const isReleaseSlugValid = computed(() => {
  return /^[a-z0-9-]+$/.test(releaseSlug.value) && releaseSlug.value.length >= 4
})

const basicDemoCode = `<template>
  <FormControl>
    <FormControl.Label>应用名称</FormControl.Label>
    <TextInput v-model:value="appName" placeholder="请输入应用名称" />
    <FormControl.Caption>将显示在应用卡片和页面标题中。</FormControl.Caption>
  </FormControl>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FormControl } from '@/components/primer-vue/FormControl'
import { TextInput } from '@/components/primer-vue/TextInput'

const appName = ref('')
<\/script>`

const requiredDemoCode = `<template>
  <FormControl required>
    <FormControl.Label>应用地址前缀</FormControl.Label>
    <TextInput v-model:value="appUrlPrefix" placeholder="onlikee-app" />
    <FormControl.Caption>Label 会自动显示必填标记。</FormControl.Caption>
  </FormControl>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FormControl } from '@/components/primer-vue/FormControl'
import { TextInput } from '@/components/primer-vue/TextInput'

const appUrlPrefix = ref('onlikee-app')
<\/script>`

const validationDemoCode = `<template>
  <FormControl>
    <FormControl.Label>发布地址</FormControl.Label>
    <TextInput v-model:value="releaseSlug" placeholder="onlikee-app" />
    <FormControl.Validation :variant="isReleaseSlugValid ? 'success' : 'error'">
      {{ isReleaseSlugValid ? '格式正确，输入控件显示 success 状态。' : '仅支持小写字母、数字和连字符，且至少 4 个字符。' }}
    </FormControl.Validation>
    <FormControl.Caption>仅支持小写字母、数字和连字符，且至少 4 个字符。</FormControl.Caption>
  </FormControl>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { FormControl } from '@/components/primer-vue/FormControl'
import { TextInput } from '@/components/primer-vue/TextInput'

const releaseSlug = ref('onlikee-app')
const isReleaseSlugValid = computed(() => /^[a-z0-9-]+$/.test(releaseSlug.value) && releaseSlug.value.length >= 4)
<\/script>`

const compositionDemoCode = `<template>
  <FormControl required>
    <FormControl.Label>应用域名前缀</FormControl.Label>
    <TextInput v-model:value="domainPrefix" leading-visual="https://" trailing-visual=".onlikee.com" placeholder="my-app" />
    <FormControl.Caption>你可以在结构块之间插入任意自定义内容。</FormControl.Caption>
    <p class="demo-preview">预览地址：https://{{ domainPrefix || 'your-app' }}.onlikee.com</p>
  </FormControl>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FormControl } from '@/components/primer-vue/FormControl'
import { TextInput } from '@/components/primer-vue/TextInput'

const domainPrefix = ref('podcast-hub')
<\/script>`

const apiCols: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '180px' },
  { key: 'default', label: '默认值', minWidth: '120px' },
  { key: 'type', label: '类型', minWidth: '220px', wrap: true },
  { key: 'description', label: '说明', minWidth: '280px', wrap: true }
]

const rootPropRows = [
  { name: 'id', description: '输入控件的 ID；未指定时生成稳定 ID。', type: 'string', default: '自动生成' },
  { name: 'disabled', description: '禁用输入及标签，并继承选择控件组的禁用状态。', type: 'boolean', default: 'false' },
  { name: 'layout', description: '普通输入默认纵向；选择控件始终横向。横向普通输入不渲染校验消息。', type: "'vertical' | 'horizontal'", default: "'vertical'" },
  { name: 'className / style', description: '根容器类名与行内样式；也支持 Vue 的 class 属性。', type: 'string / CSSProperties', default: '—' },
  {
    name: 'required',
    description: '标记当前表单项为必填，并让 FormControl.Label 自动追加 *。',
    type: 'boolean',
    default: 'false'
  }
]

const subComponentCols: TableColumn[] = [
  { key: 'name', label: '子组件', rowHeader: true, minWidth: '200px' },
  { key: 'description', label: '说明', minWidth: '320px', wrap: true },
  { key: 'publicProps', label: '公开 Props', minWidth: '220px', wrap: true }
]

const subComponentRows = [
  {
    name: 'FormControl.Label',
    description: '标签区域；读取根组件的 required 上下文并自动显示必填标记。',
    publicProps: 'id、as、htmlFor、visuallyHidden、className、style'
  },
  {
    name: 'FormControl.Validation',
    description: '校验消息区域；通常放在 Caption 上方，显示状态图标，FormControl 自动读取 variant。',
    publicProps: '见下方 Validation Props'
  },
  {
    name: 'FormControl.Caption',
    description: '辅助说明区域；通常用于提示、说明或补充文案。',
    publicProps: 'id、className、style'
  },
  {
    name: 'FormControl.LeadingVisual',
    description: '仅用于 Checkbox 和 Radio 左侧的视觉元素。',
    publicProps: 'className、style'
  }
]

const validationPropRows = [
  {
    name: 'variant',
    description: '校验信息的视觉状态；同时影响图标、文字颜色和纵向普通输入的校验状态。',
    type: "'error' | 'success'",
    default: '必填'
  }
]
</script>

<style scoped>
.demo-preview {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: var(--fgColor-muted, #656d76);
}
</style>
