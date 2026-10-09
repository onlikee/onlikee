<script setup lang="ts">
import { Avatar } from '@/components/primer-vue/Avatar'
import { AvatarStack } from '@/components/primer-vue/AvatarStack'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'

const columns: TableColumn[] = [
  { key: 'name', label: '属性', rowHeader: true },
  { key: 'type', label: '类型', wrap: true },
  { key: 'default', label: '默认值' },
  { key: 'description', label: '说明', wrap: true },
]
const rows = [
  {
    name: 'variant',
    type: "'cascade' | 'stack'",
    default: 'cascade',
    description: '渐隐或等距堆叠',
  },
  {
    name: 'shape',
    type: "'circle' | 'square'",
    default: 'circle',
    description: '头像形状；circle 不覆盖子 Avatar 显式设置的 square',
  },
  { name: 'alignRight', type: 'boolean', default: 'false', description: '从右侧开始堆叠与展开' },
  { name: 'disableExpand', type: 'boolean', default: 'false', description: '禁用悬停和聚焦展开' },
  {
    name: 'size',
    type: 'number | { narrow?: number; regular?: number; wide?: number }',
    default: '由子项推导',
    description: '未设置时，各断点取直接子项 size 的最小值；未指定尺寸的子项按 20px 计算',
  },
]
const cascadeCode = `<AvatarStack>
  <Avatar alt="Primer logo" src="https://avatars.githubusercontent.com/primer" />
  <Avatar alt="GitHub logo" src="https://avatars.githubusercontent.com/github" />
  <Avatar alt="Atom logo" src="https://avatars.githubusercontent.com/atom" />
  <Avatar alt="GitHub Desktop logo" src="https://avatars.githubusercontent.com/desktop" />
</AvatarStack>`

const stackCode = `<AvatarStack variant="stack">
  <Avatar alt="Primer logo" src="https://avatars.githubusercontent.com/primer" />
  <Avatar alt="GitHub logo" src="https://avatars.githubusercontent.com/github" />
  <Avatar alt="Atom logo" src="https://avatars.githubusercontent.com/atom" />
  <Avatar alt="GitHub Desktop logo" src="https://avatars.githubusercontent.com/desktop" />
</AvatarStack>`

const rightCode = `<AvatarStack align-right>
  <Avatar alt="Primer logo" src="https://avatars.githubusercontent.com/primer" />
  <Avatar alt="GitHub logo" src="https://avatars.githubusercontent.com/github" />
  <Avatar alt="Atom logo" src="https://avatars.githubusercontent.com/atom" />
  <Avatar alt="GitHub Desktop logo" src="https://avatars.githubusercontent.com/desktop" />
</AvatarStack>`

const squareCode = `<AvatarStack shape="square" :size="32">
  <Avatar alt="Primer logo" src="https://avatars.githubusercontent.com/primer" />
  <Avatar alt="GitHub logo" src="https://avatars.githubusercontent.com/github" />
  <Avatar alt="Atom logo" src="https://avatars.githubusercontent.com/atom" />
  <Avatar alt="GitHub Desktop logo" src="https://avatars.githubusercontent.com/desktop" />
</AvatarStack>`

const disabledCode = `<AvatarStack disable-expand>
  <Avatar alt="Primer logo" src="https://avatars.githubusercontent.com/primer" />
  <Avatar alt="GitHub logo" src="https://avatars.githubusercontent.com/github" />
  <Avatar alt="Atom logo" src="https://avatars.githubusercontent.com/atom" />
  <Avatar alt="GitHub Desktop logo" src="https://avatars.githubusercontent.com/desktop" />
</AvatarStack>`

const responsiveCode = `<AvatarStack :size="{ narrow: 24, regular: 32, wide: 40 }">
  <Avatar alt="Primer logo" src="https://avatars.githubusercontent.com/primer" />
  <Avatar alt="GitHub logo" src="https://avatars.githubusercontent.com/github" />
  <Avatar alt="Atom logo" src="https://avatars.githubusercontent.com/atom" />
  <Avatar alt="GitHub Desktop logo" src="https://avatars.githubusercontent.com/desktop" />
</AvatarStack>`

const inferredCode = `<AvatarStack>
  <Avatar alt="Primer logo" src="https://avatars.githubusercontent.com/primer" :size="40" />
  <Avatar alt="GitHub logo" src="https://avatars.githubusercontent.com/github" :size="32" />
  <Avatar alt="Atom logo" src="https://avatars.githubusercontent.com/atom" :size="24" />
  <Avatar alt="GitHub Desktop logo" src="https://avatars.githubusercontent.com/desktop" :size="32" />
</AvatarStack>`

