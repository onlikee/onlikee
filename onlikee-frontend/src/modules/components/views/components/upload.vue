<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Upload 上传"
      description="支持文件和文件夹选择，展示已选文件信息。通过 v-model 获取文件，上传请求由业务侧处理。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        点击或拖拽选择单个文件，通过 <code>v-model</code> 获取 <code>UploadFile[]</code>。选择后显示文件名和大小，点击移除按钮可清空选择。
      </template>
      <ComponentDocsDemoBlock :code="demo1Code">
        <Upload
          v-model="files1"
          text="选择文件"
        />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="限制文件类型">
      <template #description>
        通过 <code>accept</code> 属性限制可选文件类型，格式与原生 <code>&lt;input accept&gt;</code> 一致。
      </template>
      <ComponentDocsDemoBlock :code="demo2Code">
        <Upload
          v-model="files2"
          accept=".zip,.html"
          text="选择文件"
          hint="仅支持 .zip 和 .html 文件"
        />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="文件夹模式">
      <template #description>
        设置 <code>directory</code> 后启用文件夹上传。组件返回 UploadFile 数组，通过
        <code>relativePath</code> 获取包含顶层文件夹名、以 / 分隔且无前导 / 的相对路径，通过
        <code>file</code> 获取原始文件。普通文件或无法获取目录信息时，相对路径为文件名。
      </template>
      <ComponentDocsDemoBlock :code="demo3Code">
        <Upload
          v-model="files3"
          directory
          text="点击选择文件夹，或拖拽文件夹到此处"
        />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="提示文案">
      <template #description>
        通过 <code>text</code> 设置主文案、<code>hint</code> 设置辅助说明，两者默认均为空，为空时不渲染。文案会随属性值更新；文件夹模式的提示也需通过 <code>text</code> 设置。
      </template>
      <ComponentDocsDemoBlock :code="demo4Code">
        <Upload
          v-model="files4"
          text="点击或拖拽文件到此处"
          hint="选择后可查看文件名和大小"
        />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="自定义插槽">
      <template #description>
        使用默认插槽替换图标和主文案，<code>hint</code> 仍会独立显示。上传区域整体可点击，也可聚焦后按 Enter 或空格键选择文件；插槽内请使用非交互内容。
      </template>
      <ComponentDocsDemoBlock :code="demo5Code">
        <Upload v-model="files5">
          <span class="custom-upload-content">
            <UploadIcon />
            <span class="custom-upload-text">
              点击或拖拽文件到这里
            </span>
            <span class="custom-upload-hint">
              选择后可查看文件信息
            </span>
          </span>
        </Upload>
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
      <h3>事件</h3>
      <Table
        :columns="eventCols"
        :data="eventRows"
        row-key="name"
        compact
        :hoverable="false"
      />
      <h3>插槽</h3>
      <Table
        :columns="slotCols"
        :data="slotRows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from '@/components/primer-vue/Upload'
import type { UploadFile } from '@/components/primer-vue/Upload'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import { UploadIcon } from '@/components/octicons-vue3'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const files1 = ref<UploadFile[]>([])
const files2 = ref<UploadFile[]>([])
const files3 = ref<UploadFile[]>([])
const files4 = ref<UploadFile[]>([])
const files5 = ref<UploadFile[]>([])

const demo1Code = `<template>
  <Upload v-model="files" text="选择文件" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from '@/components/primer-vue/Upload'
import type { UploadFile } from '@/components/primer-vue/Upload'

const files = ref<UploadFile[]>([])
<\/script>`

const demo2Code = `<template>
  <Upload
    v-model="files"
    accept=".zip,.html"
    text="选择文件"
    hint="仅支持 .zip 和 .html 文件"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from '@/components/primer-vue/Upload'
import type { UploadFile } from '@/components/primer-vue/Upload'

const files = ref<UploadFile[]>([])
<\/script>`

const demo3Code = `<template>
  <Upload
    v-model="files"
    directory
    text="点击选择文件夹，或拖拽文件夹到此处"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from '@/components/primer-vue/Upload'
import type { UploadFile } from '@/components/primer-vue/Upload'

const files = ref<UploadFile[]>([])
<\/script>`

const demo4Code = `<template>
  <Upload v-model="files" text="点击或拖拽文件到此处" hint="选择后可查看文件名和大小" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from '@/components/primer-vue/Upload'
import type { UploadFile } from '@/components/primer-vue/Upload'

const files = ref<UploadFile[]>([])
<\/script>`

const demo5Code = `<template>
  <Upload v-model="files">
    <span class="custom-upload-content">
      <UploadIcon />
      <span class="custom-upload-text">点击或拖拽文件到这里</span>
      <span class="custom-upload-hint">选择后可查看文件信息</span>
    </span>
  </Upload>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from '@/components/primer-vue/Upload'
import type { UploadFile } from '@/components/primer-vue/Upload'
import { UploadIcon } from '@/components/octicons-vue3'

const files = ref<UploadFile[]>([])
<\/script>`

const apiCols: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '140px' },
  { key: 'default', label: '默认值', minWidth: '100px' },
  { key: 'type', label: '类型', minWidth: '200px', wrap: true },
  { key: 'description', label: '说明', minWidth: '200px', wrap: true }
]

const apiRows = [
  { name: 'modelValue', description: '绑定的文件数组（v-model），设为空数组可清空选择。', type: 'UploadFile[]', default: '[]' },
  { name: 'accept', description: '接受的文件类型，格式同原生 input accept', type: 'string', default: "''" },
  { name: 'text', description: '上传区域的主文案，为空时不渲染；文件夹模式也使用此文案。', type: 'string', default: "''" },
  { name: 'hint', description: '上传区域的辅助说明，为空时不渲染。', type: 'string', default: "''" },
  { name: 'width', description: '根容器 .upload 的宽度，支持 CSS 尺寸值，如 320px、100%。', type: 'string', default: "''" },
  { name: 'height', description: '根容器 .upload 的高度，包含上传区域和已选文件信息，支持 CSS 尺寸值。', type: 'string', default: "''" },
  { name: 'directory', description: '启用文件夹上传模式，并返回包含 file 和 relativePath 的扁平化数组', type: 'boolean', default: 'false' }
]

const eventCols: TableColumn[] = [
  { key: 'name', label: '事件名', rowHeader: true, minWidth: '180px' },
  { key: 'description', label: '说明', minWidth: '200px', wrap: true },
  { key: 'type', label: '回调参数', minWidth: '200px', wrap: true }
]

const eventRows = [
  { name: 'update:modelValue', description: '选择文件或文件夹时返回筛选后的文件数组；点击移除按钮时返回空数组。', type: 'UploadFile[]' }
]

const slotCols: TableColumn[] = [
  { key: 'name', label: '插槽名', rowHeader: true, minWidth: '140px' },
  { key: 'description', label: '说明', minWidth: '300px', wrap: true }
]

const slotRows = [
  { name: 'default', description: '替换默认图标和主文案，保留 hint；请使用非交互内容。' }
]
</script>

<style scoped>
.custom-upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--fgColor-muted);
}

.custom-upload-text {
  margin: 0;
  font-size: 1rem;
  color: var(--fgColor-default);
}

.custom-upload-hint {
  margin: 0;
  font-size: 0.85rem;
  color: var(--fgColor-muted);
}
</style>
