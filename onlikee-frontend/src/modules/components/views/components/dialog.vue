<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Dialog 对话框"
      description="用于在当前页面上方展示短期任务、确认操作或辅助选择。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        使用 <code>v-model:open</code> 控制展示状态。对话框打开后会自动聚焦关闭按钮，按 <code>Esc</code> 或点击背板可关闭。
      </template>

      <ComponentDocsDemoBlock :code="basicDemoCode">
        <Button @click="basicDialogOpen = true">
          打开 Dialog
        </Button>

        <Dialog
          v-model:open="basicDialogOpen"
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
        使用 <code>subtitle</code> 补充上下文，使用 <code>Dialog.Footer</code> 放置取消、危险或主操作按钮。
      </template>

      <ComponentDocsDemoBlock :code="footerDemoCode">
        <Button @click="footerDialogOpen = true">
          打开带操作的 Dialog
        </Button>

        <Dialog
          v-model:open="footerDialogOpen"
          title="删除部署环境"
          subtitle="此操作会停止当前环境中的所有运行实例。"
          role="alertdialog"
        >
          <Dialog.Body>
            <p>删除后无法从当前页面恢复。请确认团队成员已经完成必要的数据备份。</p>
          </Dialog.Body>
          <Dialog.Footer>
            <Button @click="footerDialogOpen = false">
              取消
            </Button>
            <Button
              variant="danger"
              @click="footerDialogOpen = false"
            >
              删除环境
            </Button>
          </Dialog.Footer>
        </Dialog>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="尺寸">
      <template #description>
        使用 <code>width</code> 控制宽度，支持预设、CSS 宽度和像素数值。使用 <code>height</code> 控制高度：small 为 480px，large 为 640px，默认 auto 随内容变化。Dialog 会限制在当前视口内，内容过长时主体区域独立滚动。
      </template>

      <ComponentDocsDemoBlock :code="dimensionsDemoCode">
        <div class="dialog-demo-actions">
          <Button @click="smallDialogOpen = true">
            Small
          </Button>
          <Button @click="largeDialogOpen = true">
            Large
          </Button>
        </div>

        <Dialog
          v-model:open="smallDialogOpen"
          title="小型 Dialog"
          width="small"
          height="small"
        >
          <Dialog.Body>
            <p>小尺寸适合非常短的确认或说明内容。</p>
          </Dialog.Body>
        </Dialog>

        <Dialog
          v-model:open="largeDialogOpen"
          title="大型 Dialog"
          subtitle="用于需要更多空间的编辑或选择任务。"
          width="xlarge"
          height="large"
        >
          <Dialog.Body>
            <div class="dialog-large-content">
              <p
                v-for="item in largeDialogItems"
                :key="item"
              >
                {{ item }}
              </p>
            </div>
          </Dialog.Body>
          <Dialog.Footer>
            <Button @click="largeDialogOpen = false">
              关闭
            </Button>
          </Dialog.Footer>
        </Dialog>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection
      title="API"
      variant="api"
    >
      <h3>Dialog Props</h3>
      <Table
        :columns="apiTableColumns"
        :data="dialogPropsRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h3>插槽</h3>
      <Table
        :columns="slotTableColumns"
        :data="slotTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h3>事件</h3>
      <Table
        :columns="eventTableColumns"
        :data="eventTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/primer-vue/Button'
import { Dialog } from '@/components/primer-vue/Dialog'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const basicDialogOpen = ref(false)
const footerDialogOpen = ref(false)
const smallDialogOpen = ref(false)
const largeDialogOpen = ref(false)

const largeDialogItems = [
  '对话框内容超过可用高度时，主体区域会独立滚动，页背景保持锁定。',
  '标题和关闭按钮保持在顶部，底部操作保持在尾部，用户可以稳定完成任务。',
  '如果内容复杂到需要多步导航，应该优先考虑使用独立页面。'
]

