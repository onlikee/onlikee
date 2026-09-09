<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Banner 横幅提示"
      description="用于在页面顶部展示状态信息与操作反馈。"
    />

    <ComponentDocsSection title="基础用法（服务调用）">
      <template #description>
        通过 <code>Banner</code> 直接触发横幅提示，基础教学中每个按钮都对应独立函数。
      </template>

      <ComponentDocsDemoBlock :code="serviceDemoCode">
        <div class="banner-demo-actions">
          <button
            class="demo-btn"
            type="button"
            @click="showInfoBanner"
          >
            Info
          </button>
          <button
            class="demo-btn"
            type="button"
            @click="showSuccessBanner"
          >
            Success
          </button>
          <button
            class="demo-btn"
            type="button"
            @click="showTimedBanner"
          >
            自动关闭
          </button>
          <button
            class="demo-btn"
            type="button"
            @click="showWarningBanner"
          >
            Warning
          </button>
          <button
            class="demo-btn"
            type="button"
            @click="showCriticalBanner"
          >
            Critical
          </button>
          <button
            class="demo-btn"
            type="button"
            @click="showUpsellBanner"
          >
            Upsell
          </button>
          <button
            class="demo-btn demo-btn--ghost"
            type="button"
            @click="closeBanner"
          >
            Close
          </button>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="自动关闭时长">
      <template #description>
        通过在 options 中设置 <code>duration</code>，让 Banner 在指定时间后自动关闭。
      </template>

      <ComponentDocsDemoBlock :code="durationDemoCode">
        <div class="banner-demo-actions">
          <button
            class="demo-btn"
            type="button"
            @click="showTimedBanner"
          >
            展示自动关闭 Banner
          </button>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="不同状态与操作按钮">
      <template #description>
        通过 <code>primaryAction</code>、<code>secondaryAction</code> 和 <code>actionsLayout</code> 配置按钮与布局。
      </template>

      <ComponentDocsDemoBlock :code="actionsDemoCode">
        <div class="banner-demo-actions">
          <button
            class="demo-btn"
            type="button"
            @click="showDefaultActionsBanner"
          >
            Default Actions
          </button>
          <button
            class="demo-btn"
            type="button"
            @click="showInlineActionsBanner"
          >
            Inline Actions
          </button>
          <button
            class="demo-btn"
            type="button"
            @click="showStackedActionsBanner"
          >
            Stacked Actions
          </button>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="组件实例调用（ref）">
      <template #description>
        直接挂载 <code>Banner.vue</code>，通过组件实例暴露的 <code>show()</code> / <code>close()</code> 方法控制展示。
      </template>

      <ComponentDocsDemoBlock :code="instanceDemoCode">
        <div class="banner-demo-instance">
          <BannerView ref="bannerRef" />
          <div class="banner-demo-actions">
            <button
              class="demo-btn"
              type="button"
              @click="showBannerWithRef"
            >
              Call show()
            </button>
            <button
              class="demo-btn demo-btn--ghost"
              type="button"
              @click="closeBannerWithRef"
            >
              Call close()
            </button>
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection
      title="API"
      variant="api"
    >
      <h4>Banner 方法</h4>
      <Table
        :columns="methodTableColumns"
        :data="methodTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h4 style="margin-top: 24px;">
        BannerOptions
      </h4>
      <Table
        :columns="optionsTableColumns"
        :data="optionsTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h4 style="margin-top: 24px;">
        BannerAction
      </h4>
      <Table
        :columns="actionTableColumns"
        :data="actionTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h4 style="margin-top: 24px;">
        BannerExposed
      </h4>
      <Table
        :columns="exposedTableColumns"
        :data="exposedTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Banner } from '@/components/primer-vue/Banner'
import BannerView, { type BannerExposed } from '@/components/primer-vue/Banner/Banner.vue'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const bannerRef = ref<BannerExposed | null>(null)

const showInfoBanner = () => {
  Banner.info('这是一条信息提示，请根据说明继续操作。')
}

const showSuccessBanner = () => {
  Banner.success('保存成功，配置已经生效。')
}

const showTimedBanner = () => {
  Banner.success('3 秒后自动关闭。', { duration: 3000 })
}

const showWarningBanner = () => {
  Banner.warning('存在潜在风险，请检查关键配置后再继续。')
}

const showCriticalBanner = () => {
  Banner.critical('操作失败，请修复问题后重试。')
}

const showUpsellBanner = () => {
  Banner.upsell('你可以升级到专业版解锁更多能力。')
}

const closeBanner = () => {
  Banner.close()
}

const showDefaultActionsBanner = () => {
  Banner.warning('检测到新版本，建议尽快升级。', {
    title: '版本更新提醒',
    primaryAction: {
      label: '立即更新',
      onClick: () => Banner.success('更新任务已加入队列。')
    },
    secondaryAction: {
      label: '稍后提醒',
      onClick: () => Banner.info('已记录你的提醒偏好。')
    },
    actionsLayout: 'default'
  })
}

