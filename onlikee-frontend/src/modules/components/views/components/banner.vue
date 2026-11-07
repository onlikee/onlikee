<script setup lang="ts">
import { nextTick, ref, useId } from 'vue'
import { RocketIcon } from '@onlikee/octicons-vue'
import { Banner, type BannerVariant } from '@/components/primer-vue/Banner'
import { Button } from '@/components/primer-vue/Button'
import { Dialog } from '@/components/primer-vue/Dialog'
import { Link } from '@/components/primer-vue/Link'
import { PageLayout } from '@/components/primer-vue/PageLayout'
import { Stack } from '@/components/primer-vue/Stack'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'
import AriaStatus from '@/components/primer-vue/internal/components/AriaStatus.vue'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const documentationId = useId()
const variants: BannerVariant[] = ['info', 'success', 'warning', 'critical', 'upsell']
const actionsLayouts = ['default', 'inline', 'stacked'] as const
const dismissibleVisible = ref(true)
const nextHeading = ref<HTMLHeadingElement | null>(null)
const errorVisible = ref(false)
const errorBanner = ref<{ element: HTMLElement | null } | null>(null)
const dialogOpen = ref(false)
const actionMessage = ref('尚未执行操作')

async function dismissBanner() {
  dismissibleVisible.value = false
  await nextTick()
  nextHeading.value?.focus()
}

async function updateProfile() {
  errorVisible.value = true
  await nextTick()
  errorBanner.value?.element?.focus()
}

const basicCode = `<script setup lang="ts">
import { Banner } from '@/components/primer-vue/Banner'
<\/script>

<template>
  <Banner
    variant="warning"
    title="需要更新付款信息"
    description="请更新付款方式，以继续使用当前服务。"
  />
</template>`

const compoundCode = `<Banner>
  <Banner.Title as="h3">启用双重验证</Banner.Title>
  <Banner.Description>
    请按 <Link inline href="https://docs.github.com/authentication">安全指南</Link>
    启用双重验证，保护你的账户。
  </Banner.Description>
  <template #primaryAction>
    <Banner.PrimaryAction @click="enableTwoFactor">立即启用</Banner.PrimaryAction>
  </template>
  <template #secondaryAction>
    <Banner.SecondaryAction as="a" href="https://docs.github.com/authentication">
      了解更多
    </Banner.SecondaryAction>
  </template>
</Banner>`

const appearanceCode = `<Banner title="后台任务已完成" description="可以继续下一步操作。" hide-title />
<Banner title="紧凑布局" description="减少横幅内边距。" layout="compact" />
<Banner title="升级你的团队空间" variant="upsell">
  <template #leadingVisual><RocketIcon /></template>
  <template #description>
    升级套餐以获得更多空间和 <Link inline href="https://github.com/pricing">团队功能</Link>。
  </template>
</Banner>`

const actionsCode = `<Banner title="准备部署" description="确认后将发布当前版本。" actions-layout="default">
  <template #primaryAction>
    <Banner.PrimaryAction @click="deploy">开始部署</Banner.PrimaryAction>
  </template>
  <template #secondaryAction>
    <Banner.SecondaryAction @click="review">查看变更</Banner.SecondaryAction>
  </template>
</Banner>

<!-- 可将 actions-layout 设置为 inline 或 stacked；操作也可以使用其他组件。 -->
<Banner title="阅读部署指南" hide-title actions-layout="inline">
  <template #primaryAction>
    <Button as="a" href="https://docs.github.com" variant="link">查看指南</Button>
  </template>
</Banner>`

const dismissCode = `<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { Banner } from '@/components/primer-vue/Banner'

const visible = ref(true)
const nextHeading = ref<HTMLHeadingElement | null>(null)
async function dismiss() {
  visible.value = false
  await nextTick()
  nextHeading.value?.focus()
}
<\/script>

<template>
  <Banner v-if="visible" title="账户配置已更新" @dismiss="dismiss" />
  <h3 ref="nextHeading" tabindex="-1">账户设置</h3>
</template>`

const focusCode = `<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { Banner } from '@/components/primer-vue/Banner'
import { Button } from '@/components/primer-vue/Button'

const hasError = ref(false)
const bannerRef = ref<{ element: HTMLElement | null } | null>(null)
async function updateProfile() {
  hasError.value = true
  await nextTick()
  bannerRef.value?.element?.focus()
}
<\/script>

<template>
  <Banner v-if="hasError" ref="bannerRef" title="更新失败" variant="critical">
    <template #description><div role="alert">暂时无法更新资料，请稍后重试。</div></template>
  </Banner>
  <Button @click="updateProfile">更新资料</Button>
</template>`

