<script setup lang="ts">
import { h, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { Button } from '@/components/primer-vue/Button'
import { ActionMenu } from '@/components/primer-vue/ActionMenu'
import { ActionList } from '@/components/primer-vue/ActionList'
import { Dialog } from '@/components/primer-vue/Dialog'
import { PortalContext, registerPortalRoot } from '@/components/primer-vue/Portal'
import {
  ConfirmationDialog,
  useConfirm,
  type ConfirmationDialogCloseGesture,
} from '@/components/primer-vue/ConfirmationDialog'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const basicOpen = shallowRef(false)
const dangerOpen = shallowRef(false)
const focusOpen = shallowRef(false)
const loadingOpen = shallowRef(false)
const dimensionsOpen = shallowRef(false)
const bodySlotOpen = shallowRef(false)
const portalOpen = shallowRef(false)
let namedPortalRoot: HTMLDivElement | undefined
onMounted(() => {
  namedPortalRoot = document.createElement('div')
  namedPortalRoot.dataset.confirmationDocsPortal = ''
  Object.assign(namedPortalRoot.style, { position: 'relative', zIndex: '10000' })
  document.body.append(namedPortalRoot)
  registerPortalRoot(namedPortalRoot, 'confirmation-docs')
})
onBeforeUnmount(() => namedPortalRoot?.remove())
const confirmLoading = shallowRef(false)
const cancelLoading = shallowRef(false)
const lastGesture = shallowRef('尚未操作')
const result = shallowRef('尚未操作')
const confirm = useConfirm()
function closeBasic(gesture: ConfirmationDialogCloseGesture) {
  lastGesture.value = gesture
  basicOpen.value = false
}
let loadingTimer: ReturnType<typeof setTimeout> | undefined
function closeLoading(gesture: ConfirmationDialogCloseGesture) {
  if (gesture === 'confirm' || gesture === 'cancel') {
    confirmLoading.value = gesture === 'confirm'
    cancelLoading.value = gesture === 'cancel'
    clearTimeout(loadingTimer)
    loadingTimer = setTimeout(() => {
      loadingOpen.value = false
      confirmLoading.value = false
      cancelLoading.value = false
    }, 1500)
  } else {
    clearTimeout(loadingTimer)
    loadingOpen.value = false
    confirmLoading.value = false
    cancelLoading.value = false
  }
}
onBeforeUnmount(() => clearTimeout(loadingTimer))
async function ask() {
  result.value = (await confirm({
    title: '确认继续？',
    content: h('p', '返回 Promise<boolean>，只有点击确认按钮才返回 true。'),
    cancelButtonContent: '取消',
    confirmButtonContent: '继续',
    confirmButtonType: 'primary',
  }))
    ? '已确认'
    : '已取消'
}

const basicCode = `<script setup lang="ts">
import { shallowRef } from 'vue'
import { Button } from '@/components/primer-vue/Button'
import { ConfirmationDialog } from '@/components/primer-vue/ConfirmationDialog'

const open = shallowRef(false)
<\/script>

<template>
  <Button @click="open = true">Show dialog</Button>
  <ConfirmationDialog v-if="open" title="继续操作？" :on-close="() => open = false">
    请确认当前操作。
  </ConfirmationDialog>
</template>`
const dangerCode = `<ConfirmationDialog
  v-if="open"
  title="删除文件？"
  confirm-button-content="删除"
  cancel-button-content="取消"
  confirm-button-type="danger"
  :on-close="() => open = false"
>
  删除后无法恢复。
</ConfirmationDialog>`
const focusCode = `<ConfirmationDialog
  v-if="open"
  title="继续操作？"
  override-button-focus="cancel"
  :on-close="() => open = false"
>
  需要时可显式指定初始聚焦取消按钮。
</ConfirmationDialog>`
const loadingCode = `<script setup lang="ts">
import { shallowRef } from 'vue'
import { ConfirmationDialog, type ConfirmationDialogCloseGesture } from '@/components/primer-vue/ConfirmationDialog'

const open = shallowRef(false)
const confirmLoading = shallowRef(false)
const cancelLoading = shallowRef(false)
async function onClose(gesture: ConfirmationDialogCloseGesture) {
  if (gesture === 'confirm' || gesture === 'cancel') {
    confirmLoading.value = gesture === 'confirm'
    cancelLoading.value = gesture === 'cancel'
    // 在此等待实际操作完成；组件不会自动卸载。
    await new Promise(resolve => setTimeout(resolve, 1500))
  }
  open.value = false
  confirmLoading.value = false
  cancelLoading.value = false
}
<\/script>

<template>
  <ConfirmationDialog
    v-if="open"
    title="删除文件？"
    confirm-button-content="删除"
    confirm-button-type="danger"
    :confirm-button-loading="confirmLoading"
    :cancel-button-loading="cancelLoading"
    :on-close="onClose"
  >删除操作需要一点时间。</ConfirmationDialog>
</template>`
const dimensionsCode = `<ConfirmationDialog
  v-if="open"
  title="自定义尺寸"
  :width="420"
  height="small"
  class-name="custom-confirmation"
  :on-close="() => open = false"
>
  宽度为 420px，高度预设为 480px；超出视口时受最大尺寸约束。
</ConfirmationDialog>`
const hookCode = `<script setup lang="ts">
import { h, shallowRef } from 'vue'
import { Button } from '@/components/primer-vue/Button'
import { useConfirm } from '@/components/primer-vue/ConfirmationDialog'

const confirm = useConfirm()
const result = shallowRef('尚未操作')
async function ask() {
  const accepted = await confirm({
    title: '确认继续？',
    content: h('p', '只有点击确认按钮才返回 true。'),
    confirmButtonContent: '继续',
    cancelButtonContent: '取消',
    confirmButtonType: 'primary',
  })
  result.value = accepted ? '已确认' : '已取消'
}
<\/script>

<template>
  <Button @click="ask">调用 useConfirm</Button>
  <p aria-live="polite">{{ result }}</p>
</template>`
const menuCode = `<ActionMenu>
  <ActionMenu.Button>操作</ActionMenu.Button>
  <ActionMenu.Overlay>
    <ActionList>
      <ActionList.Item @select="ask">确认操作</ActionList.Item>
    </ActionList>
  </ActionMenu.Overlay>
</ActionMenu>`
const bodySlotCode = `<script setup lang="ts">
import { Dialog } from '@/components/primer-vue/Dialog'
import { ConfirmationDialog } from '@/components/primer-vue/ConfirmationDialog'
<\/script>

<template>
  <ConfirmationDialog v-if="open" title="继续操作？" :on-close="() => open = false">
    <Dialog.Body>
      <p>直接传入的 Dialog.Body 替换默认主体，不会再次嵌套 Body。</p>
    </Dialog.Body>
  </ConfirmationDialog>
</template>`
const portalCode = `<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { PortalContext, registerPortalRoot } from '@/components/primer-vue/Portal'
import { ConfirmationDialog } from '@/components/primer-vue/ConfirmationDialog'

let root: HTMLDivElement
onMounted(() => {
  root = document.createElement('div')
  Object.assign(root.style, { position: 'relative', zIndex: '10000' })
  document.body.append(root)
  registerPortalRoot(root, 'confirmations')
})
onBeforeUnmount(() => root.remove())
<\/script>

<template>
  <PortalContext.Provider :value="{ portalContainerName: 'confirmations' }">
    <ConfirmationDialog v-if="open" title="继续操作？" :on-close="() => open = false">
      对话框及其嵌套浮层挂载到命名容器。
    </ConfirmationDialog>
  </PortalContext.Provider>
</template>`
const columns: TableColumn[] = [
  { key: 'name', label: '属性', rowHeader: true, minWidth: '180px' },
  { key: 'type', label: '类型', minWidth: '240px', wrap: true },
  { key: 'default', label: '默认值', minWidth: '100px' },
  { key: 'description', label: '说明', minWidth: '280px', wrap: true },
]
const propsRows = [
  {
    name: 'title',
    type: 'VNodeChild（必需）',
    default: '—',
    description: '可见标题与无障碍名称；可传文字或 h() 创建的 VNode。',
  },
  {
    name: 'onClose',
    type: "(gesture: 'confirm' | 'cancel' | 'close-button' | 'escape') => void（必需）",
    default: '—',
    description: '关闭请求回调；调用方决定是否卸载。点击背板与 Escape 均传 escape。',
  },
  {
    name: 'cancelButtonContent',
    type: 'VNodeChild',
    default: 'Cancel',
    description: '取消按钮内容。',
  },
  {
    name: 'confirmButtonContent',
    type: 'VNodeChild',
    default: 'OK',
    description: '确认按钮内容。',
  },
  {
    name: 'confirmButtonType',
    type: "'normal' | 'primary' | 'danger'",
    default: 'normal',
    description: '确认按钮变体；danger 默认聚焦取消按钮，其余默认聚焦确认按钮。',
  },
  {
    name: 'cancelButtonLoading',
    type: 'boolean',
    default: 'false',
    description: '取消按钮显示加载指示并阻止点击。',
  },
  {
    name: 'confirmButtonLoading',
    type: 'boolean',
    default: 'false',
    description: '确认按钮显示加载指示并阻止点击。',
  },
  {
    name: 'overrideButtonFocus',
    type: "'cancel' | 'confirm'",
    default: '按变体选择',
    description: '覆盖初始焦点，危险操作通常应保留取消按钮为默认焦点。',
  },
  {
    name: 'className',
    type: 'string',
    default: '—',
    description: '添加到 role="alertdialog" 的根节点。也支持 Vue 原生 class。',
  },
  {
    name: 'width',
    type: "'small' | 'medium' | 'large' | 'xlarge' | CSS width | number",
    default: 'medium',
    description: '预设为 296/320/480/640px；数字按像素处理。',
  },
  {
    name: 'height',
    type: "'small' | 'large' | 'auto'",
    default: 'auto',
    description: 'small 为 480px、large 为 640px；auto 随内容变化。',
  },
  {
    name: '默认插槽',
    type: 'VNode',
    default: '—',
    description:
      '普通子节点放入默认 Dialog.Body；直接传入的 Dialog.Header/Body/Footer 按结构化插槽识别，同类只使用第一个。',
  },
]
const hookRows = [
  {
    name: 'useConfirm()',
    type: '(options: ConfirmOptions) => Promise<boolean>',
    default: '—',
    description: '返回命令式确认函数；确认时返回 true，其余关闭方式返回 false，并卸载独立根节点。',
  },
  {
    name: 'ConfirmOptions',
    type: "Omit<ConfirmationDialogProps, 'onClose'> & { content: VNodeChild }",
    default: '—',
    description: '与组件共用属性，必需 title/content；由函数管理 onClose。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="ConfirmationDialog 确认对话框"
      description="为单个操作提供固定的取消、确认按钮和明确的初始焦点。"
    />
    <ComponentDocsSection title="基础用法">
      <template #description
        >使用 v-if 控制挂载，onClose 只报告关闭手势。默认聚焦确认按钮。</template
      >
      <ComponentDocsDemoBlock :code="basicCode">
        <Button @click="basicOpen = true">Show dialog</Button>
        <ConfirmationDialog v-if="basicOpen" title="继续操作？" :on-close="closeBasic"
          >请确认当前操作。</ConfirmationDialog
        >
        <p aria-live="polite">最近关闭手势：{{ lastGesture }}</p>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="危险操作">
      <template #description>danger 默认聚焦取消按钮，减少误确认的可能。</template>
      <ComponentDocsDemoBlock :code="dangerCode">
        <Button variant="danger" @click="dangerOpen = true">删除文件</Button>
        <ConfirmationDialog
          v-if="dangerOpen"
          title="删除文件？"
          confirm-button-content="删除"
          cancel-button-content="取消"
          confirm-button-type="danger"
          :on-close="() => (dangerOpen = false)"
          >删除后无法恢复。</ConfirmationDialog
        >
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="覆盖初始焦点">
      <ComponentDocsDemoBlock :code="focusCode">
        <Button @click="focusOpen = true">初始聚焦取消按钮</Button>
        <ConfirmationDialog
          v-if="focusOpen"
          title="继续操作？"
          override-button-focus="cancel"
          :on-close="() => (focusOpen = false)"
          >需要时可显式指定初始聚焦取消按钮。</ConfirmationDialog
        >
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="加载状态">
      <template #description
        >确认和取消按钮可独立加载；此示例等待 1.5 秒后卸载对话框。关闭按钮和 Escape
        仍可关闭。</template
      >
      <ComponentDocsDemoBlock :code="loadingCode">
        <Button @click="loadingOpen = true">Show Loading Dialog</Button>
        <ConfirmationDialog
          v-if="loadingOpen"
          title="删除文件？"
          confirm-button-content="删除"
          confirm-button-type="danger"
          :confirm-button-loading="confirmLoading"
          :cancel-button-loading="cancelLoading"
          :on-close="closeLoading"
          >删除操作需要一点时间。</ConfirmationDialog
        >
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="自定义尺寸">
      <ComponentDocsDemoBlock :code="dimensionsCode">
        <Button @click="dimensionsOpen = true">420px × small</Button>
        <ConfirmationDialog
          v-if="dimensionsOpen"
          title="自定义尺寸"
          :width="420"
          height="small"
          class-name="custom-confirmation"
          :on-close="() => (dimensionsOpen = false)"
          >宽度为 420px，高度预设为 480px；超出视口时受最大尺寸约束。</ConfirmationDialog
        >
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="useConfirm">
      <template #description
        >返回 Promise，适合需要等待用户选择后继续执行的流程。独立挂载的对话框不继承调用组件的
        provide 上下文，并持续存在直到用户关闭。</template
      >
      <ComponentDocsDemoBlock :code="hookCode">
        <Button @click="ask">调用 useConfirm</Button>
        <p aria-live="polite">{{ result }}</p>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="从操作菜单打开">
      <template #description>复用上例 ask()；菜单关闭后，对话框接管焦点。</template>
      <ComponentDocsDemoBlock :code="menuCode">
        <ActionMenu>
          <ActionMenu.Button>操作</ActionMenu.Button>
          <ActionMenu.Overlay>
            <ActionList><ActionList.Item @select="ask">确认操作</ActionList.Item></ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="结构化主体">
      <template #description>
        底层 Dialog 会识别直接传入的 Header、Body、Footer，以及共享插槽标记的包装组件。 显式
        Fragment 保持为普通内容。通常应保留默认
        Header/Footer；替换它们时需自行维护标题的无障碍关联、关闭操作和按钮焦点。
      </template>
      <ComponentDocsDemoBlock :code="bodySlotCode">
        <Button @click="bodySlotOpen = true">打开结构化主体</Button>
        <ConfirmationDialog
          v-if="bodySlotOpen"
          title="继续操作？"
          :on-close="() => (bodySlotOpen = false)"
        >
          <Dialog.Body><p>直接传入的 Dialog.Body 替换默认主体，不会再次嵌套 Body。</p></Dialog.Body>
        </ConfirmationDialog>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="命名 Portal 容器">
      <template #description>
        使用 registerPortalRoot 注册容器，PortalContext.Provider 为组件及嵌套浮层指定挂载位置。
        容器必须在对话框挂载前注册；容器层级由应用负责，每个 Portal 内部保持 z-index: 1。 useConfirm
        创建独立应用根，不继承调用方的 PortalContext。
      </template>
      <ComponentDocsDemoBlock :code="portalCode">
        <PortalContext.Provider :value="{ portalContainerName: 'confirmation-docs' }">
          <Button @click="portalOpen = true">打开命名容器对话框</Button>
          <ConfirmationDialog
            v-if="portalOpen"
            title="命名容器"
            :on-close="() => (portalOpen = false)"
          >
            对话框挂载到为此示例注册的命名容器。
          </ConfirmationDialog>
        </PortalContext.Provider>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="键盘与无障碍">
      <p>
        使用 alertdialog 角色，标题通过 aria-labelledby
        提供名称。焦点保持在对话框中，关闭后恢复先前焦点。底部按钮支持 ← / → 与 Tab /
        Shift+Tab；在边界按 Tab 返回对话框内其他可聚焦元素。
      </p>
      <p>
        Escape、关闭按钮、完整点击背板都会请求关闭；正文可滚动时会成为有名称的可聚焦
        region。页面滚动在对话框挂载期间锁定。
      </p>
    </ComponentDocsSection>
    <ComponentDocsSection title="组件 API" variant="api"
      ><Table :columns="columns" :data="propsRows" row-key="name"
    /></ComponentDocsSection>
    <ComponentDocsSection title="useConfirm API" variant="api"
      ><Table :columns="columns" :data="hookRows" row-key="name"
    /></ComponentDocsSection>
  </ComponentDocsPage>
</template>
