<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Timeline 时间线"
      description="用于按时间顺序展示事件流的组合式组件。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        通过 <code>Timeline</code>、<code>Timeline.Item</code>、<code>Timeline.Badge</code> 和
        <code>Timeline.Body</code> 组合内容。
      </template>

      <ComponentDocsDemoBlock :code="basicDemoCode">
        <div class="timeline-demo">
          <Timeline>
            <Timeline.Item>
              <Timeline.Badge> 1 </Timeline.Badge>
              <Timeline.Body>
                <div class="timeline-title">需求评审</div>
                <div class="timeline-meta">2026-03-01 10:30</div>
                <div class="timeline-text">确认 Timeline 组件结构与文档范围。</div>
              </Timeline.Body>
            </Timeline.Item>
            <Timeline.Item>
              <Timeline.Badge> 2 </Timeline.Badge>
              <Timeline.Body>
                <div class="timeline-title">组件开发</div>
                <div class="timeline-meta">2026-03-02 16:20</div>
                <div class="timeline-text">完成时间轴主容器、节点和内容子组件。</div>
              </Timeline.Body>
            </Timeline.Item>
            <Timeline.Item>
              <Timeline.Badge> 3 </Timeline.Badge>
              <Timeline.Body>
                <div class="timeline-title">发布上线</div>
                <div class="timeline-meta">2026-03-04 09:15</div>
                <div class="timeline-text">在组件文档站补齐示例与 API 说明。</div>
              </Timeline.Body>
            </Timeline.Item>
          </Timeline>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="裁剪首尾边线">
      <template #description>
        设置
        <code>clip-sidebar</code> 后，会去掉首项和末项在时间轴上的外侧留白，适合在卡片内紧凑展示。
      </template>

      <ComponentDocsDemoBlock :code="clipSidebarDemoCode">
        <div class="timeline-grid">
          <div class="timeline-panel">
            <div class="timeline-label">默认</div>
            <Timeline>
              <Timeline.Item>
                <Timeline.Badge> 1 </Timeline.Badge>
                <Timeline.Body>
                  <div class="timeline-title">需求评审</div>
                  <div class="timeline-meta">2026-03-01 10:30</div>
                </Timeline.Body>
              </Timeline.Item>
              <Timeline.Item>
                <Timeline.Badge> 2 </Timeline.Badge>
                <Timeline.Body>
                  <div class="timeline-title">组件开发</div>
                  <div class="timeline-meta">2026-03-02 16:20</div>
                </Timeline.Body>
              </Timeline.Item>
              <Timeline.Item>
                <Timeline.Badge> 3 </Timeline.Badge>
                <Timeline.Body>
                  <div class="timeline-title">发布上线</div>
                  <div class="timeline-meta">2026-03-04 09:15</div>
                </Timeline.Body>
              </Timeline.Item>
            </Timeline>
          </div>

          <div class="timeline-panel">
            <div class="timeline-label">clip-sidebar</div>
            <Timeline clip-sidebar>
              <Timeline.Item>
                <Timeline.Badge> 1 </Timeline.Badge>
                <Timeline.Body>
                  <div class="timeline-title">需求评审</div>
                  <div class="timeline-meta">2026-03-01 10:30</div>
                </Timeline.Body>
              </Timeline.Item>
              <Timeline.Item>
                <Timeline.Badge> 2 </Timeline.Badge>
                <Timeline.Body>
                  <div class="timeline-title">组件开发</div>
                  <div class="timeline-meta">2026-03-02 16:20</div>
                </Timeline.Body>
              </Timeline.Item>
              <Timeline.Item>
                <Timeline.Badge> 3 </Timeline.Badge>
                <Timeline.Body>
                  <div class="timeline-title">发布上线</div>
                  <div class="timeline-meta">2026-03-04 09:15</div>
                </Timeline.Body>
              </Timeline.Item>
            </Timeline>
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="头像、操作与响应式组合">
      <template #description>
        Avatar 放置侧栏头像，Actions 放置操作按钮。Timeline 自身宽度小于 480px
        时，操作区移到正文下方；
        头像需要调用方预留左侧空间。可以切换列表语义、紧凑节点和容器宽度查看组合效果。
      </template>
      <ComponentDocsDemoBlock :code="compositionCode">
        <div class="timeline-composition-demo">
          <div class="timeline-controls">
            <Button size="small" @click="narrow = !narrow">{{
              narrow ? '使用宽容器' : '使用窄容器'
            }}</Button>
            <Button size="small" @click="listEnabled = !listEnabled">{{
              listEnabled ? '关闭列表语义' : '启用列表语义'
            }}</Button>
            <Button size="small" @click="condensed = !condensed">{{
              condensed ? '使用普通节点' : '使用紧凑节点'
            }}</Button>
          </div>
          <div class="timeline-composition" :style="{ width: narrow ? '400px' : '720px' }">
            <FeatureFlags :flags="{ primer_react_timeline_list_semantics: listEnabled }">
              <Timeline clip-sidebar="both" data-testid="composed-timeline">
                <Timeline.Item :condensed="condensed">
                  <Timeline.Avatar
                    ><Avatar :size="40" alt="Monalisa" placeholder="M"
                  /></Timeline.Avatar>
                  <Timeline.Badge variant="done"
                    ><GitMergeIcon aria-label="已合并"
                  /></Timeline.Badge>
                  <Timeline.Body>
                    <Link href="#timeline-actor" muted>Monalisa</Link> 将变更合并到
                    <BranchName href="#timeline-main">main</BranchName>
                    <div class="timeline-meta">
                      <RelativeTime datetime="2026-10-17T00:00:00Z" /> · <Label>已验证</Label>
                    </div>
                  </Timeline.Body>
                  <Timeline.Actions>
                    <Button size="small" @click="actionCount++">查看详情</Button>
                    <Button size="small" @click="actionCount++">撤销</Button>
                  </Timeline.Actions>
                </Timeline.Item>
                <Timeline.Break title="事件分隔" />
                <Timeline.Item :condensed="condensed">
                  <Timeline.Badge><GitCommitIcon aria-label="提交" /></Timeline.Badge>
                  <Timeline.Body>后续事件保留原生链接和按钮交互。</Timeline.Body>
                </Timeline.Item>
              </Timeline>
            </FeatureFlags>
          </div>
          <p role="status">已执行 {{ actionCount }} 次操作</p>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="徽标颜色变体">
      <ComponentDocsDemoBlock :code="variantCode">
        <Timeline class="timeline-demo">
          <Timeline.Item v-for="variant in badgeVariants" :key="variant">
            <Timeline.Badge :variant="variant"><GitCommitIcon /></Timeline.Badge>
            <Timeline.Body>{{ variant }}</Timeline.Body>
          </Timeline.Item>
        </Timeline>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="API" variant="api">
      <h3>Timeline</h3>
      <VisuallyHidden :id="`${documentationId}-api-table-0`"
        >Timeline 时间线 Timeline</VisuallyHidden
      >
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-0`"
        :columns="apiTableColumns"
        :data="apiTableRows"
      />

      <h3>子组件</h3>
      <VisuallyHidden :id="`${documentationId}-api-table-1`">Timeline 时间线 子组件</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-1`"
        :columns="subComponentColumns"
        :data="subComponentRows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { ref, useId as useDocumentationId } from 'vue'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'

