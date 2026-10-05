<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="TextInput 输入框"
      description="原生文本输入组件，支持 v-model:value、视觉元素、加载和字符计数。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        通过 <code>v-model:value</code> 双向绑定输入值。
      </template>
      <ComponentDocsDemoBlock :code="demo1Code">
        <TextInput
          v-model:value="val1"
          placeholder="请输入内容"
        />
        <p class="demo-info">
          当前值：{{ val1 || '未输入' }}
        </p>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="禁用状态">
      <template #description>
        设置原生属性 <code>disabled</code> 后输入框不可编辑。
      </template>
      <ComponentDocsDemoBlock :code="demo2Code">
        <TextInput
          v-model:value="val2"
          disabled
        />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="输入类型">
      <template #description>
        可通过透传原生属性设置 <code>type</code>、<code>autocomplete</code> 等参数。
      </template>
      <ComponentDocsDemoBlock :code="demo3Code">
        <div class="demo-row">
          <TextInput
            v-model:value="email"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
          />
          <TextInput
            v-model:value="password"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="前后缀文本">
      <template #description>
        使用 <code>leadingVisual</code> 与 <code>trailingVisual</code> 展示固定文本，原生 input 属性仍会透传到内部输入框。
      </template>
      <ComponentDocsDemoBlock :code="demo4Code">
        <TextInput
          v-model:value="domainPrefix"
          class="affix-input"
          leading-visual="https://"
          trailing-visual=".onlikee.com"
          placeholder="my-app"
          maxlength="63"
        />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="结合 FormControl">
      <template #description>
        与 <code>FormControl</code> 组合，可快速添加标签、校验信息和辅助文案。
      </template>
      <ComponentDocsDemoBlock :code="demo5Code">
        <FormControl>
          <FormControl.Label>
            Name <span class="required-mark">*</span>
          </FormControl.Label>
          <TextInput v-model:value="profileName" />
          <FormControl.Validation
            v-if="hasInvalidChars"
            variant="error"
          >
            Names may not contain symbols
          </FormControl.Validation>
          <FormControl.Caption>
            This will be publicly visible
          </FormControl.Caption>
        </FormControl>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="尺寸大小">
      <template #description>
        通过 <code>size</code> 属性设置组件大小，支持 <code>small</code>、<code>medium</code> 和 <code>large</code>，默认为 <code>medium</code>。
      </template>
      <ComponentDocsDemoBlock :code="demo6Code">
        <div
          class="demo-row"
          style="align-items: center;"
        >
          <TextInput
            v-model:value="valSmall"
            size="small"
            placeholder="small (28px)"
          />
          <TextInput
            v-model:value="valMedium"
            size="medium"
            placeholder="medium (32px)"
          />
          <TextInput
            v-model:value="valLarge"
            size="large"
            placeholder="large (40px)"
          />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="加载、操作与字符计数">
      <template #description>
        通过 <code>loading</code> 告知加载状态，<code>TextInput.Action</code> 提供操作按钮；
        <code>characterLimit</code> 显示剩余字符并在超限时标记错误，不截断输入。
      </template>
      <ComponentDocsDemoBlock :code="counterDemoCode">
        <TextInput
          v-model:value="search"
          :loading="searchLoading"
          :character-limit="20"
          leading-visual="搜索"
          placeholder="最多建议输入 20 个字符"
        >
          <template #trailingAction>
            <TextInput.Action
              aria-label="清空搜索"
              @click="search = ''"
            >
              清空
            </TextInput.Action>
          </template>
        </TextInput>
        <label class="loading-toggle"><input
          v-model="searchLoading"
          type="checkbox"
        >显示加载状态</label>
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
import { TextInput } from '@/components/primer-vue/TextInput'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const val1 = ref('')
const val2 = ref('Disabled value')
const email = ref('')
const password = ref('')
const domainPrefix = ref('docs')
const profileName = ref('Mona L!$a')
const valSmall = ref('')
const valMedium = ref('')
const valLarge = ref('')
const search = ref('')
const searchLoading = ref(false)
const counterDemoCode = `<TextInput v-model:value="search" :loading="loading" :character-limit="20" leading-visual="搜索">
  <template #trailingAction>
    <TextInput.Action aria-label="清空搜索" @click="search = ''">清空</TextInput.Action>
  </template>
</TextInput>`

const hasInvalidChars = computed(() => /[^a-zA-Z\s]/.test(profileName.value))

const demo1Code = `<template>
  <TextInput v-model:value="val" placeholder="请输入内容" />
  <p>当前值：{{ val || '未输入' }}</p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TextInput } from '@/components/primer-vue/TextInput'

const val = ref('')
<\/script>`

const demo2Code = `<template>
  <TextInput v-model:value="val" disabled />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TextInput } from '@/components/primer-vue/TextInput'

const val = ref('Disabled value')
<\/script>`

