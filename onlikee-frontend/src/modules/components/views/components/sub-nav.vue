<script setup lang="ts">
import { shallowRef, useId } from 'vue'
import { SubNav } from '@/components/primer-vue/SubNav'
import { Text } from '@/components/primer-vue/Text'
import { TextInput } from '@/components/primer-vue/TextInput'
import { Button } from '@/components/primer-vue/Button'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'
import ComponentDocsPage from '../../components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsHeader from '../../components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsSection from '../../components/ComponentDocsPage/ComponentDocsSection.vue'
import ComponentDocsDemoBlock from '../../components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '../../components/ComponentDocsPage/ComponentDocsTable.vue'

const selected = shallowRef('all')
const documentationId = useId()
const search = shallowRef('')
const basicCode = `<SubNav label="项目筛选">
  <SubNav.Links>
    <SubNav.Link href="#all" :selected="selected === 'all'" @click.prevent="selected = 'all'">全部</SubNav.Link>
    <SubNav.Link href="#mine" :selected="selected === 'mine'" @click.prevent="selected = 'mine'">我的</SubNav.Link>
  </SubNav.Links>
</SubNav>`
const compositionCode = `<SubNav label="项目列表" class="project-nav">
  <SubNav.Links>
    <SubNav.Link href="#projects" selected><Text weight="semibold">项目</Text></SubNav.Link>
    <SubNav.Link href="#archived">归档</SubNav.Link>
  </SubNav.Links>
  <TextInput v-model:value="search" aria-label="搜索项目" placeholder="搜索项目" />
  <template #actions><Button>新建</Button></template>
</SubNav>`
const columns: DocumentationColumn[] = [
  { field: 'name', header: '属性', rowHeader: true },
  { field: 'type', header: '类型' },
  { field: 'description', header: '说明' },
]
const rows = [
  {
    id: 'label',
    name: 'SubNav.label',
    type: 'string',
    description: '导航的可访问名称；显式 aria-label 优先。',
  },
  {
    id: 'actions',
    name: 'SubNav.actions / #actions',
    type: 'VNodeChild / slot',
    description: '右侧操作区；显式 actions 属性优先于插槽。',
  },
  {
    id: 'selected',
    name: 'SubNav.Link.selected',
    type: 'boolean',
    description: '设置 data-selected 和 aria-current；由调用方维护选中状态。',
  },
  {
    id: 'href',
    name: 'SubNav.Link.href',
    type: 'string',
    description: '原生链接目标。to 按源码作为属性透传，不自动接入 Vue Router。',
  },
  {
    id: 'native',
    name: 'class / className / style / 原生属性',
    type: 'HTML attributes',
    description: '透传到各自的 nav、div、a；模板 ref.element 指向对应 DOM。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="SubNav 子导航"
      description="由 SubNav、SubNav.Links 和 SubNav.Link 组成的分组链接导航，支持搜索框与操作按钮组合。"
    />
    <ComponentDocsSection title="基础用法">
      <template #description
        >使用 label 标识导航区域；链接保留原生键盘和导航行为，selected 由调用方控制。</template
      >
      <ComponentDocsDemoBlock :code="basicCode">
        <SubNav label="项目筛选">
          <SubNav.Links>
            <SubNav.Link
              href="#all"
              :selected="selected === 'all'"
              @click.prevent="selected = 'all'"
              >全部</SubNav.Link
            >
            <SubNav.Link
              href="#mine"
              :selected="selected === 'mine'"
              @click.prevent="selected = 'mine'"
              >我的</SubNav.Link
            >
          </SubNav.Links>
        </SubNav>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="组合搜索与操作">
      <template #description
        >默认插槽进入导航主体，actions 插槽进入操作区。窄屏换行由页面样式控制。</template
      >
      <ComponentDocsDemoBlock :code="compositionCode">
        <SubNav label="项目列表" class="project-nav">
          <SubNav.Links>
            <SubNav.Link href="#projects" selected><Text weight="semibold">项目</Text></SubNav.Link>
            <SubNav.Link href="#archived">归档</SubNav.Link>
          </SubNav.Links>
          <TextInput v-model:value="search" aria-label="搜索项目" placeholder="搜索项目" />
          <template #actions><Button>新建</Button></template>
        </SubNav>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="属性">
      <VisuallyHidden :id="documentationId">SubNav API</VisuallyHidden>
      <ComponentDocsTable :aria-labelledby="documentationId" :columns="columns" :data="rows" />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.project-nav {
  flex-wrap: wrap;
  gap: 8px;
}
.project-nav :deep(.SubNav-body) {
  flex-wrap: wrap;
  gap: 8px;
}
.project-nav :deep(.SubNav-body > *) {
  margin-left: 0;
}
</style>