import { Timeline, type TimelineBadgeVariant } from '@/components/primer-vue/Timeline'
import { FeatureFlags } from '@/components/primer-vue/FeatureFlags'
import { Avatar } from '@/components/primer-vue/Avatar'
import { Button } from '@/components/primer-vue/Button'
import { Link } from '@/components/primer-vue/Link'
import { BranchName } from '@/components/primer-vue/BranchName'
import { RelativeTime } from '@/components/primer-vue/RelativeTime'
import { Label } from '@/components/primer-vue/Label'
import { GitCommitIcon, GitMergeIcon } from '@onlikee/octicons-vue'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const documentationId = useDocumentationId()
const narrow = ref(false)
const listEnabled = ref(false)
const condensed = ref(false)
const actionCount = ref(0)
const badgeVariants: TimelineBadgeVariant[] = [
  'accent',
  'success',
  'attention',
  'severe',
  'danger',
  'done',
  'open',
  'closed',
  'sponsors',
]
const compositionCode = `<script setup lang="ts">
import { Timeline } from '@/components/primer-vue/Timeline'
import { Avatar } from '@/components/primer-vue/Avatar'
import { Button } from '@/components/primer-vue/Button'
import { Link } from '@/components/primer-vue/Link'
import { BranchName } from '@/components/primer-vue/BranchName'
import { RelativeTime } from '@/components/primer-vue/RelativeTime'
import { GitMergeIcon } from '@onlikee/octicons-vue'
<\/script>

<template>
  <div style="padding-left: 72px">
    <Timeline clip-sidebar="both">
      <Timeline.Item>
        <Timeline.Avatar><Avatar :size="40" alt="Monalisa" placeholder="M" /></Timeline.Avatar>
        <Timeline.Badge variant="done"><GitMergeIcon /></Timeline.Badge>
        <Timeline.Body>
          <Link href="#actor">Monalisa</Link> 合并到 <BranchName>main</BranchName>
          <RelativeTime datetime="2026-10-17T00:00:00Z" />
        </Timeline.Body>
        <Timeline.Actions><Button size="small">查看详情</Button></Timeline.Actions>
      </Timeline.Item>
      <Timeline.Break />
      <Timeline.Item condensed><Timeline.Body>后续事件</Timeline.Body></Timeline.Item>
    </Timeline>
  </div>
</template>`
const variantCode = `<Timeline>
  <Timeline.Item>
    <Timeline.Badge variant="done"><GitMergeIcon /></Timeline.Badge>
    <Timeline.Body>已合并</Timeline.Body>
  </Timeline.Item>
</Timeline>`

