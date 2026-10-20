<script setup lang="ts">
import { computed, shallowRef, useId } from 'vue'
import { Overlay } from '@/components/primer-vue/Overlay'
import { Button } from '@/components/primer-vue/Button'
import { ActionMenu } from '@/components/primer-vue/ActionMenu'
import { ActionList } from '@/components/primer-vue/ActionList'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const apiTableId = `${useId()}-overlay-api`
const open = shallowRef(false)
const fullscreen = shallowRef(false)
const trigger = shallowRef<{ element: HTMLElement | null } | null>(null)
const responsiveTrigger = shallowRef<{ element: HTMLElement | null } | null>(null)
const returnFocusRef = computed(() => trigger.value?.element ?? null)
const responsiveReturnFocusRef = computed(() => responsiveTrigger.value?.element ?? null)
const close = () => {
  open.value = false
}
const closeResponsive = () => {
  fullscreen.value = false
}
// Keep refs inside an object so template bindings preserve their identity.
const bindings = {
  returnFocusRef,
  ignoreClickRefs: [returnFocusRef],
  onEscape: close,
  onClickOutside: close,
}
const responsiveBindings = {
  returnFocusRef: responsiveReturnFocusRef,
  ignoreClickRefs: [responsiveReturnFocusRef],
  onEscape: closeResponsive,
  onClickOutside: closeResponsive,
}
const basicCode = `<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { Overlay } from '@/components/primer-vue/Overlay'
import { Button } from '@/components/primer-vue/Button'
import { ActionMenu } from '@/components/primer-vue/ActionMenu'
import { ActionList } from '@/components/primer-vue/ActionList'

const open = shallowRef(false)
const trigger = shallowRef<{ element: HTMLElement | null } | null>(null)
const returnFocusRef = computed(() => trigger.value?.element ?? null)
const close = () => { open.value = false }
const bindings = {
  returnFocusRef,
  ignoreClickRefs: [returnFocusRef],
  onEscape: close,
  onClickOutside: close,
}
<\/script>

<template>
  <Button ref="trigger" @click="open = !open">打开浮层</Button>
  <Overlay
    v-if="open" v-bind="bindings" width="small" position="fixed"
    :top="120" :style="{ left: '50%', transform: 'translateX(-50%)' }"
    role="dialog" aria-label="快捷操作"
  >
    <div style="padding: 16px">
      <p>按 Escape 或点击外部关闭；按 Escape 或“完成”关闭后焦点返回打开按钮。</p>
      <Button @click="close">完成</Button>
      <ActionMenu>
        <ActionMenu.Button>更多操作</ActionMenu.Button>
        <ActionMenu.Overlay>
          <ActionList>
            <ActionList.Item>复制链接</ActionList.Item>
            <ActionList.Item>保存</ActionList.Item>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </div>
  </Overlay>
</template>`
const nestedCode = `<ActionMenu>
  <ActionMenu.Button>更多操作</ActionMenu.Button>
  <ActionMenu.Overlay>
    <ActionList>
      <ActionList.Item>复制链接</ActionList.Item>
      <ActionList.Item>保存</ActionList.Item>
    </ActionList>
  </ActionMenu.Overlay>
</ActionMenu>`
const responsiveCode = `<Overlay
  v-if="open" v-bind="bindings" width="medium" position="fixed"
  :top="120" :left="24" responsive-variant="fullscreen"
  role="dialog" aria-label="响应式浮层"
>
  <div style="padding: 16px">
    <p>窄屏时铺满视口。</p>
    <Button @click="close">关闭</Button>
  </div>
</Overlay>`
const columns: DocumentationColumn[] = [
  { field: 'name', header: '属性名', rowHeader: true },
  { field: 'type', header: '类型' },
  { field: 'default', header: '默认值' },
  { field: 'description', header: '说明' },
]
const rows = [
  {
    id: 'as',
    name: 'as',
    type: 'HTML tag | Component',
    default: 'div',
    description: '替换根元素；组件 ref 的 .element 指向真实根元素。',
  },
  {
    id: 'width',
    name: 'width / maxWidth',
    type: 'auto | small | medium | large | xlarge | xxlarge',
    default: 'auto / —',
    description: '宽度为 256 / 320 / 480 / 640 / 960px；maxWidth 不接受 auto。',
  },
  {
    id: 'height',
    name: 'height / maxHeight',
    type: 'auto | initial | fit-content | xsmall | small | medium | large | xlarge',
    default: 'auto / —',
    description:
      '高度为 192 / 256 / 320 / 432 / 600px；initial 固定初次内容高度；maxHeight 不接受 auto、initial。',
  },
  {
    id: 'position',
    name: 'position / top / left / right / bottom',
    type: 'CSS position / string | number',
    default: 'absolute / —',
    description: '自行指定位置，数字偏移转为 px；left 和 right 均未设置时 left 为 0。',
  },
  {
    id: 'returnFocusRef',
    name: 'returnFocusRef',
    type: 'Ref<HTMLElement | null>',
    default: '必填',
    description: '卸载时尝试恢复到打开时捕获的元素；外部点击仍遵循浏览器原生聚焦行为。',
  },
  {
    id: 'initialFocusRef',
    name: 'initialFocusRef / preventFocusOnOpen',
    type: 'Ref<HTMLElement | null> / boolean',
    default: '首个可聚焦元素 / false',
    description: '指定打开时的焦点；preventFocusOnOpen 跳过自动聚焦。',
  },
  {
    id: 'onEscape',
    name: 'onEscape / onClickOutside',
    type: '(KeyboardEvent) => void / (MouseEvent | TouchEvent) => void',
    default: '必填',
    description: '由调用方卸载浮层；Escape 每次只交给最上层，外部点击按嵌套关系分发。',
  },
  {
    id: 'ignoreClickRefs',
    name: 'ignoreClickRefs',
    type: 'Ref<HTMLElement | null>[]',
    default: '—',
    description: '忽略这些元素内的点击，通常包含打开按钮。',
  },
  {
    id: 'portalContainerName',
    name: 'portalContainerName',
    type: 'string',
    default: 'Portal context / default',
    description: '指定已注册的 Portal 容器；默认 Portal 内容不在服务端 HTML 中。',
  },
  {
    id: 'visibility',
    name: 'visibility / overflow',
    type: 'visible | hidden / auto | hidden | scroll | visible',
    default: 'visible / auto',
    description: 'CSS 可见性与溢出方式，hidden 仍保留挂载。',
  },
  {
    id: 'preventOverflow',
    name: 'preventOverflow',
    type: 'boolean',
    default: 'true',
    description: 'false 时标记 data-reflow-container；具体宽度约束由 CSS 决定。',
  },
  {
    id: 'anchorSide',
    name: 'anchorSide',
    type: 'AnchorSide',
    default: '—',
    description: '只决定 8px 的进入动画方向，定位由调用方负责。',
  },
  {
    id: 'responsiveVariant',
    name: 'responsiveVariant',
    type: 'fullscreen',
    default: '—',
    description: '视口小于 48rem 时全屏；关闭按钮由调用方提供。',
  },
  {
    id: 'role',
    name: 'role / className / style',
    type: 'ARIA role / string / StyleValue',
    default: 'none / — / —',
    description: '根元素语义、附加样式；支持原生属性、ARIA、class 和默认插槽。',
  },
  {
    id: '_PrivateDisablePortal',
    name: '_PrivateDisablePortal',
    type: 'boolean',
    default: 'false',
    description: '仅 primer_react_css_anchor_positioning 特性启用时跳过 Portal。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Overlay 浮层"
      description="承载临时内容的浮动表面，提供 Portal、打开与返回焦点、外部点击及 Escape 行为。"
    />
    <ComponentDocsSection title="引入">
      <ComponentDocsDemoBlock code="import { Overlay } from '@/components/primer-vue/Overlay'"
        ><code>Overlay</code></ComponentDocsDemoBlock
      >
    </ComponentDocsSection>
    <ComponentDocsSection title="基础用法">
      <template #description
        >通过 v-if 控制挂载。需要根据锚点定位时使用 AnchoredOverlay；需要菜单键盘行为时使用
        ActionMenu。</template
      >
      <ComponentDocsDemoBlock :code="basicCode">
        <Button ref="trigger" @click="open = !open">打开浮层</Button>
        <Overlay
          v-if="open"
          v-bind="bindings"
          width="small"
          position="fixed"
          :top="120"
          :style="{ left: '50%', transform: 'translateX(-50%)' }"
          role="dialog"
          aria-label="快捷操作"
        >
          <div class="overlay-content">
            <p>按 Escape 或点击外部关闭；按 Escape 或“完成”关闭后焦点返回打开按钮。</p>
            <Button @click="close">完成</Button>
            <ActionMenu>
              <ActionMenu.Button>更多操作</ActionMenu.Button>
              <ActionMenu.Overlay>
                <ActionList>
                  <ActionList.Item>复制链接</ActionList.Item>
                  <ActionList.Item>保存</ActionList.Item>
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
          </div>
        </Overlay>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="嵌套菜单">
      <template #description
        >打开上面的浮层，再打开“更多操作”。第一次 Escape
        关闭菜单并返回菜单按钮，第二次关闭外层浮层。</template
      >
      <ComponentDocsDemoBlock :code="nestedCode"
        ><span>将此菜单放进 Overlay 的默认插槽。</span></ComponentDocsDemoBlock
      >
    </ComponentDocsSection>
    <ComponentDocsSection title="响应式全屏">
      <ComponentDocsDemoBlock :code="responsiveCode">
        <Button ref="responsiveTrigger" @click="fullscreen = !fullscreen">响应式浮层</Button>
        <Overlay
          v-if="fullscreen"
          v-bind="responsiveBindings"
          width="medium"
          position="fixed"
          :top="120"
          :left="24"
          responsive-variant="fullscreen"
          role="dialog"
          aria-label="响应式浮层"
        >
          <div class="overlay-content">
            <p>窄屏时铺满视口。</p>
            <Button @click="closeResponsive">关闭</Button>
          </div>
        </Overlay>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="组合与引用关系">
      <p>Overlay → Portal。AnchoredOverlay → Overlay，并独立提供锚点定位、焦点陷阱和焦点区域。</p>
      <p>
        ActionMenu、SelectPanel、LabelGroup → AnchoredOverlay → Overlay。Autocomplete.Overlay 与
        ActionBar 的菜单浮层直接组合 Overlay 和定位逻辑。
      </p>
      <p>
        Overlay 使用默认插槽承载内容。焦点陷阱、方向键导航和关闭按钮由组合组件负责；Dialog
        使用自己的模态实现。
      </p>
    </ComponentDocsSection>
    <ComponentDocsSection title="API" variant="api">
      <VisuallyHidden :id="apiTableId">Overlay 浮层 API</VisuallyHidden>
      <ComponentDocsTable :columns="columns" :data="rows" :aria-labelledby="apiTableId" />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.overlay-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.overlay-content p {
  margin: 0;
}
</style>
