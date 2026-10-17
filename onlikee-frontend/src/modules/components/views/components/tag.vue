<template>
  <ComponentDocsPage>
    <ComponentDocsHeader title="Tag 标签" description="用于标记和选择。" />

    <ComponentDocsSection title="基础用法">
      <template #description> 直接使用 <code>Tag</code> 组件即可。 </template>
      <ComponentDocsDemoBlock :code="demo1Code">
        <div class="tag-row">
          <Tag>Tag</Tag>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="不同尺寸">
      <template #description> 通过 <code>size</code> 属性设置标签尺寸。 </template>
      <ComponentDocsDemoBlock :code="demo2Code">
        <div class="tag-row">
          <Tag size="small"> small </Tag>
          <Tag size="medium"> medium </Tag>
          <Tag size="large"> large </Tag>
          <Tag size="xlarge"> xlarge </Tag>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="自定义颜色">
      <template #description>
        通过 <code>color</code> 和 <code>background</code> 属性自定义字体颜色和背景色。
      </template>
      <ComponentDocsDemoBlock :code="demo3Code">
        <div class="tag-row">
          <Tag>默认</Tag>
          <Tag color="#1a7f37" background="#dafbe1"> 成功 </Tag>
          <Tag color="#9a6700" background="#fff8c5"> 警告 </Tag>
          <Tag color="#cf222e" background="#ffebe9"> 危险 </Tag>
          <Tag color="#6639ba" background="#fbefff"> 紫色 </Tag>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="带图标">
      <template #description> 通过 <code>Tag.leadingVisual</code> 子组件添加前置图标。 </template>
      <ComponentDocsDemoBlock :code="demo4Code">
        <div class="tag-row">
          <Tag>
            <Tag.leadingVisual>
              <StarIcon />
            </Tag.leadingVisual>
            StarIcon
          </Tag>
          <Tag color="#1a7f37" background="#dafbe1">
            <Tag.leadingVisual>
              <CheckIcon />
            </Tag.leadingVisual>
            已完成
          </Tag>
          <Tag color="#cf222e" background="#ffebe9">
            <Tag.leadingVisual>
              <AlertIcon />
            </Tag.leadingVisual>
            错误
          </Tag>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="可删除">
      <template #description>
        设置 <code>removable</code> 属性后，标签右侧会显示删除按钮；点击时触发
        <code>remove</code> 事件。
      </template>
      <ComponentDocsDemoBlock :code="demo5Code">
        <div class="tag-row">
          <Tag removable> Vue </Tag>
          <Tag removable @remove="() => {}">
            <Tag.leadingVisual>
              <StarIcon />
            </Tag.leadingVisual>
            收藏
          </Tag>
          <Tag color="#1a7f37" background="#dafbe1" removable @remove="() => {}">
            <Tag.leadingVisual>
              <CheckIcon />
            </Tag.leadingVisual>
            已完成
          </Tag>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="API" variant="api">
      <h3>属性</h3>
      <VisuallyHidden :id="`${documentationId}-api-table-0`">Tag 标签 属性</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-0`"
        :columns="apiTableColumns"
        :data="apiTableRows"
      />
      <h3>子组件</h3>
      <VisuallyHidden :id="`${documentationId}-api-table-1`">Tag 标签 子组件</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-1`"
        :columns="slotTableColumns"
        :data="slotTableRows"
      />
      <h3>事件</h3>
      <VisuallyHidden :id="`${documentationId}-api-table-2`">Tag 标签 事件</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-2`"
        :columns="eventTableColumns"
        :data="eventTableRows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { useId as useDocumentationId } from 'vue'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'

import { Tag } from '@/components/primer-vue/Tag'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import { StarIcon, CheckIcon, AlertIcon } from '@onlikee/octicons-vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const documentationId = useDocumentationId()

const demo1Code = `<template>
  <div class="tag-row">
    <Tag>Tag</Tag>
  </div>
</template>

<style scoped>
.tag-row {
  display: flex;
  gap: 20px;
}
</style>`

const demo2Code = `<template>
  <div class="tag-row">
    <Tag size="small">small</Tag>
    <Tag size="medium">medium</Tag>
    <Tag size="large">large</Tag>
    <Tag size="xlarge">xlarge</Tag>
  </div>
