<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Dialog 对话框"
      description="用于在当前页面上方展示短期任务、确认操作或辅助选择。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        使用 <code>v-if</code> 控制挂载，在必填的 <code>onClose</code> 回调中更新状态。
        默认聚焦关闭按钮；Esc 或背板点击请求关闭，组件不会自行卸载。
      </template>

      <ComponentDocsDemoBlock :code="basicDemoCode">
        <Button @click="basicDialogOpen = true"> 打开 Dialog </Button>

        <Dialog
          v-if="basicDialogOpen"
          :on-close="() => (basicDialogOpen = false)"
          title="创建新项目"
        >
          <Dialog.Body>
            <p>Dialog 用于承载短期任务，不应替代完整页面。保持内容集中，并提供明确的退出方式。</p>
          </Dialog.Body>
        </Dialog>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="副标题与底部操作">
      <template #description>
        使用 <code>subtitle</code> 补充上下文，使用
        <code>Dialog.Footer</code> 放置取消、危险或主操作按钮。
      </template>

      <ComponentDocsDemoBlock :code="footerDemoCode">
        <Button @click="footerDialogOpen = true"> 打开带操作的 Dialog </Button>

        <Dialog
          v-if="footerDialogOpen"
          :on-close="() => (footerDialogOpen = false)"
          title="删除部署环境"
          subtitle="此操作会停止当前环境中的所有运行实例。"
          role="alertdialog"
        >
          <Dialog.Body>
            <p>删除后无法从当前页面恢复。请确认团队成员已经完成必要的数据备份。</p>
          </Dialog.Body>
          <Dialog.Footer>
            <Button @click="footerDialogOpen = false"> 取消 </Button>
            <Button variant="danger" @click="footerDialogOpen = false"> 删除环境 </Button>
          </Dialog.Footer>
        </Dialog>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="尺寸">
      <template #description>
        使用 <code>width</code> 控制宽度，支持预设、CSS 宽度和像素数值。使用
        <code>height</code> 控制高度：small 为 480px，large 为 640px，默认 auto 随内容变化。Dialog
        会限制在当前视口内，内容过长时主体区域独立滚动。
      </template>

      <ComponentDocsDemoBlock :code="dimensionsDemoCode">
        <div class="dialog-demo-actions">
          <Button @click="smallDialogOpen = true"> Small </Button>
          <Button @click="largeDialogOpen = true"> Large </Button>
        </div>

        <Dialog
          v-if="smallDialogOpen"
          :on-close="() => (smallDialogOpen = false)"
          title="小型 Dialog"
          width="small"
          height="small"
        >
          <Dialog.Body>
            <p>小尺寸适合非常短的确认或说明内容。</p>
          </Dialog.Body>
        </Dialog>

        <Dialog
          v-if="largeDialogOpen"
          :on-close="() => (largeDialogOpen = false)"
          title="大型 Dialog"
          subtitle="用于需要更多空间的编辑或选择任务。"
          width="xlarge"
          height="large"
        >
          <Dialog.Body>
            <div class="dialog-large-content">
              <p v-for="item in largeDialogItems" :key="item">
                {{ item }}
              </p>
            </div>
          </Dialog.Body>
          <Dialog.Footer>
            <Button @click="largeDialogOpen = false"> 关闭 </Button>
          </Dialog.Footer>
        </Dialog>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="默认页脚与响应式位置">
      <template #description>
        footerButtons 指定操作和初始焦点。position 按 narrow、regular
        设置；主体空间不足时，页脚改为水平滚动。
      </template>
      <ComponentDocsDemoBlock :code="responsiveDemoCode">
        <Button @click="responsiveOpen = true">打开响应式 Dialog</Button>
        <Dialog
          v-if="responsiveOpen"
          :on-close="closeResponsive"
          title="响应式任务"
          :position="{ narrow: 'bottom', regular: 'right' }"
          align="top"
          :footer-buttons="responsiveButtons"
        >
          <p>窄屏在底部，常规屏和宽屏在右侧；默认聚焦继续按钮。</p>
        </Dialog>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="自定义渲染与焦点">
      <template #description>
        renderHeader 可替换默认标题区域，通过 dialogLabelId 关联可访问名称。 initialFocusRef 和
        returnFocusRef 指定打开与关闭时的焦点，支持原生元素以及
        Button、TextInput、ActionList.LinkItem 等暴露 element 的组件引用。通过 v-bind 传入包含 ref
        的对象，保留引用本身。
      </template>
      <ComponentDocsDemoBlock :code="renderDemoCode">
        <Button ref="returnTarget" @click="customOpen = true"> 打开自定义 Dialog </Button>
        <Dialog
          v-if="customOpen"
          v-bind="focusProps"
          :on-close="() => (customOpen = false)"
          title="自定义标题"
          :render-header="renderHeader"
        >
          <TextInput ref="initialTarget" aria-label="名称" placeholder="初始焦点" />
        </Dialog>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="API" variant="api">
      <h3>Dialog Props</h3>
      <VisuallyHidden :id="`${documentationId}-api-table-0`"
        >Dialog 对话框 Dialog Props</VisuallyHidden
      >
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-0`"
        :columns="apiTableColumns"
        :data="dialogPropsRows"
      />

      <h3>插槽</h3>
      <VisuallyHidden :id="`${documentationId}-api-table-1`">Dialog 对话框 插槽</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-1`"
        :columns="slotTableColumns"
        :data="slotTableRows"
      />

      <h3>事件</h3>
      <VisuallyHidden :id="`${documentationId}-api-table-2`">Dialog 对话框 事件</VisuallyHidden>
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

