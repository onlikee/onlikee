<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Avatar 头像"
      description="用于展示用户头像或占位符。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        通过 <code>src</code> 设置图片地址，或使用 <code>placeholder</code> 显示占位文字。
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
        通过 <code>size</code> 设置头像大小，支持数字（像素）或字符串（如 rem）。
      </template>

      <ComponentDocsDemoBlock :code="demo2Code">
        <div class="avatar-row">
          <Avatar
            src="https://avatars.githubusercontent.com/u/131276691?v=4"
            :size="24"
          />
          <Avatar
            src="https://avatars.githubusercontent.com/u/131276691?v=4"
            :size="32"
          />
          <Avatar
            src="https://avatars.githubusercontent.com/u/131276691?v=4"
            :size="40"
          />
          <Avatar
            src="https://avatars.githubusercontent.com/u/131276691?v=4"
            :size="56"
          />
          <Avatar
            src="https://avatars.githubusercontent.com/u/131276691?v=4"
            :size="72"
          />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="占位符尺寸">
      <template #description>
        占位符文字大小会根据头像尺寸自动计算。
      </template>

      <ComponentDocsDemoBlock :code="demo3Code">
        <div class="avatar-row">
          <Avatar
            placeholder="S"
            :size="24"
          />
          <Avatar
            placeholder="M"
            :size="32"
          />
          <Avatar
            placeholder="L"
            :size="40"
          />
          <Avatar
            placeholder="XL"
            :size="56"
          />
          <Avatar
            placeholder="XXL"
            :size="72"
          />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection
      title="API"
      variant="api"
    >
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

const apiTableColumns: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '140px' },
  { key: 'default', label: '默认值', minWidth: '120px' },
  { key: 'type', label: '类型', minWidth: '160px', wrap: true },
  { key: 'description', label: '说明', minWidth: '200px', wrap: true }
]

const apiTableRows = [
  {
    name: 'src',
    description: '头像图片地址',
    type: 'string',
    default: '—'
  },
  {
    name: 'alt',
    description: '图片的 alt 属性',
    type: 'string',
    default: '—'
  },
  {
    name: 'placeholder',
    description: '占位符文字（无图片时显示）',
    type: 'string',
    default: '—'
  },
  {
    name: 'size',
    description: '头像尺寸',
    type: 'number | string',
    default: '40'
  }
]
</script>

<style scoped>
.avatar-row {
  display: flex;
  gap: 16px;
  align-items: center;
}
</style>