const basicDemoCode = `<template>
  <Timeline>
    <Timeline.Item>
      <Timeline.Badge>1</Timeline.Badge>
      <Timeline.Body>
        <div class="timeline-title">需求评审</div>
        <div class="timeline-meta">2026-03-01 10:30</div>
        <div class="timeline-text">确认 Timeline 组件结构与文档范围。</div>
      </Timeline.Body>
    </Timeline.Item>
    <Timeline.Item>
      <Timeline.Badge>2</Timeline.Badge>
      <Timeline.Body>
        <div class="timeline-title">组件开发</div>
        <div class="timeline-meta">2026-03-02 16:20</div>
        <div class="timeline-text">完成时间轴主容器、节点和内容子组件。</div>
      </Timeline.Body>
    </Timeline.Item>
    <Timeline.Item>
      <Timeline.Badge>3</Timeline.Badge>
      <Timeline.Body>
        <div class="timeline-title">发布上线</div>
        <div class="timeline-meta">2026-03-04 09:15</div>
        <div class="timeline-text">在组件文档站补齐示例与 API 说明。</div>
      </Timeline.Body>
    </Timeline.Item>
  </Timeline>
</template>

<script setup lang="ts">
import { Timeline } from '@/components/primer-vue/Timeline'
<\/script>`

const clipSidebarDemoCode = `<template>
  <Timeline clip-sidebar>
    <Timeline.Item>
      <Timeline.Badge>1</Timeline.Badge>
      <Timeline.Body>
        <div class="timeline-title">需求评审</div>
        <div class="timeline-meta">2026-03-01 10:30</div>
      </Timeline.Body>
    </Timeline.Item>
    <Timeline.Item>
      <Timeline.Badge>2</Timeline.Badge>
      <Timeline.Body>
        <div class="timeline-title">组件开发</div>
        <div class="timeline-meta">2026-03-02 16:20</div>
      </Timeline.Body>
    </Timeline.Item>
    <Timeline.Item>
      <Timeline.Badge>3</Timeline.Badge>
      <Timeline.Body>
        <div class="timeline-title">发布上线</div>
        <div class="timeline-meta">2026-03-04 09:15</div>
      </Timeline.Body>
    </Timeline.Item>
  </Timeline>
</template>

<script setup lang="ts">
import { Timeline } from '@/components/primer-vue/Timeline'
<\/script>`