import { h, ref, shallowRef } from 'vue'
import { Button } from '@/components/primer-vue/Button'
import type { ButtonInstance } from '@/components/primer-vue/Button/types'
import { TextInput } from '@/components/primer-vue/TextInput'
import {
  Dialog,
  type DialogButtonProps,
  type DialogHeaderProps,
  type DialogProps,
} from '@/components/primer-vue/Dialog'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const documentationId = useDocumentationId()

const basicDialogOpen = ref(false)
const footerDialogOpen = ref(false)
const smallDialogOpen = ref(false)
const largeDialogOpen = ref(false)

const responsiveOpen = ref(false)
const closeResponsive = () => {
  responsiveOpen.value = false
}
const responsiveButtons: DialogButtonProps[] = [
  { content: '取消', onClick: closeResponsive },
  { content: '继续', buttonType: 'primary', autoFocus: true, onClick: closeResponsive },
]
const customOpen = ref(false)
const returnTarget = shallowRef<ButtonInstance | null>(null)
const initialTarget = shallowRef<InstanceType<typeof TextInput> | null>(null)
const focusProps: Pick<DialogProps, 'initialFocusRef' | 'returnFocusRef'> = {
  initialFocusRef: initialTarget,
  returnFocusRef: returnTarget,
}
const renderHeader = (props: DialogHeaderProps) =>
  h(Dialog.Header<'div'>, null, {
    default: () => [
      h(Dialog.Title, { id: props.dialogLabelId }, { default: () => props.title }),
      h(Dialog.CloseButton, {
        onClose: () => props.onClose('close-button'),
        onKeydown: (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            props.onClose('escape')
          }
        },
      }),
    ],
  })
const responsiveDemoCode = `<script setup lang="ts">
import { ref } from 'vue'
import { Dialog, type DialogButtonProps } from '@/components/primer-vue/Dialog'
const open = ref(false)
const close = () => { open.value = false }
const buttons: DialogButtonProps[] = [
  { content: '取消', onClick: close },
  { content: '继续', buttonType: 'primary', autoFocus: true, onClick: close },
]
<\/script>
<template>
  <button @click="open = true">打开</button>
  <Dialog v-if="open" :on-close="close" title="响应式任务"
    :position="{ narrow: 'bottom', regular: 'right' }"
    align="top" :footer-buttons="buttons">任务内容</Dialog>
</template>`
const renderDemoCode = `<script setup lang="ts">
import { h, ref, shallowRef } from 'vue'
import { Dialog, type DialogHeaderProps, type DialogProps } from '@/components/primer-vue/Dialog'
import { Button } from '@/components/primer-vue/Button'
import type { ButtonInstance } from '@/components/primer-vue/Button/types'
import { TextInput } from '@/components/primer-vue/TextInput'
const open = ref(false)
const initialTarget = shallowRef<InstanceType<typeof TextInput> | null>(null)
const returnTarget = shallowRef<ButtonInstance | null>(null)
const focusProps: Pick<DialogProps, 'initialFocusRef' | 'returnFocusRef'> = {
  initialFocusRef: initialTarget, returnFocusRef: returnTarget,
}
const renderHeader = (props: DialogHeaderProps) => h(Dialog.Header<'div'>, null, {
  default: () => h(Dialog.Title, { id: props.dialogLabelId }, { default: () => props.title }),
})
<\/script>
<template>
  <Button ref="returnTarget" @click="open = true">打开</Button>
  <Dialog v-if="open" v-bind="focusProps" :on-close="() => (open = false)"
    title="自定义标题" :render-header="renderHeader">
    <TextInput ref="initialTarget" aria-label="名称" />
  </Dialog>
</template>`

