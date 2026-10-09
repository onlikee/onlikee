<script setup lang="ts">
import { h, shallowRef } from 'vue'
import { AnchoredOverlay, type AnchorRenderProps } from '@/components/primer-vue/AnchoredOverlay'
import { Button } from '@/components/primer-vue/Button'
import { FeatureFlags } from '@/components/primer-vue/FeatureFlags'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const basicOpen = shallowRef(false)
const fullscreenOpen = shallowRef(false)
const detachedOpen = shallowRef(false)
const popoverOpen = shallowRef(false)
const detachedAnchor = shallowRef<HTMLElement | null>(null)
const detachedBindings = { anchorRef: detachedAnchor }
const basicAnchor = (props: AnchorRenderProps) => h(Button, props, () => '打开浮层')
const fullscreenAnchor = (props: AnchorRenderProps) => h(Button, props, () => '响应式浮层')
const popoverAnchor = (props: AnchorRenderProps) => h(Button, props, () => 'Popover 浮层')

const basicCode = `<script setup lang="ts">
import { h, shallowRef } from 'vue'
import { AnchoredOverlay, type AnchorRenderProps } from '@/components/primer-vue/AnchoredOverlay'
import { Button } from '@/components/primer-vue/Button'

const open = shallowRef(false)
const renderAnchor = (props: AnchorRenderProps) => h(Button, props, () => '打开浮层')
<\/script>

<template>
  <AnchoredOverlay :open="open" @open="open = true" :render-anchor="renderAnchor" @close="open = false" width="small" :overlay-props="{ role: 'dialog', 'aria-label': '快捷操作' }">
    <div style="padding: 16px">
      <p>选择接下来要执行的操作。</p>
      <Button @click="open = false">完成</Button>
    </div>
  </AnchoredOverlay>
</template>`

const fullscreenCode = `<script setup lang="ts">
import { h, shallowRef } from 'vue'
import { AnchoredOverlay, type AnchorRenderProps } from '@/components/primer-vue/AnchoredOverlay'
import { Button } from '@/components/primer-vue/Button'

const open = shallowRef(false)
const renderAnchor = (props: AnchorRenderProps) => h(Button, props, () => '响应式浮层')
<\/script>

<template>
  <AnchoredOverlay
    :open="open" @open="open = true" :render-anchor="renderAnchor" @close="open = false"
    width="medium"
    :variant="{ regular: 'anchored', narrow: 'fullscreen' }"
    :close-button-props="{ 'aria-label': '关闭浮层' }"
    :overlay-props="{ role: 'dialog', 'aria-label': '响应式浮层' }"
  >
    <div style="padding: 48px 16px 16px">
      <p>视口小于 768px 时铺满屏幕，并显示关闭按钮。</p>
      <Button @click="open = false">完成</Button>
    </div>
  </AnchoredOverlay>
</template>`

const detachedCode = `<script setup lang="ts">
import { shallowRef } from 'vue'
import { AnchoredOverlay } from '@/components/primer-vue/AnchoredOverlay'

const open = shallowRef(false)
const anchor = shallowRef<HTMLElement | null>(null)
// 对象中的 ref 保留引用，避免模板自动解包。
const bindings = { anchorRef: anchor }
<\/script>

<template>
  <button ref="anchor" :aria-expanded="open" aria-haspopup="true" @click="open = !open">独立锚点</button>
  <AnchoredOverlay :open="open" @close="open = false" :render-anchor="null" v-bind="bindings" side="outside-right" width="small">
    <div style="padding: 16px">
      <p>浮层定位到独立锚点。外部锚点负责自己的开关事件。</p>
      <button @click="open = false">关闭</button>
    </div>
  </AnchoredOverlay>
</template>`

const popoverCode = `<script setup lang="ts">
import { h, shallowRef } from 'vue'
import { AnchoredOverlay, type AnchorRenderProps } from '@/components/primer-vue/AnchoredOverlay'
import { Button } from '@/components/primer-vue/Button'
import { FeatureFlags } from '@/components/primer-vue/FeatureFlags'

const open = shallowRef(false)
const renderAnchor = (props: AnchorRenderProps) => h(Button, props, () => 'Popover 浮层')
<\/script>

<template>
  <FeatureFlags :flags="{ primer_react_css_anchor_positioning: true }">
    <AnchoredOverlay :open="open" @open="open = true" :render-anchor="renderAnchor" @close="open = false" render-as="popover" width="small" :css-anchor-positioning-settings="{ fallbackStrategy: 'opposite-side' }">
      <div style="padding: 16px">
        <p>支持原生 CSS anchor positioning 时使用 Popover API。</p>
        <Button @click="open = false">关闭</Button>
      </div>
    </AnchoredOverlay>
  </FeatureFlags>
</template>`

