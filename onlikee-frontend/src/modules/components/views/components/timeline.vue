<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Timeline 时间线"
      description="用于按时间顺序展示事件流的组合式组件。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        通过 <code>Timeline</code>、<code>Timeline.Item</code>、<code>Timeline.Badge</code> 和 <code>Timeline.Body</code> 组合内容。
      </template>

      <ComponentDocsDemoBlock :code="basicDemoCode">
        <div class="timeline-demo">
          <Timeline>
            <Timeline.Item>
              <Timeline.Badge>
                1
              </Timeline.Badge>
              <Timeline.Body>
                <div class="timeline-title">
                  需求评审
                </div>
                <div class="timeline-meta">
                  2026-03-01 10:30
                </div>
                <div class="timeline-text">
                  确认 Timeline 组件结构与文档范围。
                </div>
              </Timeline.Body>
            </Timeline.Item>
            <Timeline.Item>
              <Timeline.Badge>
                2
              </Timeline.Badge>
              <Timeline.Body>
                <div class="timeline-title">
                  组件开发
                </div>
                <div class="timeline-meta">
                  2026-03-02 16:20
                </div>
                <div class="timeline-text">
                  完成时间轴主容器、节点和内容子组件。
                </div>
              </Timeline.Body>
            </Timeline.Item>
            <Timeline.Item>
              <Timeline.Badge>
                3
              </Timeline.Badge>
              <Timeline.Body>
                <div class="timeline-title">
                  发布上线
                </div>
                <div class="timeline-meta">
                  2026-03-04 09:15
                </div>
                <div class="timeline-text">
                  在组件文档站补齐示例与 API 说明。
                </div>
              </Timeline.Body>
            </Timeline.Item>
          </Timeline>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="裁剪首尾边线">
      <template #description>
        设置 <code>clip-sidebar</code> 后，会去掉首项和末项在时间轴上的外侧留白，适合在卡片内紧凑展示。
      </template>

      <ComponentDocsDemoBlock :code="clipSidebarDemoCode">
        <div class="timeline-grid">
          <div class="timeline-panel">
            <div class="timeline-label">
              默认
            </div>
            <Timeline>
              <Timeline.Item>
                <Timeline.Badge>
                  1
                </Timeline.Badge>
                <Timeline.Body>
                  <div class="timeline-title">
                    需求评审
                  </div>
                  <div class="timeline-meta">
                    2026-03-01 10:30
                  </div>
                </Timeline.Body>
              </Timeline.Item>
              <Timeline.Item>
                <Timeline.Badge>
                  2
                </Timeline.Badge>
                <Timeline.Body>
                  <div class="timeline-title">
                    组件开发
                  </div>
                  <div class="timeline-meta">
                    2026-03-02 16:20
                  </div>
                </Timeline.Body>
              </Timeline.Item>
              <Timeline.Item>
                <Timeline.Badge>
                  3
                </Timeline.Badge>
                <Timeline.Body>
                  <div class="timeline-title">
                    发布上线
                  </div>
                  <div class="timeline-meta">
                    2026-03-04 09:15
                  </div>
                </Timeline.Body>
              </Timeline.Item>
            </Timeline>
          </div>

          <div class="timeline-panel">
            <div class="timeline-label">
              clip-sidebar
            </div>
            <Timeline clip-sidebar>
              <Timeline.Item>
                <Timeline.Badge>
                  1
                </Timeline.Badge>
                <Timeline.Body>
                  <div class="timeline-title">
                    需求评审
                  </div>
                  <div class="timeline-meta">
                    2026-03-01 10:30
                  </div>
                </Timeline.Body>
              </Timeline.Item>
              <Timeline.Item>
                <Timeline.Badge>
                  2
                </Timeline.Badge>
                <Timeline.Body>
                  <div class="timeline-title">
                    组件开发
                  </div>
                  <div class="timeline-meta">
                    2026-03-02 16:20
                  </div>
                </Timeline.Body>
              </Timeline.Item>
              <Timeline.Item>
                <Timeline.Badge>
                  3
                </Timeline.Badge>
                <Timeline.Body>
                  <div class="timeline-title">
                    发布上线
                  </div>
                  <div class="timeline-meta">
                    2026-03-04 09:15
                  </div>
                </Timeline.Body>
              </Timeline.Item>
            </Timeline>
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection
      title="API"
      variant="api"
    >
      <h3>Timeline</h3>
      <Table
        :columns="apiTableColumns"
        :data="apiTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h3>子组件</h3>
      <Table
        :columns="subComponentColumns"
        :data="subComponentRows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { Timeline } from '@/components/primer-vue/Timeline'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

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

const apiTableColumns: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '180px' },
  { key: 'default', label: '默认值', minWidth: '120px' },
  { key: 'type', label: '类型', minWidth: '200px', wrap: true },
  { key: 'options', label: '可选值', minWidth: '160px', wrap: true },
  { key: 'description', label: '说明', minWidth: '280px', wrap: true }
]

const apiTableRows = [
  {
    name: 'clip-sidebar',
    description: '是否裁剪首项和末项在时间轴上的上下留白',
    type: 'boolean',
    options: 'true / false',
    default: 'false'
  }
]

const subComponentColumns: TableColumn[] = [
  { key: 'name', label: '子组件', rowHeader: true, minWidth: '180px' },
  { key: 'description', label: '说明', minWidth: '320px', wrap: true },
  { key: 'slot', label: '插槽', minWidth: '180px' }
]

const subComponentRows = [
  {
    name: 'Timeline.Item',
    description: '单个时间节点容器，通常包裹 Badge 与 Body',
    slot: 'default'
  },
  {
    name: 'Timeline.Badge',
    description: '时间节点左侧徽标区域，可放数字、图标或状态点',
    slot: 'default'
  },
  {
    name: 'Timeline.Body',
    description: '时间节点右侧内容区域，用于展示标题、时间与描述',
    slot: 'default'
  }
]
</script>

<style scoped>
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
