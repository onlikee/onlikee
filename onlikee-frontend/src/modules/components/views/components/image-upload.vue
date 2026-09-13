<script setup lang="ts">
import { ref } from 'vue'
import { ImageUpload, type ImageUploadFile } from '@/components/primer-vue/ImageUpload'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const images = ref<ImageUploadFile[]>([])
const croppedImages = ref<ImageUploadFile[]>([])
const jpegImages = ref<ImageUploadFile[]>([])

const demoCode = `<script setup lang="ts">
import { ref } from 'vue'
import { ImageUpload, type ImageUploadFile } from '@/components/primer-vue/ImageUpload'

const images = ref<ImageUploadFile[]>([])
<\/script>

<template>
  <ImageUpload v-model="images" style="max-width: 240px" />
</template>`

const cropCode = `<ImageUpload v-model="images" crop style="max-width: 240px" />`
const acceptCode = `<ImageUpload v-model="images" accept="image/jpeg" hint="仅支持 JPG、JPEG 图片" />`
const disabledCode = `<ImageUpload disabled />`
const apiCols: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '140px' },
  { key: 'default', label: '默认值', minWidth: '100px' },
  { key: 'type', label: '类型', minWidth: '160px', wrap: true },
  { key: 'description', label: '说明', minWidth: '260px', wrap: true }
]
const apiRows = [
  { name: 'modelValue', default: '[]', type: 'ImageUploadFile[]', description: '最多一张已选择或已确认裁剪的图片；置空可清除预览。不绑定时也可在组件内预览。' },
  { name: 'crop', default: 'false', type: 'boolean', description: '是否启用裁剪。默认直接返回原图；启用后确认裁剪才提交。关闭时取消正在进行的裁剪并保留旧值。' },
  { name: 'accept', default: "''", type: 'string', description: '在 JPG、JPEG、PNG、WEBP、SVG 中进一步筛选，支持扩展名、MIME 和 image/*；不能扩大默认范围。' },
  { name: 'hint', default: '默认格式提示', type: 'string', description: '未选择图片时显示的辅助文案。' },
  { name: 'disabled', default: 'false', type: 'boolean', description: '禁用选择和拖拽；切换为禁用时取消当前裁剪。' }
]
const fileCols: TableColumn[] = [
  { key: 'name', label: '字段', rowHeader: true },
  { key: 'type', label: '类型' },
  { key: 'description', label: '说明', wrap: true }
]
const fileRows = [
  { name: 'file', type: 'File', description: 'crop=false 时为原始 File，不转换格式；crop=true 时为浏览器生成的正方形裁剪文件，JPEG、PNG、WEBP 保留格式，SVG 输出 PNG。均可用于 FormData。' },
  { name: 'relativePath', type: 'string', description: '所返回文件的文件名，与 UploadFile 的数据结构一致。' }
]
const eventRows = [
  { name: 'update:modelValue', type: 'ImageUploadFile[]', description: '未启用裁剪时选择有效文件即触发；启用后确认裁剪才触发。取消裁剪、选择无效文件均不改变原值。' }
]
const slotRows = [
  { name: 'default', type: '—', description: '替换空上传区域的图标与文字，已选择的图片预览优先显示。请使用非交互内容。' }
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="ImageUpload 图片上传"
      description="沿用 Upload 的视觉与文件结构，独立实现图片选择、头像裁剪和本地预览，不依赖其他组件。"
    />
    <ComponentDocsSection title="基础用法">
      <template #description>
        点击或拖拽单张 JPG、JPEG、PNG、WEBP、SVG 图片，默认直接预览并返回原始文件，不弹出裁剪窗口。
        预览通过 object-fit: cover 等比铺满上传区域；非正方形图片的边缘可能被遮住，但原始文件完整不变。
        组件默认占满父容器宽度，上传区保持 1:1，选择前后尺寸不变；可通过组件的 width 或 max-width 样式控制整体宽度。此例使用 style="max-width: 240px"，将最大宽度限制为 240px，小屏时自动缩小。
        全部处理在本地完成，组件不会发送上传请求。
      </template>
      <ComponentDocsDemoBlock :code="demoCode">
        <ImageUpload
          v-model="images"
          style="max-width: 240px"
        />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="启用裁剪">
      <template #description>
        设置 crop 后启用正方形裁剪，圆形虚线作为头像参考。拖动选区或四角调整，点击确认后更新绑定值；取消保留旧图片。
        默认行为已从自动裁剪改为直接选择，需要裁剪时请显式传入 crop。切换为 true 不会自动裁剪已有图片。
      </template>
      <ComponentDocsDemoBlock :code="cropCode">
        <ImageUpload
          v-model="croppedImages"
          crop
          style="max-width: 240px"
        />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="进一步限制格式">
      <template #description>
        accept 与默认允许格式取交集；例如 image/jpeg 仅允许 JPG、JPEG，image/* 仍不允许 GIF。
      </template>
      <ComponentDocsDemoBlock :code="acceptCode">
        <ImageUpload
          v-model="jpegImages"
          accept="image/jpeg"
          hint="仅支持 JPG、JPEG 图片"
        />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="禁用状态">
      <ComponentDocsDemoBlock :code="disabledCode">
        <ImageUpload disabled />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="ImageUploadFile 类型">
      <template #description>
        通过 import type { ImageUploadFile } from '@/components/primer-vue/ImageUpload' 引入类型。
        绑定值包含原图或已确认的裁剪结果，最多一个元素；外部将绑定值设为空数组可清除预览。
      </template>
      <Table
        :columns="fileCols"
        :data="fileRows"
        row-key="name"
        compact
        :hoverable="false"
      />
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
        :columns="fileCols"
        :data="eventRows"
        row-key="name"
        compact
        :hoverable="false"
      />
      <h3>插槽</h3>
      <Table
        :columns="fileCols"
        :data="slotRows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>
