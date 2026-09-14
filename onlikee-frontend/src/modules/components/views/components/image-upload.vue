<script setup lang="ts">
import { ref } from 'vue'
import { ImageUpload, type ImageUploadFile } from '@/components/primer-vue/ImageUpload'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const images = ref<ImageUploadFile[]>([])
const circleImages = ref<ImageUploadFile[]>([])
const croppedImages = ref<ImageUploadFile[]>([])
const jpegImages = ref<ImageUploadFile[]>([])
const customImages = ref<ImageUploadFile[]>([])

const demoCode = `<script setup lang="ts">
import { ref } from 'vue'
import { ImageUpload, type ImageUploadFile } from '@/components/primer-vue/ImageUpload'

const images = ref<ImageUploadFile[]>([])
<\/script>

<template>
  <ImageUpload v-model="images" text="选择图片" width="100px" />
</template>`

const circleCode = `<ImageUpload v-model="images" circle text="选择头像" width="100px" />`
const cropCode = `<ImageUpload v-model="images" crop width="100px" />`
const acceptCode = `<ImageUpload v-model="images" accept="image/jpeg" hint="仅支持 JPG、JPEG 图片" width="100px" />`
const disabledCode = `<ImageUpload disabled width="100px" />`
const customCode = `<script setup lang="ts">
import { ref } from 'vue'
import { ImageUpload, type ImageUploadFile } from '@/components/primer-vue/ImageUpload'

const images = ref<ImageUploadFile[]>([])
<\/script>

<template>
  <ImageUpload v-model="images" width="100px" hint="点击或拖拽">
    <span aria-hidden="true">＋</span>
    <span>添加封面</span>
  </ImageUpload>
</template>`
const apiCols: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '140px' },
  { key: 'default', label: '默认值', minWidth: '100px' },
  { key: 'type', label: '类型', minWidth: '160px', wrap: true },
  { key: 'description', label: '说明', minWidth: '260px', wrap: true }
]
const apiRows = [
  { name: 'modelValue', default: '[]', type: 'ImageUploadFile[]', description: '最多一张已选择或已确认裁剪的图片；置空可清除预览。不绑定时也可在组件内预览。' },
  { name: 'width', default: "''", type: 'string', description: '根容器 .image-upload 的宽度，支持 CSS 尺寸值，如 100px、100%；未设置时占满父容器宽度。' },
  { name: 'circle', default: 'false', type: 'boolean', description: '以圆形显示上传区域和图片预览，不改变返回文件的形状。可与 crop 搭配使用。' },
  { name: 'crop', default: 'false', type: 'boolean', description: '是否启用裁剪。默认直接返回原图；启用后确认裁剪才提交。关闭时取消正在进行的裁剪并保留旧值。' },
  { name: 'accept', default: "''", type: 'string', description: '在 JPG、JPEG、PNG、WEBP、SVG 中进一步筛选，支持扩展名、MIME 和 image/*；不能扩大默认范围。' },
  { name: 'text', default: "''", type: 'string', description: '未选择图片时显示的主文案，为空时不渲染。' },
  { name: 'hint', default: "''", type: 'string', description: '未选择图片时显示的辅助说明，为空时不渲染。' },
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
  { name: 'default', type: '—', description: '替换空上传区域的图标和主文案，保留 hint；选择图片后显示预览。请使用非交互内容。' }
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="ImageUpload 图片上传"
      description="支持单张图片选择、本地预览、圆形展示和可选裁剪。通过 v-model 获取文件，上传请求由业务侧处理。"
    />
    <ComponentDocsSection title="基础用法">
      <template #description>
        点击或拖拽选择 JPG、JPEG、PNG、WEBP、SVG 图片，通过 <code>v-model</code> 获取原始文件。
        预览会等比铺满上传区域，超出的部分隐藏，原始文件保持完整。
        上传区默认占满父容器宽度并保持 1:1，可通过 <code>width</code> 属性设置宽度。本页所有示例均设置为 <code>width="100px"</code>。
        通过 <code>text</code> 设置主文案、<code>hint</code> 设置辅助说明，两者默认均为空。
      </template>
      <ComponentDocsDemoBlock :code="demoCode">
        <ImageUpload
          v-model="images"
          text="选择图片"
          width="100px"
        />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="圆形展示">
      <template #description>
        设置 <code>circle</code> 后，上传区域和图片预览显示为圆形，适合头像选择。
        圆形展示不改变返回的文件；如需裁剪，可同时设置 <code>crop</code>，确认后返回正方形图片。
      </template>
      <ComponentDocsDemoBlock :code="circleCode">
        <ImageUpload
          v-model="circleImages"
          circle
          text="选择头像"
          width="100px"
        />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="启用裁剪">
      <template #description>
        设置 <code>crop</code> 后，选择图片会打开裁剪窗口。拖动选区移动位置，拖动四角调整大小；圆形虚线可用于预览头像范围。
        确认后返回正方形裁剪结果，取消则保留原有图片。开启此属性后，下次选择图片时才会进入裁剪。
      </template>
      <ComponentDocsDemoBlock :code="cropCode">
        <ImageUpload
          v-model="croppedImages"
          crop
          width="100px"
        />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="限制图片格式">
      <template #description>
        通过 <code>accept</code> 缩小可选格式范围。例如 <code>image/jpeg</code> 仅允许 JPG、JPEG；设置 <code>image/*</code> 时仍只支持组件默认的五种格式。
      </template>
      <ComponentDocsDemoBlock :code="acceptCode">
        <ImageUpload
          v-model="jpegImages"
          accept="image/jpeg"
          hint="仅支持 JPG、JPEG 图片"
          width="100px"
        />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="禁用状态">
      <template #description>
        设置 <code>disabled</code> 后无法点击选择或拖入图片，已有预览仍会保留。
      </template>
      <ComponentDocsDemoBlock :code="disabledCode">
        <ImageUpload
          disabled
          width="100px"
        />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="自定义插槽">
      <template #description>
        使用默认插槽替换未选择图片时的图标和主文案，<code>hint</code> 仍会独立显示。
        选择图片后显示预览，清空绑定值后恢复插槽内容。上传区域整体可点击，插槽内请使用非交互内容。
      </template>
      <ComponentDocsDemoBlock :code="customCode">
        <ImageUpload
          v-model="customImages"
          width="100px"
          hint="点击或拖拽"
        >
          <span aria-hidden="true">＋</span>
          <span>添加封面</span>
        </ImageUpload>
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
