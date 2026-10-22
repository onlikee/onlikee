<script setup lang="ts">
import { useId } from 'vue'
import { SkeletonAvatar } from '@/components/primer-vue/SkeletonAvatar'
import { SkeletonText } from '@/components/primer-vue/SkeletonText'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'
import ComponentDocsTable, {
  type DocumentationColumn,
  type DocumentationRow,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsDemoBlock from '../../components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '../../components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '../../components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '../../components/ComponentDocsPage/ComponentDocsSection.vue'

const documentationId = useId()
const sizes = [20, 24, 32, 40, 48, 64]
const codes = {
  basic: `<script setup lang="ts">
import { SkeletonAvatar } from '@/components/primer-vue/SkeletonAvatar'
<\/script>

<template>
  <SkeletonAvatar aria-hidden="true" />
</template>`,
  sizes: sizes.map((size) => `<SkeletonAvatar :size="${size}" aria-hidden="true" />`).join('\n'),
  square: `<SkeletonAvatar :size="24" square aria-hidden="true" />
<SkeletonAvatar :size="40" square aria-hidden="true" />
<SkeletonAvatar :size="64" square aria-hidden="true" />`,
  responsive: `<SkeletonAvatar :size="{ narrow: 24, regular: 40, wide: 64 }" aria-hidden="true" />`,
  composition: `<script setup lang="ts">
import { SkeletonAvatar } from '@/components/primer-vue/SkeletonAvatar'
import { SkeletonText } from '@/components/primer-vue/SkeletonText'
<\/script>

<template>
  <div class="profile-skeleton" aria-hidden="true">
    <SkeletonAvatar :size="48" />
    <div class="profile-text">
      <SkeletonText :max-width="160" />
      <SkeletonText size="bodySmall" :max-width="240" />
    </div>
  </div>
</template>

<style scoped>
.profile-skeleton {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.profile-text {
  flex: 1;
  min-width: 0;
}
</style>`,
}
const columns: DocumentationColumn[] = [
  { field: 'name', header: '名称', rowHeader: true },
  { field: 'type', header: '类型' },
  { field: 'default', header: '默认值' },
  { field: 'description', header: '说明' },
]
const rows: DocumentationRow[] = [
  {
    id: 'size',
    name: 'size',
    type: 'number | { narrow?: number; regular?: number; wide?: number }',
    default: '20',
    description: '头像宽高，单位为 px；对象按视口范围分别设置尺寸。',
  },
  {
    id: 'square',
    name: 'square',
    type: 'boolean',
    default: 'undefined（圆形）',
    description: '显示圆角方形，圆角根据 regular 尺寸与主题圆角变量计算。',
  },
  {
    id: 'className',
    name: 'className',
    type: 'string',
    default: '—',
    description: '根骨架的附加样式类，与 Vue class 和内置类合并。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="SkeletonAvatar 头像骨架"
      description="在头像加载前预留相应形状和尺寸，支持圆形、圆角方形和响应式尺寸。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        默认显示 20px 的圆形头像骨架，基于 SkeletonBox 使用主题骨架色与渐变动画。
      </template>
      <ComponentDocsDemoBlock :code="codes.basic">
        <SkeletonAvatar aria-hidden="true" />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="尺寸">
      <template #description>size 使用数字设置头像的宽高，单位为 px。</template>
      <ComponentDocsDemoBlock :code="codes.sizes">
        <div class="avatar-examples">
          <div v-for="size in sizes" :key="size" class="avatar-example">
            <SkeletonAvatar :size="size" aria-hidden="true" />
            <span class="demo-label">{{ size }}px</span>
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="圆角方形">
      <template #description>
        设置 square 显示圆角方形。圆角随头像尺寸变化，最大使用主题中的中等圆角。
      </template>
      <ComponentDocsDemoBlock :code="codes.square">
        <div class="avatar-examples">
          <SkeletonAvatar :size="24" square aria-hidden="true" />
          <SkeletonAvatar :size="40" square aria-hidden="true" />
          <SkeletonAvatar :size="64" square aria-hidden="true" />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="响应式尺寸">
      <template #description>
        size 对象可设置 narrow、regular 和 wide。断点分别为小于 48rem、至少 48rem 和至少
        87.5rem；调整浏览器窗口可观察尺寸变化。为各视口显式提供需要的尺寸。
      </template>
      <ComponentDocsDemoBlock :code="codes.responsive">
        <SkeletonAvatar :size="{ narrow: 24, regular: 40, wide: 64 }" aria-hidden="true" />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="组合文本骨架">
      <template #description> 配合 SkeletonText 展示个人资料轮廓，布局由外层容器控制。 </template>
      <ComponentDocsDemoBlock :code="codes.composition">
        <div class="profile-skeleton" aria-hidden="true">
          <SkeletonAvatar :size="48" />
          <div class="profile-text">
            <SkeletonText :max-width="160" />
            <SkeletonText size="bodySmall" :max-width="240" />
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="属性透传与无障碍">
      <template #description>
        原生属性与 DOM 事件传给根 div。style 中的数字长度按 px 处理，size
        生成的头像尺寸变量优先于同名 style 变量。组件不自动设置 aria-hidden、aria-busy 或加载提示；
        应将装饰性骨架隐藏，并在内容容器中提供加载状态。动画遵循减少动态效果偏好。
      </template>
    </ComponentDocsSection>

    <ComponentDocsSection title="属性" variant="api">
      <template #description>
        提供 SkeletonAvatar 同名导出，类型为 SkeletonAvatarOptions 与 SkeletonAvatarProps。
        不提供插槽、自定义事件或公开实例方法。
      </template>
      <VisuallyHidden :id="`${documentationId}-props`">SkeletonAvatar 头像骨架属性</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-props`"
        :columns="columns"
        :data="rows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.avatar-examples {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
}

.avatar-example {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.demo-label {
  color: var(--fgColor-muted);
  font-size: 12px;
}

.profile-skeleton {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.profile-text {
  flex: 1;
  min-width: 0;
}
</style>