const sidebarCode = `<PageLayout padding="none">
  <PageLayout.Pane position="start" divider="line">
    <Banner title="团队安全提醒" description="请为所有成员启用双重验证。">
      <template #primaryAction><Banner.PrimaryAction>查看成员</Banner.PrimaryAction></template>
      <template #secondaryAction><Banner.SecondaryAction>稍后处理</Banner.SecondaryAction></template>
    </Banner>
  </PageLayout.Pane>
  <PageLayout.Content><p>页面主体内容</p></PageLayout.Content>
</PageLayout>`

const dialogCode = `<Dialog v-if="open" title="部署设置" :on-close="() => (open = false)">
  <Dialog.Body :style="{ padding: 0 }">
    <Banner title="部署前检查" description="请确认环境变量已经配置。" variant="warning" flush>
      <template #primaryAction>
        <Banner.PrimaryAction @click="checkEnvironment">检查环境</Banner.PrimaryAction>
      </template>
    </Banner>
    <div style="padding: var(--base-size-16, 1rem)"><p>部署设置内容</p></div>
  </Dialog.Body>
</Dialog>`

const apiColumns: DocumentationColumn[] = [
  { field: 'name', header: '属性', rowHeader: true, minWidth: '160px' },
  { field: 'type', header: '类型', minWidth: '220px' },
  { field: 'default', header: '默认值', minWidth: '100px' },
  { field: 'description', header: '说明', minWidth: '300px' },
]
const rootRows = [
  {
    id: 'title',
    name: 'title',
    type: 'VNodeChild / title 插槽',
    default: '—',
    description: '横幅标题；未提供时必须在默认插槽中使用 Banner.Title。',
  },
  {
    id: 'description',
    name: 'description',
    type: 'VNodeChild / description 插槽',
    default: '—',
    description: '补充说明；支持 Link、实时播报区域等富内容。',
  },
  {
    id: 'variant',
    name: 'variant',
    type: "'critical' | 'info' | 'success' | 'upsell' | 'warning'",
    default: 'info',
    description: '语义状态与默认图标。',
  },
  {
    id: 'hideTitle',
    name: 'hideTitle',
    type: 'boolean',
    default: 'false',
    description: '视觉隐藏由 title 属性或插槽生成的标题，保留标题语义与可访问名称。',
  },
  {
    id: 'leadingVisual',
    name: 'leadingVisual',
    type: 'VNodeChild / leadingVisual 插槽',
    default: '状态图标',
    description: '自定义前置图形，仅 info 和 upsell 生效。',
  },
  {
    id: 'icon',
    name: 'icon',
    type: 'VNodeChild / icon 插槽',
    default: '—',
    description: '已弃用；请使用 leadingVisual，同时提供时 leadingVisual 优先。',
  },
  {
    id: 'onDismiss',
    name: 'onDismiss / @dismiss',
    type: '() => void',
    default: '—',
    description: '提供回调才显示关闭按钮；调用方更新状态并决定后续焦点。',
  },
  {
    id: 'primaryAction',
    name: 'primaryAction',
    type: 'VNodeChild / primaryAction 插槽',
    default: '—',
    description: '主操作内容，通常使用 Banner.PrimaryAction。',
  },
  {
    id: 'secondaryAction',
    name: 'secondaryAction',
    type: 'VNodeChild / secondaryAction 插槽',
    default: '—',
    description: '次操作内容，通常使用 Banner.SecondaryAction。',
  },
  {
    id: 'actionsLayout',
    name: 'actionsLayout',
    type: "'default' | 'inline' | 'stacked'",
    default: 'default',
    description: 'default 按横幅容器宽度布局；inline 在窄屏仍会堆叠；stacked 始终堆叠。',
  },
  {
    id: 'layout',
    name: 'layout',
    type: "'default' | 'compact'",
    default: 'default',
    description: 'compact 减少横幅内边距。',
  },
  {
    id: 'flush',
    name: 'flush',
    type: 'boolean',
    default: 'false',
    description: '移除左右边框和圆角，适合 Dialog、卡片、表格等受限容器。',
  },
  {
    id: 'aria-label',
    name: 'aria-label',
    type: 'string',
    default: '—',
    description: '覆盖区域名称；默认使用 aria-labelledby 关联标题。',
  },
  {
    id: 'aria-labelledby',
    name: 'aria-labelledby',
    type: 'string',
    default: '标题 ID',
    description: '自定义区域名称引用，优先级高于 aria-label。',
  },
  {
    id: 'className',
    name: 'className',
    type: 'string',
    default: '—',
    description: '与 Vue class 合并；其余 section 属性、样式和事件透传。',
  },
  {
    id: 'default',
    name: 'default 插槽',
    type: 'VNode',
    default: '—',
    description: '放置 Banner.Title、Banner.Description 或其他自定义正文。',
  },
  {
    id: 'ref',
    name: '组件 ref.element',
    type: 'HTMLElement | null',
    default: 'null',
    description: '根 section DOM，可调用 focus()；没有 show()、close() 等服务方法。',
  },
]
const childRows = [
  {
    id: 'Title',
    name: 'Banner.Title',
    type: 'as / className / heading 属性',
    default: 'as: h2',
    description:
      'as 支持 h2–h6，自动获取标题 ID；自定义 id 时需同时为 Banner 设置 aria-labelledby。',
  },
  {
    id: 'Description',
    name: 'Banner.Description',
    type: 'className / div 属性',
    default: 'div',
    description: '描述容器支持默认插槽、样式、原生属性与事件。',
  },
  {
    id: 'PrimaryAction',
    name: 'Banner.PrimaryAction',
    type: "Omit<ButtonProps, 'variant'>",
    default: 'Button variant: default',
    description:
      '复用 Button 的 as、size、disabled、loading、图形、原生事件和 ref.element；as="a" 可使用 href。',
  },
  {
    id: 'SecondaryAction',
    name: 'Banner.SecondaryAction',
    type: "Omit<ButtonProps, 'variant'>",
    default: 'Button variant: invisible',
    description: '与主操作拥有相同 Button 能力；各操作的 variant 由组件固定。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Banner 横幅提示"
      description="用于持续展示与当前页面或区域有关的重要信息，并提供后续操作。"
    />

    <ComponentDocsSection title="基础用法与状态">
      <template #description>
        Banner 在页面文档流中渲染。通过 title 提供必需的标题，description
        提供补充说明；由调用方控制显示时机和位置。
      </template>
      <ComponentDocsDemoBlock :code="basicCode">
        <div class="banner-demo-content">
          <Stack direction="vertical" gap="normal">
            <Banner
              v-for="variant in variants"
              :key="variant"
              :variant="variant"
              :title="`${variant} 状态`"
              description="这条信息会持续显示，直到调用方移除横幅。"
            />
          </Stack>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="组合标题、描述与操作">
      <template #description>
        默认插槽支持 Banner.Title 和 Banner.Description，标题可设置为 h2–h6。通过操作插槽组合 Button
        能力，描述中可以放置 Link。
      </template>
      <ComponentDocsDemoBlock :code="compoundCode">
        <div class="banner-demo-content">
          <Banner>
            <Banner.Title as="h3">启用双重验证</Banner.Title>
            <Banner.Description>
              请按 <Link inline href="https://docs.github.com/authentication">安全指南</Link>
              启用双重验证，保护你的账户。
            </Banner.Description>
            <template #primaryAction>
              <Banner.PrimaryAction @click="actionMessage = '已开始设置双重验证'"
                >立即启用</Banner.PrimaryAction
              >
            </template>
            <template #secondaryAction>
              <Banner.SecondaryAction as="a" href="https://docs.github.com/authentication">
                了解更多
              </Banner.SecondaryAction>
            </template>
          </Banner>
          <AriaStatus class="banner-demo-status">{{ actionMessage }}</AriaStatus>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="隐藏标题、紧凑布局与自定义图形">
      <template #description>
        hideTitle 保留可访问标题。leadingVisual 仅在 info 和 upsell
        状态生效，其他状态继续使用固定的语义图标。
      </template>
      <ComponentDocsDemoBlock :code="appearanceCode">
        <div class="banner-demo-content">
          <Stack direction="vertical" gap="normal">
            <Banner title="后台任务已完成" description="可以继续下一步操作。" hide-title />
            <Banner title="紧凑布局" description="减少横幅内边距。" layout="compact" />
            <Banner title="升级你的团队空间" variant="upsell">
              <template #leadingVisual><RocketIcon /></template>
              <template #description>
                升级套餐以获得更多空间和
                <Link inline href="https://github.com/pricing">团队功能</Link>。
              </template>
            </Banner>
          </Stack>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="操作布局与自定义操作">
      <template #description>
        default 按横幅自身容器宽度调整排列；inline 在窄屏也会堆叠。操作插槽支持 Banner
        操作子组件，也支持自定义 Button、链接或其他组件。
      </template>
      <ComponentDocsDemoBlock :code="actionsCode">
        <div class="banner-demo-content">
          <Stack direction="vertical" gap="normal">
            <Banner
              v-for="actionsLayout in actionsLayouts"
              :key="actionsLayout"
              :title="`${actionsLayout} 操作布局`"
              description="确认后将发布当前版本。"
              :actions-layout="actionsLayout"
            >
              <template #primaryAction>
                <Banner.PrimaryAction @click="actionMessage = `${actionsLayout}：已开始部署`"
                  >开始部署</Banner.PrimaryAction
                >
              </template>
              <template #secondaryAction>
                <Banner.SecondaryAction @click="actionMessage = `${actionsLayout}：正在查看变更`"
                  >查看变更</Banner.SecondaryAction
                >
              </template>
            </Banner>
            <Banner title="阅读部署指南" hide-title actions-layout="inline">
              <template #primaryAction>
                <Button as="a" href="https://docs.github.com" variant="link">查看指南</Button>
              </template>
            </Banner>
            <AriaStatus>{{ actionMessage }}</AriaStatus>
          </Stack>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="受控关闭与后续焦点">
      <template #description>
        提供 @dismiss 才显示关闭按钮。关闭回调负责移除横幅，并把焦点移至合适的后续位置。
      </template>
      <ComponentDocsDemoBlock :code="dismissCode">
        <div class="banner-demo-content">
          <Stack direction="vertical" gap="normal">
            <Banner v-if="dismissibleVisible" title="账户配置已更新" @dismiss="dismissBanner" />
            <h3 ref="nextHeading" tabindex="-1" class="banner-demo-heading">账户设置</h3>
            <Button v-if="!dismissibleVisible" @click="dismissibleVisible = true"
              >重新显示横幅</Button
            >
          </Stack>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="操作失败、焦点与实时播报">
      <template #description>
        操作触发错误后，调用方通过 ref.element 聚焦横幅，并在描述中提供 alert 播报。普通 Banner
        不会自行抢占焦点或自动播报。
      </template>
      <ComponentDocsDemoBlock :code="focusCode">
        <div class="banner-demo-content">
          <Stack direction="vertical" gap="normal">
            <Banner v-if="errorVisible" ref="errorBanner" title="更新失败" variant="critical">
              <template #description
                ><div role="alert">暂时无法更新资料，请稍后重试。</div></template
              >
            </Banner>
            <Button @click="updateProfile">更新资料</Button>
          </Stack>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="与 PageLayout 侧栏组合">
      <template #description>
        横幅可以直接放在 PageLayout.Pane 内，操作布局根据横幅容器宽度调整，适应宽屏页面中的窄侧栏。
      </template>
      <ComponentDocsDemoBlock :code="sidebarCode">
        <div class="banner-demo-content">
          <PageLayout padding="none">
            <PageLayout.Pane position="start" divider="line">
              <Banner title="团队安全提醒" description="请为所有成员启用双重验证。">
                <template #primaryAction
                  ><Banner.PrimaryAction @click="actionMessage = '正在查看成员'"
                    >查看成员</Banner.PrimaryAction
                  ></template
                >
                <template #secondaryAction
                  ><Banner.SecondaryAction @click="actionMessage = '稍后处理安全设置'"
                    >稍后处理</Banner.SecondaryAction
                  ></template
                >
              </Banner>
            </PageLayout.Pane>
            <PageLayout.Content><p>页面主体内容</p></PageLayout.Content>
          </PageLayout>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="与 Dialog 组合及 flush">
      <template #description>
        在 Dialog 内使用 flush，可移除横幅左右边框和圆角，与容器边缘衔接。横幅仍属于 Dialog
        的焦点范围。
      </template>
      <ComponentDocsDemoBlock :code="dialogCode">
        <div class="banner-demo-content">
          <Button @click="dialogOpen = true">打开部署设置</Button>
          <Dialog v-if="dialogOpen" title="部署设置" :on-close="() => (dialogOpen = false)">
            <Dialog.Body :style="{ padding: 0 }">
              <Banner
                title="部署前检查"
                description="请确认环境变量已经配置。"
                variant="warning"
                flush
              >
                <template #primaryAction>
                  <Banner.PrimaryAction @click="actionMessage = '已检查环境变量'"
                    >检查环境</Banner.PrimaryAction
                  >
                </template>
              </Banner>
              <div style="padding: var(--base-size-16, 1rem)">
                <p>部署设置内容</p>
                <AriaStatus>{{ actionMessage }}</AriaStatus>
              </div>
            </Dialog.Body>
          </Dialog>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="API" variant="api">
      <h3>Banner</h3>
      <p>
        富内容属性接受
        VNodeChild；同名插槽用于模板组合，并优先于对应属性。默认插槽位于标题和描述之后。
      </p>
      <VisuallyHidden :id="`${documentationId}-root-api`">Banner 属性与插槽</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-root-api`"
        :columns="apiColumns"
        :data="rootRows"
      />
      <h3>组合子组件</h3>
      <p>
        也可以独立导入 BannerTitle、BannerDescription、BannerPrimaryAction 和
        BannerSecondaryAction。
      </p>
      <VisuallyHidden :id="`${documentationId}-children-api`">Banner 子组件</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-children-api`"
        :columns="apiColumns"
        :data="childRows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.banner-demo-content {
  min-width: 0;
  width: 100%;
}

.banner-demo-heading {
  margin: 0;
}

.banner-demo-status {
  margin-top: 12px;
}
</style>