</template>

<style scoped>
.tag-row {
  display: flex;
  align-items: center;
  gap: 20px;
}
</style>`

const demo3Code = `<template>
  <div class="tag-row">
    <Tag>默认</Tag>
    <Tag color="#1a7f37" background="#dafbe1">成功</Tag>
    <Tag color="#9a6700" background="#fff8c5">警告</Tag>
    <Tag color="#cf222e" background="#ffebe9">危险</Tag>
    <Tag color="#6639ba" background="#fbefff">紫色</Tag>
  </div>
</template>

<style scoped>
.tag-row {
  display: flex;
  align-items: center;
  gap: 20px;
}
</style>`

const demo4Code = `<script setup lang="ts">
import { Tag } from '@/components/primer-vue/Tag'
import { StarIcon, CheckIcon, AlertIcon } from '@onlikee/octicons-vue'
<\/script>

<template>
  <div class="tag-row">
    <Tag>
      <Tag.leadingVisual><StarIcon /></Tag.leadingVisual>
      StarIcon
    </Tag>
    <Tag color="#1a7f37" background="#dafbe1">
      <Tag.leadingVisual><CheckIcon /></Tag.leadingVisual>
      已完成
    </Tag>
    <Tag color="#cf222e" background="#ffebe9">
      <Tag.leadingVisual><AlertIcon /></Tag.leadingVisual>
      错误
    </Tag>
  </div>
</template>

<style scoped>
.tag-row {
  display: flex;
  align-items: center;
  gap: 20px;
}
</style>`

const demo5Code = `<script setup lang="ts">
import { Tag } from '@/components/primer-vue/Tag'
import { StarIcon, CheckIcon } from '@onlikee/octicons-vue'

const handleRemove = (label: string) => {
  console.log(label, 'removed')
}
<\/script>

<template>
  <div class="tag-row">
    <Tag removable @remove="handleRemove('Vue')">
      Vue
    </Tag>
    <Tag removable @remove="handleRemove('收藏')">
      <Tag.leadingVisual><StarIcon /></Tag.leadingVisual>
      收藏
    </Tag>
    <Tag color="#1a7f37" background="#dafbe1" removable @remove="handleRemove('已完成')">
      <Tag.leadingVisual><CheckIcon /></Tag.leadingVisual>
      已完成
    </Tag>
  </div>
</template>

<style scoped>
.tag-row {
  display: flex;
  align-items: center;
  gap: 20px;
}
</style>`

const apiTableColumns: DocumentationColumn[] = [
  { field: 'name', header: '属性名', rowHeader: true, minWidth: '140px' },
  { field: 'default', header: '默认值', minWidth: '100px' },
  { field: 'type', header: '类型', minWidth: '200px' },
  { field: 'description', header: '说明', minWidth: '200px' },
]

const apiTableRows = [
  {
    id: 'size',
    name: 'size',
    description: '标签尺寸',
    type: "'small' | 'medium' | 'large' | 'xlarge'",
    default: "'medium'",
  },
  { id: 'color', name: 'color', description: '字体颜色', type: 'string', default: "''" },
  { id: 'background', name: 'background', description: '背景颜色', type: 'string', default: "''" },
  {
    id: 'removable',
    name: 'removable',
    description: '是否显示删除按钮',
    type: 'boolean',
    default: 'false',
  },
]

const slotTableColumns: DocumentationColumn[] = [
  { field: 'name', header: '子组件', rowHeader: true, minWidth: '140px' },
  { field: 'description', header: '说明', minWidth: '300px' },
]

const slotTableRows = [
  {
    id: 'Tag.leadingVisual',
    name: 'Tag.leadingVisual',
    description: '前置视觉引导，通常用于放置图标',
  },
]

const eventTableColumns: DocumentationColumn[] = [
  { field: 'name', header: '事件名', rowHeader: true, minWidth: '140px' },
  { field: 'params', header: '参数', minWidth: '140px' },
  { field: 'description', header: '说明', minWidth: '200px' },
]

const eventTableRows = [
  { id: 'remove', name: 'remove', params: '无', description: '点击删除按钮时触发' },
]
</script>

<style scoped>
.tag-row {
  display: flex;
  align-items: center;
  gap: 20px;
}
</style>