const linkedCode = `<AvatarStack :size="32">
  <a href="https://github.com/primer">
    <Avatar alt="Primer logo" src="https://avatars.githubusercontent.com/primer" />
  </a>
  <a href="https://github.com/github">
    <Avatar alt="GitHub logo" src="https://avatars.githubusercontent.com/github" />
  </a>
  <a href="https://github.com/atom">
    <Avatar alt="Atom logo" src="https://avatars.githubusercontent.com/atom" />
  </a>
  <a href="https://github.com/desktop">
    <Avatar alt="GitHub Desktop logo" src="https://avatars.githubusercontent.com/desktop" />
  </a>
</AvatarStack>`
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="AvatarStack 头像堆叠"
      description="紧凑展示一组头像，支持悬停与键盘聚焦展开。"
    />
    <ComponentDocsSection title="渐隐堆叠">
      <template #description> 默认 cascade 样式，悬停或键盘聚焦可展开全部头像。 </template>
      <ComponentDocsDemoBlock :code="cascadeCode">
        <AvatarStack>
          <Avatar alt="Primer logo" src="https://avatars.githubusercontent.com/primer" />
          <Avatar alt="GitHub logo" src="https://avatars.githubusercontent.com/github" />
          <Avatar alt="Atom logo" src="https://avatars.githubusercontent.com/atom" />
          <Avatar alt="GitHub Desktop logo" src="https://avatars.githubusercontent.com/desktop" />
        </AvatarStack>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="等距堆叠">
      <template #description> stack 样式保持相同重叠间距，不逐层降低透明度。 </template>
      <ComponentDocsDemoBlock :code="stackCode">
        <AvatarStack variant="stack">
          <Avatar alt="Primer logo" src="https://avatars.githubusercontent.com/primer" />
          <Avatar alt="GitHub logo" src="https://avatars.githubusercontent.com/github" />
          <Avatar alt="Atom logo" src="https://avatars.githubusercontent.com/atom" />
          <Avatar alt="GitHub Desktop logo" src="https://avatars.githubusercontent.com/desktop" />
        </AvatarStack>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="右对齐">
      <template #description> 从右向左堆叠与展开，保持插槽中的头像顺序。 </template>
      <ComponentDocsDemoBlock :code="rightCode">
        <AvatarStack align-right>
          <Avatar alt="Primer logo" src="https://avatars.githubusercontent.com/primer" />
          <Avatar alt="GitHub logo" src="https://avatars.githubusercontent.com/github" />
          <Avatar alt="Atom logo" src="https://avatars.githubusercontent.com/atom" />
          <Avatar alt="GitHub Desktop logo" src="https://avatars.githubusercontent.com/desktop" />
        </AvatarStack>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="方形头像">
      <template #description> 通过 shape 设置圆角方形头像。 </template>
      <ComponentDocsDemoBlock :code="squareCode">
        <AvatarStack shape="square" :size="32">
          <Avatar alt="Primer logo" src="https://avatars.githubusercontent.com/primer" />
          <Avatar alt="GitHub logo" src="https://avatars.githubusercontent.com/github" />
          <Avatar alt="Atom logo" src="https://avatars.githubusercontent.com/atom" />
          <Avatar alt="GitHub Desktop logo" src="https://avatars.githubusercontent.com/desktop" />
        </AvatarStack>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="禁用展开">
      <template #description> disableExpand 禁用悬停和聚焦展开，容器不再加入 Tab 顺序。 </template>
      <ComponentDocsDemoBlock :code="disabledCode">
        <AvatarStack disable-expand>
          <Avatar alt="Primer logo" src="https://avatars.githubusercontent.com/primer" />
          <Avatar alt="GitHub logo" src="https://avatars.githubusercontent.com/github" />
          <Avatar alt="Atom logo" src="https://avatars.githubusercontent.com/atom" />
          <Avatar alt="GitHub Desktop logo" src="https://avatars.githubusercontent.com/desktop" />
        </AvatarStack>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="响应式尺寸">
      <template #description>
        小于 768px 为 24px，768px 起为 32px，1400px 起为 40px。父级 size
        优先于子项尺寸，缺失断点使用 20px。
      </template>
      <ComponentDocsDemoBlock :code="responsiveCode">
        <AvatarStack :size="{ narrow: 24, regular: 32, wide: 40 }">
          <Avatar alt="Primer logo" src="https://avatars.githubusercontent.com/primer" />
          <Avatar alt="GitHub logo" src="https://avatars.githubusercontent.com/github" />
          <Avatar alt="Atom logo" src="https://avatars.githubusercontent.com/atom" />
          <Avatar alt="GitHub Desktop logo" src="https://avatars.githubusercontent.com/desktop" />
        </AvatarStack>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="从子项推导尺寸">
      <template #description> 本例统一使用子项的最小尺寸 24px。 </template>
      <ComponentDocsDemoBlock :code="inferredCode">
        <AvatarStack>
          <Avatar alt="Primer logo" src="https://avatars.githubusercontent.com/primer" :size="40" />
          <Avatar alt="GitHub logo" src="https://avatars.githubusercontent.com/github" :size="32" />
          <Avatar alt="Atom logo" src="https://avatars.githubusercontent.com/atom" :size="24" />
          <Avatar
            alt="GitHub Desktop logo"
            src="https://avatars.githubusercontent.com/desktop"
            :size="32"
          />
        </AvatarStack>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="链接头像">
      <template #description>
        存在可交互子项时，容器不额外加入 Tab 顺序，通过子项聚焦展开。class、style、ARIA
        属性与事件透传到外层容器。
      </template>
      <ComponentDocsDemoBlock :code="linkedCode">
        <AvatarStack :size="32">
          <a href="https://github.com/primer">
            <Avatar alt="Primer logo" src="https://avatars.githubusercontent.com/primer" />
          </a>
          <a href="https://github.com/github">
            <Avatar alt="GitHub logo" src="https://avatars.githubusercontent.com/github" />
          </a>
          <a href="https://github.com/atom">
            <Avatar alt="Atom logo" src="https://avatars.githubusercontent.com/atom" />
          </a>
          <a href="https://github.com/desktop">
            <Avatar alt="GitHub Desktop logo" src="https://avatars.githubusercontent.com/desktop" />
          </a>
        </AvatarStack>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection id="avatar-stack-api" title="API" variant="api">
      <Table :columns="columns" :data="rows" row-key="name" compact :hoverable="false" />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>