const largeDialogItems = [
  '对话框内容超过可用高度时，主体区域会独立滚动，页背景保持锁定。',
  '标题和关闭按钮保持在顶部，底部操作保持在尾部，用户可以稳定完成任务。',
  '如果内容复杂到需要多步导航，应该优先考虑使用独立页面。',
]

const basicDemoCode = `<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/primer-vue/Button'
import { Dialog } from '@/components/primer-vue/Dialog'

const open = ref(false)
<\/script>

<template>
  <Button @click="open = true">打开 Dialog</Button>

  <Dialog v-if="open" :on-close="() => (open = false)" title="创建新项目">
    <Dialog.Body>
      <p>Dialog 用于承载短期任务，不应替代完整页面。</p>
    </Dialog.Body>
  </Dialog>
</template>`

const footerDemoCode = `<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/primer-vue/Button'
import { Dialog } from '@/components/primer-vue/Dialog'

const open = ref(false)
<\/script>

<template>
  <Button @click="open = true">打开带操作的 Dialog</Button>

  <Dialog
    v-if="open" :on-close="() => (open = false)"
    title="删除部署环境"
    subtitle="此操作会停止当前环境中的所有运行实例。"
    role="alertdialog"
  >
    <Dialog.Body>
      <p>删除后无法从当前页面恢复。请确认团队成员已经完成必要的数据备份。</p>
    </Dialog.Body>
    <Dialog.Footer>
      <Button @click="open = false">取消</Button>
      <Button variant="danger" @click="open = false">删除环境</Button>
    </Dialog.Footer>
  </Dialog>
</template>`

const dimensionsDemoCode = `<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/primer-vue/Button'
import { Dialog } from '@/components/primer-vue/Dialog'

const smallOpen = ref(false)
const largeOpen = ref(false)
<\/script>

<template>
  <Button @click="smallOpen = true">Small</Button>
  <Button @click="largeOpen = true">Large</Button>

  <Dialog v-if="smallOpen" :on-close="() => (smallOpen = false)" title="小型 Dialog" width="small" height="small">
    <Dialog.Body>小尺寸适合非常短的确认或说明内容。</Dialog.Body>
  </Dialog>

  <Dialog v-if="largeOpen" :on-close="() => (largeOpen = false)" title="大型 Dialog" width="xlarge" height="large">
    <Dialog.Body>大型内容区域会独立滚动。</Dialog.Body>
  </Dialog>
</template>`

const apiTableColumns: DocumentationColumn[] = [
  { field: 'name', header: '属性名', rowHeader: true, minWidth: '150px' },
  { field: 'default', header: '默认值', minWidth: '120px' },
  { field: 'type', header: '类型', minWidth: '260px' },
  { field: 'description', header: '说明', minWidth: '280px' },
]

