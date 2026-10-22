<script setup lang="ts">
import { ref, useId } from 'vue'
import { SkeletonBox } from '@/components/primer-vue/Skeleton'
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
const delayKey = ref(0)
const loading = ref(true)

const codes = {
  basic: `<script setup lang="ts">
import { SkeletonBox } from '@/components/primer-vue/Skeleton'
<\/script>

<template>
  <SkeletonBox width="100%" aria-hidden="true" />
</template>`,
  dimensions: `<SkeletonBox :width="120" :height="16" aria-hidden="true" />
<SkeletonBox width="65%" height="1.5rem" aria-hidden="true" />
<SkeletonBox width="100%" :height="64" aria-hidden="true" />`,
  shapes: `<SkeletonBox :width="48" :height="48" class="avatar-skeleton" aria-hidden="true" />
<SkeletonBox width="100%" :height="80" class="banner-skeleton" aria-hidden="true" />

<style scoped>
.avatar-skeleton {
  border-radius: 50%;
}

.banner-skeleton {
  border-radius: 12px;
}
</style>`,
  delay: `<script setup lang="ts">
import { ref } from 'vue'
import { SkeletonBox } from '@/components/primer-vue/Skeleton'

const delayKey = ref(0)
<\/script>

<template>
  <button type="button" @click="delayKey += 1">重新开始</button>
  <div :key="delayKey" class="delay-examples">
    <div>
      <p>short · 300ms</p>
      <div class="delay-placeholder"><SkeletonBox :width="120" delay="short" aria-hidden="true" /></div>
    </div>
    <div>
      <p>自定义 · 600ms</p>
      <div class="delay-placeholder"><SkeletonBox :width="120" :delay="600" aria-hidden="true" /></div>
    </div>
    <div>
      <p>long · 1000ms</p>
      <div class="delay-placeholder"><SkeletonBox :width="120" delay="long" aria-hidden="true" /></div>
    </div>
  </div>
</template>

<style scoped>
.delay-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.delay-placeholder {
  min-height: 24px;
}
</style>`,
  loading: `<script setup lang="ts">
import { ref } from 'vue'
import { SkeletonBox } from '@/components/primer-vue/Skeleton'

const loading = ref(true)
<\/script>

<template>
  <button type="button" @click="loading = !loading">
    {{ loading ? '显示加载结果' : '重新加载' }}
  </button>
  <section :aria-busy="loading" aria-label="文章摘要" class="content-preview">
    <div v-if="loading" aria-hidden="true" class="skeleton-lines">
      <SkeletonBox width="60%" :height="24" />
      <SkeletonBox width="100%" />
      <SkeletonBox width="80%" />
    </div>
    <div v-else>
      <h3>项目动态</h3>
      <p>组件文档已更新，可以开始阅读。</p>
    </div>
  </section>
  <p role="status">{{ loading ? '正在加载文章摘要…' : '文章摘要已加载。' }}</p>
</template>

<style scoped>
.content-preview {
  box-sizing: border-box;
  width: 100%;
  min-height: 120px;
  padding: 16px;
  border: 1px solid var(--borderColor-default);
  border-radius: 6px;
}

.skeleton-lines {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
    id: 'height',
    name: 'height',
    type: 'string | number',
    default: '1rem（CSS）',
    description: '骨架高度；数字转换为 px，字符串作为 CSS 长度使用。',
  },
  {
    id: 'width',
    name: 'width',
    type: 'string | number',
    default: 'auto（CSS）',
    description:
      '骨架宽度；数字转换为 px，可使用百分比等 CSS 长度。默认作为块元素由容器布局决定宽度。',
  },
  {
    id: 'delay',
    name: 'delay',
    type: "'short' | 'long' | number",
    default: 'undefined（立即显示）',
    description: 'short 为 300ms，long 为 1000ms，数字为毫秒数；0 立即显示。延迟从挂载后开始计时。',
  },
  {
    id: 'className',
    name: 'className',
    type: 'string',
    default: '—',
    description: '根元素的附加样式类，与 Vue class 和内置类合并。',
  },
  {
    id: 'data-component',
    name: 'data-component',
    type: 'string',
    default: 'SkeletonBox',
    description: '设置根元素的 data-component 标识，便于组合组件或定位元素。',
  },
]
const instanceRows: DocumentationRow[] = [
  {
    id: 'element',
    name: 'element',
    type: 'HTMLDivElement | null',
    default: 'null',
    description: '通过组件模板 ref 读取根 div；尚未挂载或延迟显示期间为 null。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Skeleton 骨架屏"
      description="使用 SkeletonBox 预留内容的视觉轮廓，为尚未加载完成的文本、头像或图片提供占位。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        从 Skeleton 目录导入 SkeletonBox，渲染为空 div。默认高度为
        1rem，使用主题中的骨架背景色与小圆角。 下面的示例显式设置 width="100%" 填满容器。
      </template>
      <ComponentDocsDemoBlock :code="codes.basic">
        <div class="full-width">
          <SkeletonBox width="100%" aria-hidden="true" />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="尺寸">
      <template #description>
        height 和 width 支持数字及 CSS 长度字符串。数字按 px 处理，百分比宽度由父容器决定。
        尺寸应尽量接近实际内容，减少加载完成时的布局变化。
      </template>
      <ComponentDocsDemoBlock :code="codes.dimensions">
        <div class="demo-stack">
          <SkeletonBox :width="120" :height="16" aria-hidden="true" />
          <SkeletonBox width="65%" height="1.5rem" aria-hidden="true" />
          <SkeletonBox width="100%" :height="64" aria-hidden="true" />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="自定义形状">
      <template #description>
        使用 class、className 或 style
        调整圆角等样式。圆形占位可用于头像，矩形占位可用于封面或卡片。 原生 style 中的同名尺寸会覆盖
        height、width 属性生成的内联样式。
      </template>
      <ComponentDocsDemoBlock :code="codes.shapes">
        <div class="demo-stack">
          <SkeletonBox :width="48" :height="48" class="avatar-skeleton" aria-hidden="true" />
          <SkeletonBox width="100%" :height="80" class="banner-skeleton" aria-hidden="true" />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="延迟显示">
      <template #description>
        delay 可避免短暂加载时出现骨架闪烁。延迟期间不渲染根 div，也不会自动保留空间；
        示例通过外层容器预留高度。点击“重新开始”重新挂载示例，观察不同延迟。 已显示后修改 delay
        不会重新隐藏骨架，需要重新计时时可更换组件 key。
      </template>
      <ComponentDocsDemoBlock :code="codes.delay">
        <div class="demo-stack">
          <button type="button" @click="delayKey += 1">重新开始</button>
          <div :key="delayKey" class="delay-examples">
            <div>
              <p class="demo-label">short · 300ms</p>
              <div class="delay-placeholder">
                <SkeletonBox :width="120" delay="short" aria-hidden="true" />
              </div>
            </div>
            <div>
              <p class="demo-label">自定义 · 600ms</p>
              <div class="delay-placeholder">
                <SkeletonBox :width="120" :delay="600" aria-hidden="true" />
              </div>
            </div>
            <div>
              <p class="demo-label">long · 1000ms</p>
              <div class="delay-placeholder">
                <SkeletonBox :width="120" delay="long" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="加载状态与无障碍提示">
      <template #description>
        骨架只提供视觉占位，不会自动设置 aria-hidden、aria-busy 或加载提示。
        将装饰性骨架对辅助技术隐藏，在内容容器上标记 aria-busy，并在外部通过状态文字说明加载进度。
        以下按钮仅用于切换演示；实际应用应根据请求状态替换骨架与内容。
      </template>
      <ComponentDocsDemoBlock :code="codes.loading">
        <div class="demo-stack">
          <button type="button" @click="loading = !loading">
            {{ loading ? '显示加载结果' : '重新加载' }}
          </button>
          <section :aria-busy="loading" aria-label="文章摘要" class="content-preview">
            <div v-if="loading" aria-hidden="true" class="skeleton-lines">
              <SkeletonBox width="60%" :height="24" />
              <SkeletonBox width="100%" />
              <SkeletonBox width="80%" />
            </div>
            <div v-else>
              <h3>项目动态</h3>
              <p>组件文档已更新，可以开始阅读。</p>
            </div>
          </section>
          <p role="status" class="status-text">
            {{ loading ? '正在加载文章摘要…' : '文章摘要已加载。' }}
          </p>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="动画与服务端渲染">
      <template #description>
        默认在用户未要求减少动态效果时播放渐变遮罩动画；启用减少动态效果偏好时保留静态占位。
        服务端渲染时，未设置 delay 或 delay 为 0
        的骨架立即输出；设置非零延迟后，计时从客户端挂载开始。
      </template>
    </ComponentDocsSection>

    <ComponentDocsSection title="属性" variant="api">
      <template #description>
        实际组件名为 SkeletonBox，提供同名导出与默认导出；类型为 SkeletonBoxOptions 和
        SkeletonBoxProps。 id、class、style、aria-*、data-* 等原生属性及事件监听器透传给根
        div。组件没有自定义事件。
      </template>
      <VisuallyHidden :id="`${documentationId}-props`">SkeletonBox 骨架屏属性</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-props`"
        :columns="columns"
        :data="rows"
      />
    </ComponentDocsSection>

    <ComponentDocsSection title="组件实例" variant="api">
      <VisuallyHidden :id="`${documentationId}-instance`"
        >SkeletonBox 骨架屏组件实例</VisuallyHidden
      >
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-instance`"
        :columns="columns"
        :data="instanceRows"
      />
    </ComponentDocsSection>

    <ComponentDocsSection title="插槽" variant="api">
      <template #description>
        不提供插槽。需要组合多块占位时，在外层容器中排列多个 SkeletonBox；多行文本占位也可使用独立的
        SkeletonText 组件。
      </template>
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.full-width {
  width: 100%;
}

.demo-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
  min-width: 0;
}

.avatar-skeleton {
  border-radius: 50%;
}

.banner-skeleton {
  border-radius: 12px;
}

.delay-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.delay-placeholder {
  min-height: 24px;
}

.demo-label,
.status-text {
  margin: 0;
  color: var(--fgColor-muted);
  font-size: 14px;
  line-height: 1.5;
}

.demo-label {
  margin-bottom: 12px;
}

.content-preview {
  box-sizing: border-box;
  width: 100%;
  min-height: 120px;
  padding: 16px;
  border: 1px solid var(--borderColor-default);
  border-radius: 6px;
}

.skeleton-lines {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