const apiColumns: TableColumn[] = [
  { key: 'name', label: '属性', rowHeader: true, minWidth: '180px' },
  { key: 'type', label: '类型', minWidth: '240px', wrap: true },
  { key: 'default', label: '默认值', minWidth: '120px' },
  { key: 'description', label: '说明', minWidth: '280px', wrap: true },
]
const apiRows = [
  {
    name: 'open',
    type: 'boolean',
    default: '必填',
    description: '受控的展示状态。',
  },
  {
    name: 'renderAnchor',
    type: '(anchorProps) => VNodeChild | null',
    default: '—',
    description: '必填；函数渲染锚点，null 时必须提供 anchorRef。',
  },
  {
    name: 'anchorRef / anchorId',
    type: 'Ref<HTMLElement | null> / string',
    default: '内部 ref / 自动 ID',
    description: '锚点引用和 ID；将 anchorProps 绑定到锚点以连接事件和 ARIA。',
  },
  {
    name: 'side / align',
    type: 'AnchorSide / start | center | end',
    default: 'outside-bottom / start',
    description: '浮层方向和对齐；side 支持 outside-*、inside-* 和 inside-center。',
  },
  {
    name: 'anchorOffset / alignmentOffset',
    type: 'number',
    default: '定位器默认值',
    description: '锚点方向和对齐方向的像素偏移。',
  },
  {
    name: 'width',
    type: 'auto | small | medium | large | xlarge | xxlarge',
    default: 'auto',
    description: '预设宽度为 256、320、480、640、960px。',
  },
  {
    name: 'height',
    type: 'auto | xsmall | small | medium | large | xlarge | initial | fit-content',
    default: 'auto',
    description: '预设高度为 192、256、320、432、600px；initial 保留首次内容高度。',
  },
  {
    name: 'variant',
    type: "'anchored' | { regular?, narrow?, wide? }",
    default: 'anchored',
    description: 'narrow 可设置 fullscreen；其余断点为 anchored。',
  },
  {
    name: 'displayCloseButton / closeButtonProps',
    type: 'boolean / Partial<IconButtonProps>',
    default: 'true / —',
    description: '提供 onClose 时显示窄屏全屏关闭按钮；aria-labelledby 优先于 aria-label。',
  },
  {
    name: 'displayInViewport / pinPosition',
    type: 'boolean',
    default: 'false / false',
    description: '视口相对定位，以及上方定位时固定位置。',
  },
  {
    name: 'preventOverflow',
    type: 'boolean',
    default: 'true',
    description: '沿用 Overlay 的溢出与宽度约束设置。',
  },
  {
    name: 'overlayProps',
    type: 'Partial<OverlayProps> & { ref? }',
    default: '—',
    description:
      '内部浮层属性，包括 role、ARIA、style、portalContainerName 和 DOM ref；覆盖默认浮层属性。',
  },
  {
    name: 'focusTrapSettings / focusZoneSettings',
    type: 'FocusTrapSettings / FocusZoneHookSettings',
    default: '启用',
    description: '配置初始焦点、焦点约束、方向键导航或禁用行为。',
  },
  {
    name: 'className / class',
    type: 'string',
    default: '—',
    description:
      '与 overlayProps.className 合并后应用于浮层；DOM 与 ARIA 属性通过 overlayProps 传入。',
  },
  {
    name: 'onPositionChange',
    type: '({ position: AnchorPosition }) => void',
    default: '—',
    description: 'JavaScript 定位结果变化时调用。',
  },
  {
    name: 'renderAs',
    type: 'portal | popover',
    default: 'portal',
    description:
      'popover 仅在 CSS anchor 特性开关开启且浏览器支持时生效；否则使用 Portal 与 JavaScript 定位。',
  },
  {
    name: 'cssAnchorPositioningSettings',
    type: "{ disable?, fallbackStrategy?: 'default' | 'none' | 'opposite-side' }",
    default: 'default',
    description: '关闭原生锚定，或限制 CSS 回退策略；命名 Portal 也会关闭原生锚定。',
  },
]
const eventColumns: TableColumn[] = [
  { key: 'name', label: '事件 / 内容', rowHeader: true, minWidth: '150px' },
  { key: 'description', label: '说明', minWidth: '420px', wrap: true },
]
const eventRows = [
  {
    name: 'open',
    description: '(gesture, event?)；键盘打开时附带 KeyboardEvent，点击打开只传 gesture。',
  },
  {
    name: 'close',
    description: '(gesture)；gesture 为 anchor-click、click-outside、escape 或 close。',
  },
  { name: 'default', description: '浮层内容；默认 role 为 none，应按内容设置语义和可访问名称。' },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="AnchoredOverlay 锚定浮层"
      description="相对锚点展示浮层，支持键盘导航、焦点约束和响应式全屏。"
    />
    <ComponentDocsSection title="基础用法">
      <template #description>
        将 <code>anchorProps</code> 完整绑定到锚点。点击或按 Enter、Space、方向键可打开，Esc
        或点击外部可关闭，关闭后焦点返回锚点。
      </template>
      <ComponentDocsDemoBlock :code="basicCode">
        <AnchoredOverlay
          :open="basicOpen"
          :render-anchor="basicAnchor"
          width="small"
          :overlay-props="{ role: 'dialog', 'aria-label': '快捷操作' }"
          @open="basicOpen = true"
          @close="basicOpen = false"
        >
          <div class="overlay-content">
            <p>选择接下来要执行的操作。</p>
            <Button @click="basicOpen = false">完成</Button>
          </div>
        </AnchoredOverlay>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="窄屏全屏">
      <ComponentDocsDemoBlock :code="fullscreenCode">
        <AnchoredOverlay
          :open="fullscreenOpen"
          :render-anchor="fullscreenAnchor"
          width="medium"
          :variant="{ regular: 'anchored', narrow: 'fullscreen' }"
          :close-button-props="{ 'aria-label': '关闭浮层' }"
          :overlay-props="{ role: 'dialog', 'aria-label': '响应式浮层' }"
          @open="fullscreenOpen = true"
          @close="fullscreenOpen = false"
        >
          <div class="overlay-content fullscreen-content">
            <p>视口小于 768px 时铺满屏幕，并显示关闭按钮。</p>
            <Button @click="fullscreenOpen = false">完成</Button>
          </div>
        </AnchoredOverlay>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="独立锚点与方向">
      <ComponentDocsDemoBlock :code="detachedCode">
        <button
          ref="detachedAnchor"
          :aria-expanded="detachedOpen"
          aria-haspopup="true"
          @click="detachedOpen = !detachedOpen"
        >
          独立锚点
        </button>
        <AnchoredOverlay
          :open="detachedOpen"
          :render-anchor="null"
          v-bind="detachedBindings"
          side="outside-right"
          width="small"
          @close="detachedOpen = false"
          @open="detachedOpen = true"
        >
          <div class="overlay-content">
            <p>浮层定位到独立锚点。外部锚点负责自己的开关事件。</p>
            <Button @click="detachedOpen = false">关闭</Button>
          </div>
        </AnchoredOverlay>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="原生 CSS 锚定与 Popover">
      <template #description>
        此示例开启原生定位特性。浏览器不支持或指定命名 Portal 时，自动使用 JavaScript 定位。
      </template>
      <ComponentDocsDemoBlock :code="popoverCode">
        <FeatureFlags :flags="{ primer_react_css_anchor_positioning: true }">
          <AnchoredOverlay
            :open="popoverOpen"
            :render-anchor="popoverAnchor"
            render-as="popover"
            width="small"
            :css-anchor-positioning-settings="{ fallbackStrategy: 'opposite-side' }"
            @open="popoverOpen = true"
            @close="popoverOpen = false"
          >
            <div class="overlay-content">
              <p>支持原生 CSS anchor positioning 时使用 Popover API。</p>
              <Button @click="popoverOpen = false">关闭</Button>
            </div>
          </AnchoredOverlay>
        </FeatureFlags>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="API" variant="api">
      <Table :columns="apiColumns" :data="apiRows" row-key="name" compact :hoverable="false" />
      <Table :columns="eventColumns" :data="eventRows" row-key="name" compact :hoverable="false" />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.overlay-content {
  padding: 16px;
  color: var(--fgColor-default, #1f2328);
}
.overlay-content p {
  margin: 0 0 16px;
}
.fullscreen-content {
  padding-top: 48px;
}
</style>