const showInlineActionsBanner = () => {
  Banner.info('你的存储空间即将用尽。', {
    title: '容量提醒',
    primaryAction: {
      label: '查看套餐',
      href: 'https://github.com/UnderHear'
    },
    secondaryAction: {
      label: '稍后处理',
      onClick: () => Banner.info('你可以在设置页随时处理。')
    },
    actionsLayout: 'inline'
  })
}

const showStackedActionsBanner = () => {
  Banner.critical('部署失败，请检查构建日志后重试。', {
    title: '部署失败',
    primaryAction: {
      label: '重试部署',
      onClick: () => Banner.info('已发起重试部署。')
    },
    secondaryAction: {
      label: '查看日志',
      onClick: () => Banner.info('正在打开日志面板。')
    },
    actionsLayout: 'stacked'
  })
}

const showBannerWithRef = () => {
  bannerRef.value?.show('这是通过组件实例触发的 Banner。', 'success', {
    title: 'Ref 调用成功',
    primaryAction: {
      label: '继续',
      onClick: () => Banner.info('继续下一步。')
    }
  })
}

const closeBannerWithRef = () => {
  bannerRef.value?.close()
}

const serviceDemoCode = `<template>
  <div class="banner-demo-actions">
    <button class="demo-btn" type="button" @click="showInfoBanner">Info</button>
    <button class="demo-btn" type="button" @click="showSuccessBanner">Success</button>
    <button class="demo-btn" type="button" @click="showTimedBanner">自动关闭</button>
    <button class="demo-btn" type="button" @click="showWarningBanner">Warning</button>
    <button class="demo-btn" type="button" @click="showCriticalBanner">Critical</button>
    <button class="demo-btn" type="button" @click="showUpsellBanner">Upsell</button>
    <button class="demo-btn demo-btn--ghost" type="button" @click="closeBanner">Close</button>
  </div>
</template>

<script setup lang="ts">
import { Banner } from '@/components/primer-vue/Banner'

const showInfoBanner = () => Banner.info('这是一条信息提示，请根据说明继续操作。')
const showSuccessBanner = () => Banner.success('保存成功，配置已经生效。')
const showWarningBanner = () => Banner.warning('存在潜在风险，请检查关键配置后再继续。')
const showCriticalBanner = () => Banner.critical('操作失败，请修复问题后重试。')
const showUpsellBanner = () => Banner.upsell('你可以升级到专业版解锁更多能力。')
const showTimedBanner = () => Banner.success('3 秒后自动关闭。', { duration: 3000 })
const closeBanner = () => Banner.close()
<\/script>

<style scoped>
.banner-demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.demo-btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid var(--borderColor-default);
  background: var(--bgColor-muted);
  cursor: pointer;
}

.demo-btn--ghost {
  background: var(--bgColor-default);
}
<\/style>`

const durationDemoCode = `<template>
  <div class="banner-demo-actions">
    <button class="demo-btn" type="button" @click="showDurationBanner">展示自动关闭 Banner</button>
  </div>
</template>

<script setup lang="ts">
import { Banner } from '@/components/primer-vue/Banner'

const showDurationBanner = () => {
  Banner.success('3 秒后自动关闭。', { duration: 3000 })
}
<\/script>`

const actionsDemoCode = `<template>
  <div class="banner-demo-actions">
    <button class="demo-btn" type="button" @click="showDefaultActionsBanner">Default Actions</button>
    <button class="demo-btn" type="button" @click="showInlineActionsBanner">Inline Actions</button>
    <button class="demo-btn" type="button" @click="showStackedActionsBanner">Stacked Actions</button>
  </div>
</template>

<script setup lang="ts">
import { Banner } from '@/components/primer-vue/Banner'

const showDefaultActionsBanner = () => {
  Banner.warning('检测到新版本，建议尽快升级。', {
    title: '版本更新提醒',
    primaryAction: { label: '立即更新', onClick: () => Banner.success('更新任务已加入队列。') },
    secondaryAction: { label: '稍后提醒', onClick: () => Banner.info('已记录你的提醒偏好。') },
    actionsLayout: 'default'
  })
}

const showInlineActionsBanner = () => {
  Banner.info('你的存储空间即将用尽。', {
    title: '容量提醒',
    primaryAction: { label: '查看套餐', href: 'https://github.com/UnderHear' },
    secondaryAction: { label: '稍后处理', onClick: () => Banner.info('你可以在设置页随时处理。') },
    actionsLayout: 'inline'
  })
}

const showStackedActionsBanner = () => {
  Banner.critical('部署失败，请检查构建日志后重试。', {
    title: '部署失败',
    primaryAction: { label: '重试部署', onClick: () => Banner.info('已发起重试部署。') },
    secondaryAction: { label: '查看日志', onClick: () => Banner.info('正在打开日志面板。') },
    actionsLayout: 'stacked'
  })
}
<\/script>

<style scoped>
.banner-demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.demo-btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid var(--borderColor-default);
  background: var(--bgColor-muted);
  cursor: pointer;
}
<\/style>`