const dialogPropsRows = [
  {
    id: 'onClose',
    name: 'onClose',
    default: '必填',
    type: "(gesture: 'close-button' | 'escape') => void",
    description:
      '请求关闭时调用；Esc 和背板点击均为 escape，关闭按钮为 close-button。组件不会自行卸载。',
  },
  {
    id: 'title',
    name: 'title',
    default: "'Dialog'",
    type: 'VNodeChild',
    description: '可见标题，与 aria-labelledby 关联。',
  },
  {
    id: 'subtitle',
    name: 'subtitle',
    default: "''",
    type: 'VNodeChild',
    description: '可选副标题，与 aria-describedby 关联。',
  },
  {
    id: 'renderHeader',
    name: 'renderHeader',
    default: '内置 Header',
    type: '(props: DialogHeaderProps) => VNodeChild',
    description:
      '接收默认化的 title、subtitle、role 和 dialogLabelId、dialogDescriptionId；直接 Header 子节点优先。自定义标题须设置对应 ID。',
  },
  {
    id: 'renderBody',
    name: 'renderBody',
    default: '内置 Body',
    type: '(props: DialogProps & { children?: VNodeChild }) => VNodeChild',
    description: '接收未匹配结构插槽的 children；直接 Body 子节点优先。',
  },
  {
    id: 'renderFooter',
    name: 'renderFooter',
    default: '内置 Footer',
    type: '(props: DialogProps) => VNodeChild',
    description: '直接 Footer 子节点优先。返回 null 或 undefined 表示没有页脚。',
  },
  {
    id: 'footerButtons',
    name: 'footerButtons',
    default: '无页脚',
    type: 'DialogButtonProps[]',
    description: '省略时不渲染页脚，空数组仍渲染空页脚；内置页脚支持左右箭头和 Tab 导航。',
  },
  {
    id: 'width',
    name: 'width',
    default: "'xlarge'",
    type: "'small' | 'medium' | 'large' | 'xlarge' | CSSProperties['width']",
    description: '预设宽度分别为 296、320、480、640px；支持 CSS 宽度和像素数值，受位置及视口约束。',
  },
  {
    id: 'height',
    name: 'height',
    default: "'auto'",
    type: "'small' | 'large' | 'auto'",
    description: 'small 为 480px，large 为 640px，auto 随内容变化，受位置及视口约束。',
  },
  {
    id: 'position',
    name: 'position',
    default: "{ narrow: 'center', regular: 'center' }",
    type: "'center' | 'left' | 'right' | { narrow?, regular?, wide? }",
    description:
      '响应式类型支持 center/left/right/bottom/fullscreen；字符串仅设置 regular。基准 CSS 处理 regular 的 center/left/right，以及窄屏（≤767px）的 center/bottom/fullscreen；wide 仅透传属性，没有独立布局规则。',
  },
  {
    id: 'align',
    name: 'align',
    default: '-',
    type: "'top' | 'center' | 'bottom'",
    description: 'center 位置的垂直对齐方式；省略时居中。',
  },
  {
    id: 'role',
    name: 'role',
    default: "'dialog'",
    type: "'dialog' | 'alertdialog'",
    description: 'ARIA 角色。',
  },
  {
    id: 'initialFocusRef',
    name: 'initialFocusRef',
    default: 'autoFocus 操作按钮或首个可聚焦元素',
    type: 'Ref<DialogFocusTarget | null>',
    description: '指定原生元素或暴露 element 的组件作为初始焦点；通过包含 ref 的对象 v-bind 传入。',
  },
  {
    id: 'returnFocusRef',
    name: 'returnFocusRef',
    default: '打开前的焦点',
    type: 'Ref<DialogFocusTarget | null>',
    description: '关闭时将焦点还给指定原生元素或组件的 element；通过包含 ref 的对象 v-bind 传入。',
  },
  {
    id: 'className / style',
    name: 'className / style',
    default: '-',
    type: 'string / CSSProperties',
    description:
      '应用于根 div；数值样式遵循 React 的单位规则。自定义 width 优先于 style 中的 --dialog-width。',
  },
  {
    id: 'data-component',
    name: 'data-component',
    default: "'Dialog'",
    type: 'string',
    description: '根节点的组件标识。',
  },
]

const slotTableColumns: DocumentationColumn[] = [
  { field: 'name', header: '插槽名', rowHeader: true, minWidth: '180px' },
  { field: 'description', header: '说明', minWidth: '320px' },
]

const slotTableRows = [
  {
    id: 'Dialog default',
    name: 'Dialog default',
    description:
      '直接放置 Header、Body、Footer 替换对应区域；其余内容进入默认 Body。只使用首个匹配节点。',
  },
  {
    id: 'Dialog.Header / Title / Subtitle',
    name: 'Dialog.Header / Title / Subtitle',
    description: '自定义标题区域；Title 固定 h1，Subtitle 固定 h2，须设置与 Dialog 关联的 ID。',
  },
  {
    id: 'Dialog.Buttons',
    name: 'Dialog.Buttons',
    description:
      'buttons 必填。content 为 VNodeChild，buttonType 为 default/normal/primary/danger，其他属性遵循 Button。仅首个 autoFocus 按钮绑定焦点引用；Dialog 会将 autofocus 按钮的 ref 替换为内部引用。',
  },
  {
    id: 'Dialog.CloseButton',
    name: 'Dialog.CloseButton',
    description: 'onClose 必填，onKeydown 可选；使用 Close 标签与 invisible IconButton。',
  },
  {
    id: '组件引用',
    name: '组件引用',
    description:
      'Dialog、结构组件和标题组件暴露 element。Header、Body、Footer 固定渲染 div，as 作为属性透传，遵循基准的实际行为。',
  },
  {
    id: 'Dialog.Body default',
    name: 'Dialog.Body default',
    description: '主体内容区域，超出可用高度时独立滚动。',
  },
  {
    id: 'Dialog.Footer default',
    name: 'Dialog.Footer default',
    description: '底部操作区域，通常放置 Button。',
  },
]

const eventTableColumns: DocumentationColumn[] = [
  { field: 'name', header: '事件名', rowHeader: true, minWidth: '160px' },
  { field: 'payload', header: '载荷', minWidth: '240px' },
  { field: 'description', header: '说明', minWidth: '320px' },
]

const eventTableRows = [
  {
    id: 'onClose',
    name: 'onClose',
    payload: "'close-button' | 'escape'",
    description: '必填回调属性，用于请求关闭；由调用方更新 v-if。',
  },
]
</script>

<style scoped>
.dialog-demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.dialog-large-content {
  display: grid;
  gap: 0.75rem;
}
</style>
