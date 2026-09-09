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
          <Input
            v-model="appName"
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
          <Input
            v-model="appUrlPrefix"
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
        两种状态；它会显示对应图标，并把状态同步到根容器，从而联动内部
        <code>.input</code> 与 <code>.textarea</code> 的边框样式。使用时建议放在
        <code>FormControl.Caption</code> 上方。
      </template>
      <ComponentDocsDemoBlock :code="validationDemoCode">
        <FormControl>
          <FormControl.Label>发布地址</FormControl.Label>
          <Input
            v-model="releaseSlug"
            placeholder="onlikee-app"
          />
          <FormControl.Validation :variant="isReleaseSlugValid ? 'success' : 'error'">
            {{
              isReleaseSlugValid
                ? '格式正确，根容器已同步 success 状态。'
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
        这些子组件只是结构块。你可以在它们之间插入自定义布局或额外信息，而不是依赖固定的 prop 排布。
      </template>
      <ComponentDocsDemoBlock :code="compositionDemoCode">
        <FormControl required>
          <FormControl.Label>应用域名前缀</FormControl.Label>
          <div class="domain-row">
            <span class="domain-affix">https://</span>
            <Input
              v-model="domainPrefix"
              placeholder="my-app"
            />
            <span class="domain-affix">.onlikee.com</span>
          </div>
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
import { Input } from '@/components/primer-vue/Input'
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
    <Input v-model="appName" placeholder="请输入应用名称" />
    <FormControl.Caption>将显示在应用卡片和页面标题中。</FormControl.Caption>
  </FormControl>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FormControl } from '@/components/primer-vue/FormControl'
import { Input } from '@/components/primer-vue/Input'

const appName = ref('')
<\/script>`

const requiredDemoCode = `<template>
  <FormControl required>
    <FormControl.Label>应用地址前缀</FormControl.Label>
    <Input v-model="appUrlPrefix" placeholder="onlikee-app" />
    <FormControl.Caption>Label 会自动显示必填标记。</FormControl.Caption>
  </FormControl>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FormControl } from '@/components/primer-vue/FormControl'
import { Input } from '@/components/primer-vue/Input'

const appUrlPrefix = ref('onlikee-app')
<\/script>`

const validationDemoCode = `<template>
  <FormControl>
    <FormControl.Label>发布地址</FormControl.Label>
    <Input v-model="releaseSlug" placeholder="onlikee-app" />
    <FormControl.Validation :variant="isReleaseSlugValid ? 'success' : 'error'">
      {{ isReleaseSlugValid ? '格式正确，根容器已同步 success 状态。' : '仅支持小写字母、数字和连字符，且至少 4 个字符。' }}
    </FormControl.Validation>
    <FormControl.Caption>仅支持小写字母、数字和连字符，且至少 4 个字符。</FormControl.Caption>
  </FormControl>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { FormControl } from '@/components/primer-vue/FormControl'
import { Input } from '@/components/primer-vue/Input'

const releaseSlug = ref('onlikee-app')
const isReleaseSlugValid = computed(() => /^[a-z0-9-]+$/.test(releaseSlug.value) && releaseSlug.value.length >= 4)
<\/script>`

const compositionDemoCode = `<template>
  <FormControl required>
    <FormControl.Label>应用域名前缀</FormControl.Label>
    <div class="domain-row">
      <span class="domain-affix">https://</span>
      <Input v-model="domainPrefix" placeholder="my-app" />
      <span class="domain-affix">.onlikee.com</span>
    </div>
    <FormControl.Caption>你可以在结构块之间插入任意自定义内容。</FormControl.Caption>
    <p class="demo-preview">预览地址：https://{{ domainPrefix || 'your-app' }}.onlikee.com</p>
  </FormControl>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FormControl } from '@/components/primer-vue/FormControl'
import { Input } from '@/components/primer-vue/Input'

const domainPrefix = ref('podcast-hub')
<\/script>`

const apiCols: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '180px' },
  { key: 'default', label: '默认值', minWidth: '120px' },
  { key: 'type', label: '类型', minWidth: '220px', wrap: true },
  { key: 'description', label: '说明', minWidth: '280px', wrap: true }
]

const rootPropRows = [
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
    publicProps: '无'
  },
  {
    name: 'FormControl.Validation',
    description: '校验消息区域；通常放在 Caption 上方，显示状态图标，并把 variant 同步到根容器。',
    publicProps: '见下方 Validation Props'
  },
  {
    name: 'FormControl.Caption',
    description: '辅助说明区域；通常用于提示、说明或补充文案。',
    publicProps: '无'
  }
]

const validationPropRows = [
  {
    name: 'variant',
    description: '校验信息的视觉状态；同时影响图标、文字颜色和根容器的 data-validation-variant。',
    type: "'error' | 'success'",
    default: "'error'"
  }
]
</script>

<style scoped>
.domain-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.domain-affix {
  font-size: 13px;
  line-height: 1.4;
  color: var(--fgColor-muted, #656d76);
}

.domain-row :deep(.input) {
  flex: 1 1 220px;
  min-width: 0;
}

.demo-preview {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: var(--fgColor-muted, #656d76);
}
</style>
