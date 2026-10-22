<script setup lang="ts">
import { shallowRef, useId } from 'vue'
import { EyeIcon, FileCodeIcon, PlusIcon } from '@onlikee/octicons-vue'
import { SegmentedControl } from '@/components/primer-vue/SegmentedControl'
import { Button } from '@/components/primer-vue/Button'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const labelId = useId()
const captionId = useId()
const selected = shallowRef(0)
const views = shallowRef(['All', 'Active', 'Review requests'])
const actionCount = shallowRef(0)
function addView() {
  actionCount.value += 1
  views.value = [...views.value, `New view ${actionCount.value}`]
}
function reset() {
  views.value = ['All', 'Active', 'Review requests']
  actionCount.value = 0
}
const codes = {
  basic: `<SegmentedControl aria-label="File view">
  <SegmentedControl.Button default-selected>Preview</SegmentedControl.Button>
  <SegmentedControl.Button>Raw</SegmentedControl.Button>
  <SegmentedControl.Button disabled>Blame</SegmentedControl.Button>
</SegmentedControl>`,
  controlled: `<SegmentedControl aria-label="View" @change="selected = $event">
  <SegmentedControl.Button :selected="selected === 0">All</SegmentedControl.Button>
  <SegmentedControl.Button :selected="selected === 1">Active</SegmentedControl.Button>
</SegmentedControl>`,
  visuals: `<SegmentedControl aria-label="File view">
  <SegmentedControl.Button :leading-visual="EyeIcon" :count="5">Preview</SegmentedControl.Button>
  <SegmentedControl.Button :leading-visual="FileCodeIcon" :count="0">Raw</SegmentedControl.Button>
</SegmentedControl>`,
  icons: `<SegmentedControl aria-label="File view" size="small">
  <SegmentedControl.IconButton aria-label="Preview" :icon="EyeIcon" default-selected />
  <SegmentedControl.IconButton aria-label="Raw" :icon="FileCodeIcon"
    description="View raw code" tooltip-direction="n" />
</SegmentedControl>`,
  subtle: `<SegmentedControl aria-label="Issue view" variant="subtle" full-width>
  <SegmentedControl.Button :count="5">All</SegmentedControl.Button>
  <SegmentedControl.Divider />
  <SegmentedControl.Button :count="3">Active</SegmentedControl.Button>
  <SegmentedControl.Button :count="10">Review requests</SegmentedControl.Button>
</SegmentedControl>`,
  responsive: `<SegmentedControl aria-label="File view"
  :variant="{ narrow: 'hideLabels', regular: 'default', wide: 'subtle' }"
  :full-width="{ narrow: true, regular: false, wide: false }">
  <SegmentedControl.Button aria-label="Preview" :leading-visual="EyeIcon">Preview</SegmentedControl.Button>
  <SegmentedControl.Button aria-label="Raw" :leading-visual="FileCodeIcon">Raw</SegmentedControl.Button>
</SegmentedControl>`,
  action: `<SegmentedControl aria-label="View"
  :variant="{ narrow: 'dropdown', regular: 'subtle', wide: 'subtle' }">
  <SegmentedControl.Button v-for="view in views" :key="view">{{ view }}</SegmentedControl.Button>
  <SegmentedControl.Action label="Add view" :icon="PlusIcon" @click="addView" />
</SegmentedControl>`,
  label: `<span id="view-label">File view</span>
<span id="view-caption">Change the way the file is viewed</span>
<SegmentedControl aria-labelledby="view-label" aria-describedby="view-caption">
  <SegmentedControl.Button>Preview</SegmentedControl.Button>
  <SegmentedControl.Button>Raw</SegmentedControl.Button>
</SegmentedControl>`,
}
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="SegmentedControl 分段控件"
      description="在同一内容的不同视图之间切换，支持图标、计数、响应式下拉菜单和尾部操作。"
    />
    <ComponentDocsSection title="基础用法">
      <template #description
        >默认选中第一项；defaultSelected 只决定初始选择。禁用项使用
        aria-disabled，仍可获得键盘焦点。</template
      >
      <ComponentDocsDemoBlock :code="codes.basic">
        <SegmentedControl aria-label="File view">
          <SegmentedControl.Button default-selected>Preview</SegmentedControl.Button>
          <SegmentedControl.Button>Raw</SegmentedControl.Button>
          <SegmentedControl.Button disabled>Blame</SegmentedControl.Button>
        </SegmentedControl>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="受控选择">
      <template #description
        >change 返回从 0 开始的分段索引，Divider 和 Action 不计入索引。受控模式需要同时设置 selected
        并监听 change。</template
      >
      <ComponentDocsDemoBlock :code="codes.controlled">
        <div class="examples">
          <SegmentedControl aria-label="View" @change="selected = $event">
            <SegmentedControl.Button :selected="selected === 0">All</SegmentedControl.Button>
            <SegmentedControl.Button :selected="selected === 1">Active</SegmentedControl.Button>
          </SegmentedControl>
          <span aria-live="polite">当前索引：{{ selected }}</span>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="图标与计数">
      <template #description
        >leadingVisual 接受组件或 VNode，优先于已弃用的 leadingIcon。计数复用
        CounterLabel。</template
      >
      <ComponentDocsDemoBlock :code="codes.visuals">
        <SegmentedControl aria-label="File view with counts">
          <SegmentedControl.Button :leading-visual="EyeIcon" :count="5"
            >Preview</SegmentedControl.Button
          >
          <SegmentedControl.Button :leading-visual="FileCodeIcon" :count="0"
            >Raw</SegmentedControl.Button
          >
        </SegmentedControl>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="图标按钮与 Tooltip">
      <template #description
        >IconButton 必须提供 aria-label。默认由 Tooltip 提供可访问名称；设置 description 时保留
        aria-label，并由 Tooltip 提供说明。</template
      >
      <ComponentDocsDemoBlock :code="codes.icons">
        <SegmentedControl aria-label="Icon file view" size="small">
          <SegmentedControl.IconButton aria-label="Preview" :icon="EyeIcon" default-selected />
          <SegmentedControl.IconButton
            aria-label="Raw"
            :icon="FileCodeIcon"
            description="View raw code"
            tooltip-direction="n"
          />
        </SegmentedControl>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="低强调与分隔符">
      <template #description
        >subtle 显示 Divider，default 隐藏 Divider；fullWidth 使控件占满容器。</template
      >
      <ComponentDocsDemoBlock :code="codes.subtle">
        <SegmentedControl aria-label="Issue view" variant="subtle" full-width>
          <SegmentedControl.Button :count="5">All</SegmentedControl.Button>
          <SegmentedControl.Divider />
          <SegmentedControl.Button :count="3">Active</SegmentedControl.Button>
          <SegmentedControl.Button :count="10">Review requests</SegmentedControl.Button>
        </SegmentedControl>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="响应式布局">
      <template #description
        >断点为 narrow（小于 768px）、regular（768px 起）、wide（1400px 起）。hideLabels
        需要图标与可访问名称；dropdown 通过响应式对象配置。调整窗口宽度查看变化。</template
      >
      <ComponentDocsDemoBlock :code="codes.responsive">
        <SegmentedControl
          aria-label="Responsive file view"
          :variant="{ narrow: 'hideLabels', regular: 'default', wide: 'subtle' }"
          :full-width="{ narrow: true, regular: false, wide: false }"
        >
          <SegmentedControl.Button aria-label="Preview" :leading-visual="EyeIcon"
            >Preview</SegmentedControl.Button
          >
          <SegmentedControl.Button aria-label="Raw" :leading-visual="FileCodeIcon"
            >Raw</SegmentedControl.Button
          >
        </SegmentedControl>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="下拉菜单与尾部操作">
      <template #description
        >窄屏复用 ActionMenu 和单选 ActionList。选择分段后关闭菜单；Action
        显示为独立菜单项，执行后保持菜单打开。宽屏下 Action 是带 Tooltip 的图标按钮。</template
      >
      <ComponentDocsDemoBlock :code="codes.action">
        <div class="examples">
          <SegmentedControl
            aria-label="Dynamic view"
            :variant="{ narrow: 'dropdown', regular: 'subtle', wide: 'subtle' }"
          >
            <SegmentedControl.Button v-for="view in views" :key="view">{{
              view
            }}</SegmentedControl.Button>
            <SegmentedControl.Action label="Add view" :icon="PlusIcon" @click="addView" />
          </SegmentedControl>
          <Button size="small" @click="reset">Reset views</Button>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="外部标题与说明">
      <ComponentDocsDemoBlock :code="codes.label">
        <div class="examples">
          <span :id="labelId">File view</span>
          <span :id="captionId">Change the way the file is viewed</span>
          <SegmentedControl :aria-labelledby="labelId" :aria-describedby="captionId">
            <SegmentedControl.Button>Preview</SegmentedControl.Button>
            <SegmentedControl.Button>Raw</SegmentedControl.Button>
          </SegmentedControl>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="API" variant="api">
      <div class="examples">
        <p>
          SegmentedControl：aria-label / aria-labelledby / aria-describedby、fullWidth（boolean
          或断点对象）、size（small / medium）、variant（default / subtle
          或断点对象）、className、change(index)。
        </p>
        <p>
          Button：默认插槽为文字标签；selected、defaultSelected、leadingVisual、leadingIcon（已弃用）、disabled、count、className，以及原生
          button 属性与事件。自定义 class 位于 button。
        </p>
        <p>
          IconButton：aria-label、icon
          为必填；selected、defaultSelected、description、tooltipDirection、disabled、className，以及原生
          button 属性与事件。自定义 class 位于 li。
        </p>
        <p>
          Divider：className、style。Action：label、icon
          为必填；disabled、loading、click()。包装插槽组件时用 asSlot 保留标记。
        </p>
        <p>
          与参考源码一致，dropdown 选项不转发原分段的 disabled、count
          或原生属性；需要禁用分段时请使用普通分段布局。各分段通过 Tab 导航，Enter / Space
          激活；下拉菜单沿用 ActionMenu 的方向键和 Escape 行为。
        </p>
        <p>
          提供组件族、独立子组件及对应 Props 类型导出。React children 对应 Vue 默认插槽。未提供
          change，或任一分段显式提供 defaultSelected（包括 false）时，为非受控模式。
        </p>
      </div>
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.examples {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}
</style>
