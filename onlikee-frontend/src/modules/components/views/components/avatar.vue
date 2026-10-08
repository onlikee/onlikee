<template>
  <ComponentDocsPage>
    <ComponentDocsHeader title="Avatar 头像" description="用于展示用户头像或占位符。" />

    <ComponentDocsSection title="基础用法">
      <template #description>
        通过 <code>src</code> 设置图片地址，或使用
        <code>placeholder</code> 显示占位文字。占位文字仅在 src
        为空时显示，图片加载中或失败时不会替换图片。
      </template>

      <ComponentDocsDemoBlock :code="demo1Code">
        <div class="avatar-row">
          <Avatar src="https://avatars.githubusercontent.com/u/131276691?v=4" />
          <Avatar placeholder="U" />
          <Avatar placeholder="AB" />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="不同尺寸">
      <template #description>
        通过 <code>size</code> 设置头像大小，使用数字（像素），默认 20px。
      </template>

      <ComponentDocsDemoBlock :code="demo2Code">
        <div class="avatar-row">
          <Avatar src="https://avatars.githubusercontent.com/u/131276691?v=4" :size="24" />
          <Avatar src="https://avatars.githubusercontent.com/u/131276691?v=4" :size="32" />
          <Avatar src="https://avatars.githubusercontent.com/u/131276691?v=4" :size="40" />
          <Avatar src="https://avatars.githubusercontent.com/u/131276691?v=4" :size="56" />
          <Avatar src="https://avatars.githubusercontent.com/u/131276691?v=4" :size="72" />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="占位符尺寸">
      <template #description> 占位符文字大小会根据头像尺寸自动计算。 </template>

      <ComponentDocsDemoBlock :code="demo3Code">
        <div class="avatar-row">
          <Avatar placeholder="S" :size="24" />
          <Avatar placeholder="M" :size="32" />
          <Avatar placeholder="L" :size="40" />
          <Avatar placeholder="XL" :size="56" />
          <Avatar placeholder="XXL" :size="72" />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="方形头像">
      <template #description>
        使用 <code>square</code> 显示圆角方形头像，图片与占位文字使用相同的形状规则。
      </template>
      <ComponentDocsDemoBlock :code="squareCode">
        <div class="avatar-row">
          <Avatar src="https://avatars.githubusercontent.com/u/131276691?v=4" :size="40" square />
          <Avatar placeholder="AB" :size="40" square alt="用户 AB" />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="响应式尺寸">
      <template #description>
        narrow 对应小于 768px，regular 对应 768px 起，wide 对应 1400px 起。
        建议填写全部断点；未填写的断点不补默认尺寸。调整窗口宽度查看效果。
      </template>
      <ComponentDocsDemoBlock :code="responsiveCode">
        <div class="avatar-row">
          <Avatar
            src="https://avatars.githubusercontent.com/u/131276691?v=4"
            :size="{ narrow: 24, regular: 40, wide: 64 }"
          />
          <Avatar placeholder="AB" :size="{ narrow: 24, regular: 40, wide: 64 }" />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="原生图片属性">
      <template #description>
        图片分支透传 loading、srcset、class、style 和原生事件。头像旁没有用户名时，应提供 alt。
      </template>
      <ComponentDocsDemoBlock :code="nativeCode">
        <div class="avatar-row">
          <Avatar
            src="https://avatars.githubusercontent.com/u/131276691?v=4"
            srcset="https://avatars.githubusercontent.com/u/131276691?v=4&amp;s=80 2x"
            loading="lazy"
            alt="用户头像"
            :size="40"
            style="background: var(--bgColor-muted)"
          />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="API" variant="api">
      <Table
        :columns="apiTableColumns"
        :data="apiTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { Avatar } from '@/components/primer-vue/Avatar'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const demo1Code = `<template>
  <Avatar src="https://avatars.githubusercontent.com/u/131276691?v=4" />
  <Avatar placeholder="U" />
  <Avatar placeholder="AB" />
</template>

<script setup lang="ts">
import { Avatar } from '@/components/primer-vue/Avatar'
<\/script>`

const demo2Code = `<template>
  <Avatar src="https://avatars.githubusercontent.com/u/131276691?v=4" :size="24" />
  <Avatar src="https://avatars.githubusercontent.com/u/131276691?v=4" :size="32" />
  <Avatar src="https://avatars.githubusercontent.com/u/131276691?v=4" :size="40" />
  <Avatar src="https://avatars.githubusercontent.com/u/131276691?v=4" :size="56" />
  <Avatar src="https://avatars.githubusercontent.com/u/131276691?v=4" :size="72" />
</template>

<script setup lang="ts">
import { Avatar } from '@/components/primer-vue/Avatar'
<\/script>`

const demo3Code = `<template>
  <Avatar placeholder="S" :size="24" />
  <Avatar placeholder="M" :size="32" />
  <Avatar placeholder="L" :size="40" />
  <Avatar placeholder="XL" :size="56" />
  <Avatar placeholder="XXL" :size="72" />
</template>

<script setup lang="ts">
import { Avatar } from '@/components/primer-vue/Avatar'
<\/script>`

const squareCode = `<Avatar src="https://avatars.githubusercontent.com/u/131276691?v=4" :size="40" square />
<Avatar placeholder="AB" :size="40" square alt="用户 AB" />`

const responsiveCode = `<Avatar src="https://avatars.githubusercontent.com/u/131276691?v=4" :size="{ narrow: 24, regular: 40, wide: 64 }" />
<Avatar placeholder="AB" :size="{ narrow: 24, regular: 40, wide: 64 }" />`

const nativeCode = `<Avatar
  src="https://avatars.githubusercontent.com/u/131276691?v=4"
  srcset="https://avatars.githubusercontent.com/u/131276691?v=4&s=80 2x"
  loading="lazy"
  alt="用户头像"
  :size="40"
  style="background: var(--bgColor-muted)"
/>`

const apiTableColumns: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '140px' },
  { key: 'default', label: '默认值', minWidth: '120px' },
  { key: 'type', label: '类型', minWidth: '160px', wrap: true },
  { key: 'description', label: '说明', minWidth: '200px', wrap: true },
]

const apiTableRows = [
  {
    name: 'src',
    description: '头像图片地址；未提供或为空时显示 placeholder',
    type: 'string',
    default: '—',
  },
  {
    name: 'alt',
    description: '图片替代文本；占位分支用作无障碍名称',
    type: 'string',
    default: '空字符串',
  },
  {
    name: 'placeholder',
    description: '占位文字（仅 src 为空时显示）',
    type: 'string',
    default: '空字符串',
  },
  {
    name: 'size',
    description: '头像尺寸',
    type: 'number | { narrow?: number; regular?: number; wide?: number }',
    default: '20',
  },
  {
    name: 'square',
    description: '使用圆角方形头像',
    type: 'boolean',
    default: 'false',
  },
]
</script>

<style scoped>
.avatar-row {
  display: flex;
  gap: 16px;
  align-items: center;
}
</style>