const instanceDemoCode = `<template>
  <div class="banner-demo-instance">
    <BannerView ref="bannerRef" />
    <div class="banner-demo-actions">
      <button class="demo-btn" type="button" @click="showBannerWithRef">Call show()</button>
      <button class="demo-btn demo-btn--ghost" type="button" @click="closeBannerWithRef">Call close()</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Banner } from '@/components/primer-vue/Banner'
import BannerView, { type BannerExposed } from '@/components/primer-vue/Banner/Banner.vue'

const bannerRef = ref<BannerExposed | null>(null)

const showBannerWithRef = () => {
  bannerRef.value?.show('这是通过组件实例触发的 Banner。', 'success', {
    title: 'Ref 调用成功',
    primaryAction: {
      label: '继续',
      onClick: () => Banner.info('继续下一步。')
    }
  })
}

const closeBannerWithRef = () => bannerRef.value?.close()
<\/script>

<style scoped>
.banner-demo-instance {
  width: 100%;
}

.banner-demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.demo-btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid var(--borderColor-default);
  background: var(--bgColor-muted);
  cursor: pointer;
}

.demo-btn--ghost {
  background: var(--bgColor-default);
}
<\/style>`

const methodTableColumns: TableColumn[] = [
  { key: 'name', label: '方法', rowHeader: true, minWidth: '220px', wrap: true },
  { key: 'description', label: '说明', minWidth: '240px', wrap: true },
  { key: 'signature', label: '签名', minWidth: '360px', wrap: true }
]

const methodTableRows = [
  {
    name: 'Banner(message, type?, options?)',
    description: '按类型展示横幅提示，并返回 close 句柄。',
    signature: '(message: string, type?: BannerType, options?: BannerOptions) => BannerResult'
  },
  {
    name: 'Banner.info/success/warning/critical/upsell',
    description: '语义化快捷方法。',
    signature: '(message: string, options?: BannerOptions) => BannerResult'
  },
  {
    name: 'Banner.error',
    description: 'critical 的别名，等同 Banner.critical。',
    signature: '(message: string, options?: BannerOptions) => BannerResult'
  },
  {
    name: 'Banner.close',
    description: '关闭当前横幅。',
    signature: '() => void'
  }
]

const optionsTableColumns: TableColumn[] = [
  { key: 'name', label: '字段', rowHeader: true, minWidth: '170px' },
  { key: 'description', label: '说明', minWidth: '220px', wrap: true },
  { key: 'type', label: '类型', minWidth: '240px', wrap: true },
  { key: 'default', label: '默认值', minWidth: '140px' }
]

const optionsTableRows = [
  { name: 'title', description: '标题文本', type: 'string', default: "type 对应默认标题" },
  { name: 'description', description: '描述文本', type: 'string', default: 'message' },
  { name: 'ariaLabel', description: '无障碍标签', type: 'string', default: "'undefined'" },
  { name: 'hideTitle', description: '是否隐藏可见标题', type: 'boolean', default: 'false' },
  { name: 'dismissible', description: '是否显示关闭按钮', type: 'boolean', default: 'true' },
  { name: 'primaryAction', description: '主操作按钮配置', type: 'BannerAction', default: "'undefined'" },
  { name: 'secondaryAction', description: '次操作按钮配置', type: 'BannerAction', default: "'undefined'" },
  {
    name: 'actionsLayout',
    description: '操作按钮布局',
    type: "'default' | 'inline' | 'stacked'",
    default: "'default'"
  },
  { name: 'flush', description: '是否使用通栏样式', type: 'boolean', default: 'false' },
  { name: 'duration', description: '自动关闭时长（毫秒）', type: 'number', default: "'undefined'" }
]

const actionTableColumns: TableColumn[] = [
  { key: 'name', label: '字段', rowHeader: true, minWidth: '160px' },
  { key: 'description', label: '说明', minWidth: '260px', wrap: true },
  { key: 'type', label: '类型', minWidth: '260px', wrap: true }
]

const actionTableRows = [
  { name: 'label', description: '按钮文本', type: 'string' },
  { name: 'href', description: '跳转链接（存在时渲染为 a 标签）', type: 'string | undefined' },
  { name: 'onClick', description: '点击回调（无 href 时常用）', type: '(() => void) | undefined' }
]

const exposedTableColumns: TableColumn[] = [
  { key: 'name', label: '方法', rowHeader: true, minWidth: '220px', wrap: true },
  { key: 'description', label: '说明', minWidth: '220px', wrap: true },
  { key: 'signature', label: '签名', minWidth: '360px', wrap: true }
]

const exposedTableRows = [
  {
    name: 'show',
    description: '显示 Banner。',
    signature: '(message: string, type?: BannerType, options?: BannerOptions) => BannerResult'
  },
  {
    name: 'close',
    description: '关闭 Banner。',
    signature: '() => void'
  }
]
</script>

<style scoped>
.banner-demo-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.banner-demo-instance {
  width: 100%;
}

.demo-btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid var(--borderColor-default);
  background: var(--bgColor-muted);
  color: var(--fgColor-default);
  font-size: 14px;
  cursor: pointer;
}

.demo-btn:hover {
  background: var(--bgColor-muted);
}

.demo-btn--ghost {
  background: var(--bgColor-default);
}

h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--fgColor-default);
}
</style>