const demo3Code = `<template>
  <div style="display: flex; gap: 12px; flex-wrap: wrap;">
    <TextInput v-model:value="email" type="email" placeholder="you@example.com" autocomplete="email" />
    <TextInput v-model:value="password" type="password" placeholder="请输入密码" autocomplete="current-password" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TextInput } from '@/components/primer-vue/TextInput'

const email = ref('')
const password = ref('')
<\/script>`

const demo4Code = `<template>
  <TextInput
    v-model:value="domainPrefix"
    class="affix-input"
    leading-visual="https://"
    trailing-visual=".onlikee.com"
    placeholder="my-app"
    maxlength="63"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TextInput } from '@/components/primer-vue/TextInput'

const domainPrefix = ref('docs')
<\/script>

<style scoped>
.affix-input {
  width: 100%;
  max-width: 360px;
}
.loading-toggle { display: flex; align-items: center; gap: 8px; font-size: 12px; margin-top: 12px; }
<\/style>`

const demo5Code = `<template>
  <FormControl>
    <FormControl.Label>Name <span>*</span></FormControl.Label>
    <TextInput v-model:value="name" />
    <FormControl.Validation v-if="hasInvalidChars" variant="error">
      Names may not contain symbols
    </FormControl.Validation>
    <FormControl.Caption>This will be publicly visible</FormControl.Caption>
  </FormControl>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { FormControl } from '@/components/primer-vue/FormControl'
import { TextInput } from '@/components/primer-vue/TextInput'

const name = ref('Mona L!$a')
const hasInvalidChars = computed(() => /[^a-zA-Z\\s]/.test(name.value))
<\/script>`

const demo6Code = `<template>
  <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
    <TextInput v-model:value="valSmall" size="small" placeholder="small" />
    <TextInput v-model:value="valMedium" size="medium" placeholder="medium" />
    <TextInput v-model:value="valLarge" size="large" placeholder="large" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TextInput } from '@/components/primer-vue/TextInput'

const valSmall = ref('')
const valMedium = ref('')
const valLarge = ref('')
<\/script>`

const apiCols: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '140px' },
  { key: 'default', label: '默认值', minWidth: '120px' },
  { key: 'type', label: '类型', minWidth: '220px', wrap: true },
  { key: 'description', label: '说明', minWidth: '220px', wrap: true }
]

const apiRows = [
  { name: 'value', description: '受控绑定值（v-model:value）', type: 'string | number', default: '—' },
  { name: 'defaultValue', description: '非受控初始值', type: 'string | number', default: '—' },
  { name: 'size', description: '输入框尺寸', type: "'small' | 'medium' | 'large'", default: "'medium'" },
  { name: 'leadingVisual / trailingVisual', description: '输入框前后视觉元素；支持同名具名插槽', type: 'VNodeChild | Component', default: '—' },
  { name: 'trailingAction', description: '输入框操作按钮，通常使用 TextInput.Action', type: 'VNodeChild | Component', default: '—' },
  { name: 'loading / loaderPosition / loaderText', description: '加载状态、位置和无障碍提示', type: "boolean / 'auto' | 'leading' | 'trailing' / string", default: "— / 'auto' / 'Loading'" },
  { name: 'characterLimit', description: '字符计数与超限错误状态，不阻止输入', type: 'number', default: '—' },
  { name: 'validationStatus', description: '错误或成功状态', type: "'error' | 'success'", default: '—' },
  { name: 'block / contrast / monospace', description: '占满容器、高对比背景和等宽字体', type: 'boolean', default: 'false' }
]

const nativeRows = [
  { name: 'type', description: '输入类型', type: 'string', default: "'text'" },
  { name: 'placeholder', description: '占位文本', type: 'string', default: '-' },
  { name: 'disabled', description: '禁用输入', type: 'boolean', default: 'false' },
  { name: 'maxlength', description: '最大输入长度', type: 'number | string', default: '-' },
  { name: 'autocomplete', description: '自动填充提示', type: 'string', default: '-' },
  { name: 'id / name / aria-*', description: '其他原生属性会透传到 input 元素', type: 'string', default: '-' }
]

const eventCols: TableColumn[] = [
  { key: 'name', label: '事件名', rowHeader: true, minWidth: '180px' },
  { key: 'description', label: '说明', minWidth: '240px', wrap: true },
  { key: 'type', label: '回调参数', minWidth: '200px', wrap: true }
]

const eventRows = [
  { name: 'update:value', description: '输入值变化时触发（IME 组合输入在 compositionend 后更新）', type: 'string' },
  { name: 'change / input', description: '原生输入事件；change 随文本修改触发', type: 'Event' },
  { name: 'focus / blur', description: '原生焦点事件', type: 'FocusEvent' }
]
</script>

<style scoped>
.demo-info {
  margin-top: 8px;
  font-size: 0.85rem;
  color: var(--fgColor-muted, #656d76);
}

.demo-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.required-mark {
  color: var(--fgColor-danger, #d1242f);
}

.affix-input {
  width: 100%;
  max-width: 360px;
}

@media (max-width: 768px) {
  .demo-row {
    grid-template-columns: 1fr;
  }
}
</style>
