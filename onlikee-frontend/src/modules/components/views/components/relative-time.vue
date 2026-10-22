<script setup lang="ts">
import { shallowRef, useId } from 'vue'
import {
  RelativeTime,
  type RelativeTimeInstance,
  type RelativeTimeOptions,
} from '@/components/primer-vue/RelativeTime'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'
import ComponentDocsTable, {
  type DocumentationColumn,
  type DocumentationRow,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsDemoBlock from '../../components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '../../components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '../../components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '../../components/ComponentDocsPage/ComponentDocsSection.vue'

const documentationId = useId()
const now = Date.now()
const recentDate = new Date(now - 3 * 60 * 1000)
const durationDate = new Date(now - (26 * 60 * 60 + 12 * 60 + 40) * 1000)
const futureDate = new Date(now + 90 * 60 * 1000)
const distantDate = new Date(now - 45 * 24 * 60 * 60 * 1000)
const fixedDatetime = '2024-03-07T00:30:00.000Z'
const formats = ['relative', 'datetime', 'duration'] as const
const styles = ['long', 'short', 'narrow'] as const
const tenses = ['auto', 'past', 'future'] as const
const time = shallowRef<RelativeTimeInstance | null>(null)
const lastText = shallowRef('等待首次更新')
const handleUpdated: NonNullable<RelativeTimeOptions['onRelativeTimeUpdated']> = (event) => {
  lastText.value = event.newText
}

async function refreshTime() {
  await customElements.whenDefined('relative-time')
  time.value?.update()
}

const codes = {
  basic: `<script setup lang="ts">
import { RelativeTime } from '@/components/primer-vue/RelativeTime'

const date = new Date(Date.now() - 3 * 60 * 1000)
<\/script>

<template>
  <RelativeTime :date="date" lang="zh-CN" />
  <RelativeTime datetime="2024-03-07T00:30:00.000Z" lang="zh-CN" prefix="" />
</template>`,
  formats: `<RelativeTime :date="date" format="relative" lang="zh-CN" />
<RelativeTime :date="date" format="datetime" lang="zh-CN" />
<RelativeTime :date="date" format="duration" lang="zh-CN" />`,
  duration: `<RelativeTime :date="date" format="duration" format-style="long" precision="minute" lang="en" />
<RelativeTime :date="date" format="duration" format-style="short" precision="minute" lang="en" />
<RelativeTime :date="date" format="duration" format-style="narrow" precision="minute" lang="en" />`,
  tense: `<RelativeTime :date="futureDate" format="relative" tense="auto" lang="zh-CN" />
<RelativeTime :date="futureDate" format="relative" tense="past" lang="zh-CN" />
<RelativeTime :date="futureDate" format="relative" tense="future" lang="zh-CN" />`,
  threshold: `<RelativeTime :date="distantDate" format="relative" threshold="P7D" prefix="" lang="zh-CN" />
<RelativeTime :date="distantDate" format="relative" threshold="P1Y" prefix="" lang="zh-CN" />`,
  locale: `<RelativeTime
  datetime="2024-03-07T00:30:00.000Z"
  format="datetime"
  lang="zh-CN"
  time-zone="Asia/Shanghai"
  year="numeric"
  month="long"
  day="numeric"
  hour="2-digit"
  minute="2-digit"
  time-zone-name="short"
/>
<RelativeTime
  datetime="2024-03-07T00:30:00.000Z"
  format="datetime"
  lang="en"
  time-zone="UTC"
  year="numeric"
  month="long"
  day="numeric"
  hour="2-digit"
  minute="2-digit"
  time-zone-name="short"
/>`,
  updates: `<script setup lang="ts">
import { shallowRef } from 'vue'
import {
  RelativeTime,
  type RelativeTimeInstance,
  type RelativeTimeOptions,
} from '@/components/primer-vue/RelativeTime'

const date = new Date(Date.now() - 3 * 60 * 1000)
const time = shallowRef<RelativeTimeInstance | null>(null)
const lastText = shallowRef('等待首次更新')
const handleUpdated: NonNullable<RelativeTimeOptions['onRelativeTimeUpdated']> = (event) => {
  lastText.value = event.newText
}

async function refreshTime() {
  await customElements.whenDefined('relative-time')
  time.value?.update()
}
<\/script>

<template>
  <RelativeTime ref="time" :date="date" format="relative" lang="zh-CN" :on-relative-time-updated="handleUpdated" />
  <button type="button" @click="refreshTime">手动刷新</button>
  <p>最近一次更新文本：{{ lastText }}</p>
</template>`,
  fallback: `<RelativeTime datetime="2024-03-07T00:30:00.000Z" format="datetime" lang="zh-CN" no-title>
  2024 年 3 月 7 日
</RelativeTime>`,
}

const columns: DocumentationColumn[] = [
  { field: 'name', header: '名称', rowHeader: true },
  { field: 'type', header: '类型' },
  { field: 'default', header: '默认值' },
  { field: 'description', header: '说明' },
]
const rows: DocumentationRow[] = [
  {
    id: 'date',
    name: 'date',
    type: 'Date | null',
    default: 'undefined',
    description: '有效的时间对象；设为 null 且未提供非空 datetime 时清空时间输入。',
  },
  {
    id: 'datetime',
    name: 'datetime',
    type: 'string',
    default: 'undefined',
    description:
      'ISO 8601 时间字符串；非空时优先于 date，并转换为 UTC ISO 时间戳。建议包含 Z 或时区偏移。',
  },
  {
    id: 'format',
    name: 'format',
    type: "'datetime' | 'relative' | 'duration' | 'auto' | 'micro' | 'elapsed'",
    default: 'auto',
    description: '展示格式；auto 等同 relative。micro、elapsed 为兼容旧接口保留。',
  },
  {
    id: 'formatStyle',
    name: 'formatStyle',
    type: "'long' | 'short' | 'narrow'",
    default: '随 format 决定',
    description: 'datetime 默认 short；micro / elapsed 默认 narrow；其他格式默认 long。',
  },
  {
    id: 'tense',
    name: 'tense',
    type: "'auto' | 'past' | 'future'",
    default: 'auto',
    description: '限制相对时间或时长的方向；相反方向显示“现在”或零时长。datetime 模式忽略此项。',
  },
  {
    id: 'precision',
    name: 'precision',
    type: "'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'",
    default: 'second（micro 为 minute）',
    description: '相对时间和时长的最小显示单位；datetime 模式忽略此项。',
  },
  {
    id: 'threshold',
    name: 'threshold',
    type: 'string',
    default: 'P30D',
    description:
      'ISO 8601 时长，如 P7D、PT1H。relative / auto 且 tense 为 auto 时，超出阈值改为绝对日期。',
  },
  {
    id: 'prefix',
    name: 'prefix',
    type: 'string',
    default: "datetime 为 ''；其他为 'on'",
    description: '绝对日期前的文字；设为空字符串可移除。不会随 lang 自动翻译。',
  },
  {
    id: 'hour-minute-second',
    name: 'hour / minute / second',
    type: "'numeric' | '2-digit'",
    default: 'undefined',
    description: '绝对日期中的时、分、秒格式。',
  },
  {
    id: 'weekday',
    name: 'weekday',
    type: "'long' | 'short' | 'narrow'",
    default: '随 format 决定',
    description: 'datetime 模式默认与 formatStyle 相同；其他格式默认不显示星期。',
  },
  {
    id: 'day',
    name: 'day',
    type: "'numeric' | '2-digit'",
    default: 'numeric',
    description: '绝对日期中的日格式。',
  },
  {
    id: 'month',
    name: 'month',
    type: "'numeric' | '2-digit' | 'long' | 'short' | 'narrow'",
    default: '随 format 决定',
    description: 'datetime 模式默认与 formatStyle 相同；其他格式默认 short。',
  },
  {
    id: 'year',
    name: 'year',
    type: "'numeric' | '2-digit'",
    default: '跨 UTC 年为 numeric；同年省略',
    description: '绝对日期中的年格式；显式设置可始终显示年份。',
  },
  {
    id: 'timeZone',
    name: 'timeZone',
    type: 'string',
    default: '继承祖先设置或浏览器时区',
    description: '绝对日期与 title 使用的 IANA 时区，如 Asia/Shanghai、UTC。',
  },
  {
    id: 'timeZoneName',
    name: 'timeZoneName',
    type: "'long' | 'short' | 'shortOffset' | 'longOffset' | 'shortGeneric' | 'longGeneric'",
    default: 'undefined',
    description: '绝对日期中的时区名称格式。',
  },
  {
    id: 'noTitle',
    name: 'noTitle',
    type: 'boolean',
    default: 'false',
    description: '不自动生成 title 属性；需要可访问提示时可配合其他提示组件。',
  },
  {
    id: 'className',
    name: 'className',
    type: 'string',
    default: '—',
    description: '根元素的附加样式类，与 Vue class 合并。',
  },
  {
    id: 'onRelativeTimeUpdated',
    name: 'onRelativeTimeUpdated',
    type: '((event: RelativeTimeUpdatedEvent) => void) | null',
    default: '—',
    description: '底层元素的文本或 title 变化时调用，事件字段见下表。',
  },
  {
    id: 'lang',
    name: 'lang（原生属性）',
    type: 'string',
    default: '继承祖先 lang 或环境语言',
    description: '指定本地化语言，如 zh-CN、en；通过原生属性透传。',
  },
]
const eventRows: DocumentationRow[] = [
  {
    id: 'relative-time-updated',
    name: 'relative-time-updated',
    type: 'RelativeTimeUpdatedEvent',
    default: '—',
    description: '原生 DOM 事件；通过 onRelativeTimeUpdated 回调接收，不是 Vue 自定义 emit。',
  },
  {
    id: 'oldText-newText',
    name: 'oldText / newText',
    type: 'string',
    default: '—',
    description: '更新前后的展示文本，直接从事件对象读取，不在 event.detail 中。',
  },
  {
    id: 'oldTitle-newTitle',
    name: 'oldTitle / newTitle',
    type: 'string',
    default: '—',
    description: '更新前后的 title 文本，直接从事件对象读取。',
  },
]
const instanceRows: DocumentationRow[] = [
  {
    id: 'element',
    name: 'element',
    type: 'RelativeTimeElement | null',
    default: 'null',
    description: '底层 relative-time 元素，挂载前为 null。',
  },
  {
    id: 'update',
    name: 'update()',
    type: '() => void | undefined',
    default: '—',
    description:
      '手动重算展示内容。首次调用前等待 customElements.whenDefined；通常由底层自动更新，无需轮询。',
  },
]
const slotRows: DocumentationRow[] = [
  {
    id: 'default',
    name: 'default',
    type: '—',
    default: 'UTC 英文日期或空文本',
    description: '自定义元素升级前的初始内容；升级后由底层格式化结果接管，无插槽参数。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="RelativeTime 相对时间"
      description="将时间戳显示为本地化日期、相对时间或时长，并在浏览器中自动更新。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        传入 Date 对象或 ISO 8601 datetime 字符串。两者同时传入时，非空 datetime 优先。 默认格式为
        auto，与 relative 相同；实际文案随当前时间变化。
      </template>
      <ComponentDocsDemoBlock :code="codes.basic">
        <div class="demo-stack">
          <div class="demo-row">
            <span class="demo-label">Date 对象</span
            ><RelativeTime :date="recentDate" lang="zh-CN" />
          </div>
          <div class="demo-row">
            <span class="demo-label">ISO 字符串</span
            ><RelativeTime :datetime="fixedDatetime" lang="zh-CN" prefix="" />
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="展示格式">
      <template #description>
        relative 显示“多久之前”或“多久之后”，超出 threshold 时改为日期；datetime 始终显示绝对日期；
        duration 显示相隔的多个时间单位。以下示例使用同一个时间点。
      </template>
      <ComponentDocsDemoBlock :code="codes.formats">
        <div class="demo-stack">
          <div v-for="format in formats" :key="format" class="demo-row">
            <span class="demo-label">{{ format }}</span>
            <RelativeTime :date="durationDate" :format="format" lang="zh-CN" />
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="时长样式与精度">
      <template #description>
        formatStyle 控制单位名称的长度，precision 控制最小显示单位。以下示例使用英文便于比较样式，
        precision="minute" 会省略秒；datetime 的时分秒由 hour、minute、second 分别设置。
      </template>
      <ComponentDocsDemoBlock :code="codes.duration">
        <div class="demo-stack">
          <div v-for="style in styles" :key="style" class="demo-row">
            <span class="demo-label">{{ style }}</span>
            <RelativeTime
              :date="durationDate"
              format="duration"
              :format-style="style"
              precision="minute"
              lang="en"
            />
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="限制时间方向">
      <template #description>
        tense="past" 将未来时间限制为“现在”，tense="future"
        将过去时间限制为“现在”；时长格式中则为零时长。 以下示例传入约 90 分钟后的时间。
      </template>
      <ComponentDocsDemoBlock :code="codes.tense">
        <div class="demo-stack">
          <div v-for="tense in tenses" :key="tense" class="demo-row">
            <span class="demo-label">{{ tense }}</span>
            <RelativeTime :date="futureDate" format="relative" :tense="tense" lang="zh-CN" />
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="日期切换阈值与前缀">
      <template #description>
        threshold 使用 ISO 8601 时长，默认 P30D（30 天）。以下时间约为 45 天前，分别设置 7 天与 1
        年阈值。 threshold 在 relative / auto 且 tense="auto" 时生效。prefix=""
        移除绝对日期前默认的英文 on。
      </template>
      <ComponentDocsDemoBlock :code="codes.threshold">
        <div class="demo-stack">
          <div class="demo-row">
            <span class="demo-label">P7D</span
            ><RelativeTime
              :date="distantDate"
              format="relative"
              threshold="P7D"
              prefix=""
              lang="zh-CN"
            />
          </div>
          <div class="demo-row">
            <span class="demo-label">P1Y</span
            ><RelativeTime
              :date="distantDate"
              format="relative"
              threshold="P1Y"
              prefix=""
              lang="zh-CN"
            />
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="语言与时区">
      <template #description>
        lang 控制语言，timeZone 控制绝对日期与 title 的时区，不改变时间戳本身。
        以下两个结果表示同一时刻，分别使用上海时区和 UTC。具体格式由浏览器的 Intl 实现决定。
      </template>
      <ComponentDocsDemoBlock :code="codes.locale">
        <div class="demo-stack">
          <div class="demo-row">
            <span class="demo-label">中文 · 上海</span
            ><RelativeTime
              :datetime="fixedDatetime"
              format="datetime"
              lang="zh-CN"
              time-zone="Asia/Shanghai"
              year="numeric"
              month="long"
              day="numeric"
              hour="2-digit"
              minute="2-digit"
              time-zone-name="short"
            />
          </div>
          <div class="demo-row">
            <span class="demo-label">English · UTC</span
            ><RelativeTime
              :datetime="fixedDatetime"
              format="datetime"
              lang="en"
              time-zone="UTC"
              year="numeric"
              month="long"
              day="numeric"
              hour="2-digit"
              minute="2-digit"
              time-zone-name="short"
            />
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="更新回调与手动刷新">
      <template #description>
        底层元素会自动更新，通常无需额外定时器。文本或 title 发生变化时，onRelativeTimeUpdated
        接收原生事件。 update()
        可手动刷新；如果结果未变化，不会再次触发回调。首次调用前需等待自定义元素注册完成。
      </template>
      <ComponentDocsDemoBlock :code="codes.updates">
        <div class="demo-stack">
          <RelativeTime
            ref="time"
            :date="recentDate"
            format="relative"
            lang="zh-CN"
            :on-relative-time-updated="handleUpdated"
          />
          <button type="button" @click="refreshTime">手动刷新</button>
          <p class="update-text">最近一次更新文本：{{ lastText }}</p>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="初始内容与提示">
      <template #description>
        组件挂载后加载底层自定义元素。升级前使用默认插槽，未提供插槽时使用 UTC
        英文日期；空模板插槽也回退到该日期，没有时间输入时为空。
        服务端渲染也使用这份初始内容。插槽是初始占位文本，升级后展示内容由底层元素格式化。 noTitle
        可关闭自动生成的 title，完整日期等重要信息应以可见文字或可访问提示提供。
      </template>
      <ComponentDocsDemoBlock :code="codes.fallback">
        <RelativeTime :datetime="fixedDatetime" format="datetime" lang="zh-CN" no-title
          >2024 年 3 月 7 日</RelativeTime
        >
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="属性" variant="api">
      <template #description>
        下表列出当前底层元素的有效默认值，Vue 封装会将已设置的选项透传为属性。
        class、style、lang、aria-*、data-* 等原生属性传给根 relative-time 元素。
        提供有效日期和时区；date 使用 Date 对象，字符串使用 datetime。 导出
        RelativeTimeOptions、RelativeTimeProps、RelativeTimeInstance。
      </template>
      <VisuallyHidden :id="`${documentationId}-props`">RelativeTime 相对时间属性</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-props`"
        :columns="columns"
        :data="rows"
      />
    </ComponentDocsSection>

    <ComponentDocsSection title="更新事件" variant="api">
      <VisuallyHidden :id="`${documentationId}-events`">RelativeTime 更新事件</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-events`"
        :columns="columns"
        :data="eventRows"
      />
    </ComponentDocsSection>

    <ComponentDocsSection title="组件实例" variant="api">
      <VisuallyHidden :id="`${documentationId}-instance`">RelativeTime 组件实例</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-instance`"
        :columns="columns"
        :data="instanceRows"
      />
    </ComponentDocsSection>

    <ComponentDocsSection title="插槽" variant="api">
      <VisuallyHidden :id="`${documentationId}-slots`">RelativeTime 插槽</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-slots`"
        :columns="columns"
        :data="slotRows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.demo-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  min-width: 0;
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 12px;
}

.demo-label {
  min-width: 100px;
  color: var(--fgColor-muted);
  font-size: 12px;
}

.update-text {
  margin: 0;
  color: var(--fgColor-muted);
  font-size: 14px;
}
</style>