const apiTableColumns: DocumentationColumn[] = [
  { field: 'name', header: '属性名', rowHeader: true, minWidth: '180px' },
  { field: 'default', header: '默认值', minWidth: '120px' },
  { field: 'type', header: '类型', minWidth: '200px' },
  { field: 'options', header: '可选值', minWidth: '160px' },
  { field: 'description', header: '说明', minWidth: '280px' },
]

const apiTableRows = [
  {
    id: 'clip-sidebar',
    name: 'clip-sidebar',
    description: '裁剪首项、末项或两端边线留白；true 等价于 both。',
    type: "boolean | 'start' | 'end' | 'both'",
    options: 'true / false / start / end / both',
    default: 'false',
  },
  {
    id: 'className',
    name: 'className',
    type: 'string',
    default: '-',
    options: '-',
    description: '追加类名；各组件也支持原生 class、style、属性和事件。',
  },
  {
    id: 'list-semantics',
    name: 'FeatureFlags: primer_react_timeline_list_semantics',
    type: 'boolean',
    default: 'false',
    options: 'true / false',
    description: '启用时使用 ol role=list 与 li；Break 为 li role=presentation。',
  },
]

const subComponentColumns: DocumentationColumn[] = [
  { field: 'name', header: '子组件', rowHeader: true, minWidth: '180px' },
  { field: 'description', header: '说明', minWidth: '320px' },
  { field: 'slot', header: '插槽', minWidth: '180px' },
]

const subComponentRows = [
  {
    id: 'Timeline.Item',
    name: 'Timeline.Item',
    description: '单个时间节点，支持 condensed: boolean；可组合 Avatar、Badge、Body、Actions。',
    slot: 'default',
  },
  {
    id: 'Timeline.Badge',
    name: 'Timeline.Badge',
    description:
      '徽标支持 variant: accent / success / attention / severe / danger / done / open / closed / sponsors；属性传给内层徽标。',
    slot: 'default',
  },
  {
    id: 'Timeline.Avatar',
    name: 'Timeline.Avatar',
    description: '左侧头像容器，与普通/紧凑徽标垂直对齐；由调用方预留侧栏空间。',
    slot: 'default',
  },
  {
    id: 'Timeline.Actions',
    name: 'Timeline.Actions',
    description: '右侧操作区，Timeline 容器小于 480px 时换行到 Body 下方。',
    slot: 'default',
  },
  {
    id: 'Timeline.Break',
    name: 'Timeline.Break',
    description: '事件分隔线；与后续 condensed 节点协调间距。',
    slot: 'default',
  },
  {
    id: 'Timeline.Body',
    name: 'Timeline.Body',
    description: '时间节点右侧内容区域，用于展示标题、时间与描述',
    slot: 'default',
  },
]
</script>

<style scoped>
.timeline-composition-demo {
  width: 100%;
}
.timeline-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}
.timeline-composition {
  max-width: 100%;
  padding-left: 72px;
}
.timeline-demo {
  width: min(100%, 680px);
}

.timeline-grid {
  display: grid;
  gap: 1rem;
}

.timeline-panel {
  border: 1px solid var(--borderColor-default);
  border-radius: 8px;
  padding: 1rem;
}

.timeline-label {
  font-size: 0.8125rem;
  color: var(--fgColor-muted);
  margin-bottom: 0.5rem;
}

.timeline-title {
  color: var(--fgColor-default);
  font-weight: 600;
  line-height: 1.4;
}

.timeline-meta {
  color: var(--fgColor-muted);
  font-size: 0.8125rem;
  margin-top: 0.25rem;
}

.timeline-text {
  margin-top: 0.5rem;
  line-height: 1.6;
}

@media (min-width: 920px) {
  .timeline-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