const basicDemoCode = `<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/primer-vue/Button'
import { Dialog } from '@/components/primer-vue/Dialog'

const open = ref(false)
<\/script>

<template>
  <Button @click="open = true">打开 Dialog</Button>

  <Dialog v-model:open="open" title="创建新项目">
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
    v-model:open="open"
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

  <Dialog v-model:open="smallOpen" title="小型 Dialog" width="small" height="small">
    <Dialog.Body>小尺寸适合非常短的确认或说明内容。</Dialog.Body>
  </Dialog>

  <Dialog v-model:open="largeOpen" title="大型 Dialog" width="xlarge" height="large">
    <Dialog.Body>大型内容区域会独立滚动。</Dialog.Body>
  </Dialog>
</template>`

const apiTableColumns: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '150px' },
  { key: 'default', label: '默认值', minWidth: '120px' },
  { key: 'type', label: '类型', minWidth: '260px', wrap: true },
  { key: 'description', label: '说明', minWidth: '280px', wrap: true }
]

const dialogPropsRows = [
  {
    name: 'open',
    default: 'false',
    type: 'boolean',
    description: '控制 Dialog 是否展示，支持 v-model:open。'
  },
  {
    name: 'title',
    default: '-',
    type: 'string',
    description: 'Dialog 的可见标题，同时作为 aria-labelledby 的来源。'
  },
  {
    name: 'subtitle',
    default: "''",
    type: 'string',
    description: '标题下方的辅助说明，同时作为 aria-describedby 的来源。'
  },
  {
    name: 'width',
    default: "'xlarge'",
    type: "'small' | 'medium' | 'large' | 'xlarge' | string | number",
    description: '控制 Dialog 宽度：small 为 296px，medium 为 320px，large 为 480px，xlarge 为 640px。也支持有效 CSS 宽度（如 400px、80rem），数字按像素处理。最小宽度为 296px，最大宽度通常为视口宽度减 64px。'
  },
  {
    name: 'height',
    default: "'auto'",
    type: "'small' | 'large' | 'auto'",
    description: '控制 Dialog 高度：small 为 480px，large 为 640px，auto 根据内容变化。最大高度通常为视口高度减 64px；视口宽度不超过 767px 且高度不超过 280px 时，宽高的视口预留均改为 12px。'
  },
  {
    name: 'role',
    default: "'dialog'",
    type: "'dialog' | 'alertdialog'",
    description: '设置 ARIA role，危险确认可使用 alertdialog。'
  },
  {
    name: 'closeOnEscape',
    default: 'true',
    type: 'boolean',
    description: '是否允许按 Esc 关闭。'
  },
  {
    name: 'closeOnBackdrop',
    default: 'true',
    type: 'boolean',
    description: '是否允许点击背板关闭。'
  }
]

const slotTableColumns: TableColumn[] = [
  { key: 'name', label: '插槽名', rowHeader: true, minWidth: '180px' },
  { key: 'description', label: '说明', minWidth: '320px', wrap: true }
]

const slotTableRows = [
  { name: 'Dialog default', description: '放置 Dialog.Body、Dialog.Footer 或自定义内容。' },
  { name: 'Dialog.Body default', description: '主体内容区域，超出可用高度时独立滚动。' },
  { name: 'Dialog.Footer default', description: '底部操作区域，通常放置 Button。' }
]

const eventTableColumns: TableColumn[] = [
  { key: 'name', label: '事件名', rowHeader: true, minWidth: '160px' },
  { key: 'payload', label: '载荷', minWidth: '240px', wrap: true },
  { key: 'description', label: '说明', minWidth: '320px', wrap: true }
]

const eventTableRows = [
  {
    name: 'update:open',
    payload: 'boolean',
    description: 'open 状态变更事件，用于 v-model:open。'
  },
  {
    name: 'close',
    payload: "'close-button' | 'escape' | 'backdrop'",
    description: '用户通过关闭按钮、Esc 或背板请求关闭时触发。'
  }
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
