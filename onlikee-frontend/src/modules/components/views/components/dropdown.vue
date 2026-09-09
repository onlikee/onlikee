<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Dropdown 下拉菜单"
      description="通过 trigger 和 content 子组件组织触发器与浮层内容的下拉容器，支持横向碰撞检测、自动翻转与文档竖向越界回退。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        通过 <code>Dropdown.trigger</code> 子组件定义触发元素，<code>Dropdown.content</code> 子组件放置下拉内容。组件会从默认插槽中提取这两个子组件并分别渲染到触发区和内容区。
      </template>

      <ComponentDocsDemoBlock :code="demo1Code">
        <div class="dropdown-demo">
          <Dropdown>
            <Dropdown.trigger>
              <button class="demo-trigger">
                点击展开
              </button>
            </Dropdown.trigger>
            <Dropdown.content>
              <div class="demo-content">
                <div class="demo-item">
                  选项一
                </div>
                <div class="demo-item">
                  选项二
                </div>
                <div class="demo-item">
                  选项三
                </div>
              </div>
            </Dropdown.content>
          </Dropdown>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="弹出方向">
      <template #description>
        通过 <code>side</code> 设置首选锚定方向；外侧方向会按横向空间自动换边，<code>outside-top</code>/<code>outside-bottom</code> 在超出文档上下边界时会互相翻转。
      </template>

      <ComponentDocsDemoBlock :code="demoPlacementCode">
        <div class="dropdown-placement-demo">
          <Dropdown side="inside-top">
            <Dropdown.trigger>
              <button class="demo-trigger">
                内侧上方
              </button>
            </Dropdown.trigger>
            <Dropdown.content>
              <div class="demo-content">
                内侧上方内容
              </div>
            </Dropdown.content>
          </Dropdown>
          <Dropdown side="inside-bottom">
            <Dropdown.trigger>
              <button class="demo-trigger">
                内侧下方
              </button>
            </Dropdown.trigger>
            <Dropdown.content>
              <div class="demo-content">
                内侧下方内容
              </div>
            </Dropdown.content>
          </Dropdown>
          <Dropdown side="inside-left">
            <Dropdown.trigger>
              <button class="demo-trigger">
                内侧左边
              </button>
            </Dropdown.trigger>
            <Dropdown.content>
              <div class="demo-content">
                内侧左边内容
              </div>
            </Dropdown.content>
          </Dropdown>
          <Dropdown side="inside-right">
            <Dropdown.trigger>
              <button class="demo-trigger">
                内侧右边
              </button>
            </Dropdown.trigger>
            <Dropdown.content>
              <div class="demo-content">
                内侧右边内容
              </div>
            </Dropdown.content>
          </Dropdown>
          <Dropdown side="inside-center">
            <Dropdown.trigger>
              <button class="demo-trigger">
                内侧居中
              </button>
            </Dropdown.trigger>
            <Dropdown.content>
              <div class="demo-content">
                内侧居中内容
              </div>
            </Dropdown.content>
          </Dropdown>
          <Dropdown side="outside-top">
            <Dropdown.trigger>
              <button class="demo-trigger">
                外侧上方
              </button>
            </Dropdown.trigger>
            <Dropdown.content>
              <div class="demo-content">
                外侧上方内容
              </div>
            </Dropdown.content>
          </Dropdown>
          <Dropdown side="outside-bottom">
            <Dropdown.trigger>
              <button class="demo-trigger">
                外侧下方
              </button>
            </Dropdown.trigger>
            <Dropdown.content>
              <div class="demo-content">
                外侧下方内容
              </div>
            </Dropdown.content>
          </Dropdown>
          <Dropdown side="outside-left">
            <Dropdown.trigger>
              <button class="demo-trigger">
                外侧左边
              </button>
            </Dropdown.trigger>
            <Dropdown.content>
              <div class="demo-content">
                外侧左边内容
              </div>
            </Dropdown.content>
          </Dropdown>
          <Dropdown side="outside-right">
            <Dropdown.trigger>
              <button class="demo-trigger">
                外侧右边
              </button>
            </Dropdown.trigger>
            <Dropdown.content>
              <div class="demo-content">
                外侧右边内容
              </div>
            </Dropdown.content>
          </Dropdown>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="内容宽度">
      <template #description>
        <code>Dropdown.content</code> 支持 <code>width</code> prop，用固定尺寸 token 控制浮层宽度；默认 <code>auto</code> 保持内容自适应。
      </template>

      <ComponentDocsDemoBlock :code="demoWidthCode">
        <div class="dropdown-width-demo">
          <Dropdown
            v-for="option in widthOptions"
            :key="option.width"
          >
            <Dropdown.trigger>
              <button class="demo-trigger">
                {{ option.label }}
              </button>
            </Dropdown.trigger>
            <Dropdown.content :width="option.width">
              <div class="demo-content demo-content--width">
                <strong>{{ option.label }}</strong>
                <span>{{ option.size }}</span>
              </div>
            </Dropdown.content>
          </Dropdown>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="点击内容保持展开">
      <template #description>
        点击 <code>Dropdown.content</code> 子组件内的任意元素时，下拉菜单会保持展开；点击组件外部区域才会关闭。
      </template>

      <ComponentDocsDemoBlock :code="demoKeepOpenCode">
        <div class="dropdown-demo">
          <Dropdown>
            <Dropdown.trigger>
              <button class="demo-trigger">
                点击展开
              </button>
            </Dropdown.trigger>
            <Dropdown.content>
              <div class="demo-content">
                <div class="demo-item">
                  选项一（点击后保持展开）
                </div>
                <div class="demo-item">
                  选项二（点击后保持展开）
                </div>
              </div>
            </Dropdown.content>
          </Dropdown>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="编程式关闭">
      <template #description>
        通过 template ref 获取组件实例，调用暴露的 <code>close()</code> 方法可在任意时机关闭下拉菜单。
      </template>

      <ComponentDocsDemoBlock :code="demoExposeCode">
        <div class="dropdown-demo">
          <Dropdown ref="exposeDropdownRef">
            <Dropdown.trigger>
              <button class="demo-trigger">
                点击展开
              </button>
            </Dropdown.trigger>
            <Dropdown.content>
              <div class="demo-content">
                <div
                  class="demo-item"
                  @click="exposeDropdownRef?.close()"
                >
                  点击关闭
                </div>
              </div>
            </Dropdown.content>
          </Dropdown>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection
      title="API"
      variant="api"
    >
      <h4>Props 属性</h4>
      <Table
        :columns="propsTableColumns"
        :data="propsTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />
      <h4 style="margin-top: 24px;">
        内容与子组件
      </h4>
      <Table
        :columns="contentTableColumns"
        :data="contentTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />
      <h4 style="margin-top: 24px;">
        Expose 方法
      </h4>
      <Table
        :columns="exposeTableColumns"
        :data="exposeTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Dropdown } from '@/components/primer-vue/Dropdown'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const exposeDropdownRef = ref<InstanceType<typeof Dropdown>>()
type DropdownContentWidth = 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | 'auto'

const widthOptions: Array<{ width: DropdownContentWidth, label: string, size: string }> = [
  { width: 'small', label: 'Small', size: '256px' },
  { width: 'medium', label: 'Medium', size: '320px' },
  { width: 'large', label: 'Large', size: '480px' },
  { width: 'xlarge', label: 'Xlarge', size: '640px' },
  { width: 'xxlarge', label: 'Xxlarge', size: '960px' },
  { width: 'auto', label: 'Auto', size: '内容自适应' }
]

const demo1Code = `<template>
  <div class="dropdown-demo">
    <Dropdown>
      <Dropdown.trigger>
        <button class="demo-trigger">点击展开</button>
      </Dropdown.trigger>
      <Dropdown.content>
        <div class="demo-content">
          <div class="demo-item">选项一</div>
          <div class="demo-item">选项二</div>
          <div class="demo-item">选项三</div>
        </div>
      </Dropdown.content>
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
import { Dropdown } from '@/components/primer-vue/Dropdown'
<\/script>

<style scoped>
.dropdown-demo {
  position: absolute;
}

.demo-trigger {
  padding: 8px 16px;
  border: 1px solid var(--borderColor-default);
  border-radius: 6px;
  background: var(--bgColor-default);
  font-size: 14px;
  cursor: pointer;
}

.demo-trigger:hover {
  background: var(--bgColor-muted);
}

.demo-content {
  padding: 8px;
  min-width: 120px;
}

.demo-item {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.demo-item:hover {
  background: var(--bgColor-muted);
}
<\/style>`

const demoPlacementCode = `<template>
  <div class="dropdown-placement-demo">
    <Dropdown side="inside-top">
      <Dropdown.trigger>
        <button class="demo-trigger">内侧上方</button>
      </Dropdown.trigger>
      <Dropdown.content>
        <div class="demo-content">内侧上方内容</div>
      </Dropdown.content>
    </Dropdown>
    <Dropdown side="inside-bottom">
      <Dropdown.trigger>
        <button class="demo-trigger">内侧下方</button>
      </Dropdown.trigger>
      <Dropdown.content>
        <div class="demo-content">内侧下方内容</div>
      </Dropdown.content>
    </Dropdown>
    <Dropdown side="inside-left">
      <Dropdown.trigger>
        <button class="demo-trigger">内侧左边</button>
      </Dropdown.trigger>
      <Dropdown.content>
        <div class="demo-content">内侧左边内容</div>
      </Dropdown.content>
    </Dropdown>
    <Dropdown side="inside-right">
      <Dropdown.trigger>
        <button class="demo-trigger">内侧右边</button>
      </Dropdown.trigger>
      <Dropdown.content>
        <div class="demo-content">内侧右边内容</div>
      </Dropdown.content>
    </Dropdown>
    <Dropdown side="inside-center">
      <Dropdown.trigger>
        <button class="demo-trigger">内侧居中</button>
      </Dropdown.trigger>
      <Dropdown.content>
        <div class="demo-content">内侧居中内容</div>
      </Dropdown.content>
    </Dropdown>
    <Dropdown side="outside-top">
      <Dropdown.trigger>
        <button class="demo-trigger">外侧上方</button>
      </Dropdown.trigger>
      <Dropdown.content>
        <div class="demo-content">外侧上方内容</div>
      </Dropdown.content>
    </Dropdown>
    <Dropdown side="outside-bottom">
      <Dropdown.trigger>
        <button class="demo-trigger">外侧下方</button>
      </Dropdown.trigger>
      <Dropdown.content>
        <div class="demo-content">外侧下方内容</div>
      </Dropdown.content>
    </Dropdown>
    <Dropdown side="outside-left">
      <Dropdown.trigger>
        <button class="demo-trigger">外侧左边</button>
      </Dropdown.trigger>
      <Dropdown.content>
        <div class="demo-content">外侧左边内容</div>
      </Dropdown.content>
    </Dropdown>
    <Dropdown side="outside-right">
      <Dropdown.trigger>
        <button class="demo-trigger">外侧右边</button>
      </Dropdown.trigger>
      <Dropdown.content>
        <div class="demo-content">外侧右边内容</div>
      </Dropdown.content>
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
import { Dropdown } from '@/components/primer-vue/Dropdown'
<\/script>

<style scoped>
.dropdown-placement-demo {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.demo-trigger {
  padding: 8px 16px;
  border: 1px solid var(--borderColor-default);
  border-radius: 6px;
  background: var(--bgColor-default);
  font-size: 14px;
  cursor: pointer;
}

.demo-trigger:hover {
  background: var(--bgColor-muted);
}

.demo-content {
  padding: 8px;
  min-width: 120px;
}
<\/style>`

const demoWidthCode = `<script setup lang="ts">
import { Dropdown } from '@/components/primer-vue/Dropdown'

type DropdownContentWidth = 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | 'auto'

const widthOptions: Array<{ width: DropdownContentWidth, label: string, size: string }> = [
  { width: 'small', label: 'Small', size: '256px' },
  { width: 'medium', label: 'Medium', size: '320px' },
  { width: 'large', label: 'Large', size: '480px' },
  { width: 'xlarge', label: 'Xlarge', size: '640px' },
  { width: 'xxlarge', label: 'Xxlarge', size: '960px' },
  { width: 'auto', label: 'Auto', size: '内容自适应' }
]
<\/script>

<template>
  <div class="dropdown-width-demo">
    <Dropdown
      v-for="option in widthOptions"
      :key="option.width"
    >
      <Dropdown.trigger>
        <button class="demo-trigger">
          {{ option.label }}
        </button>
      </Dropdown.trigger>
      <Dropdown.content :width="option.width">
        <div class="demo-content demo-content--width">
          <strong>{{ option.label }}</strong>
          <span>{{ option.size }}</span>
        </div>
      </Dropdown.content>
    </Dropdown>
  </div>
</template>

<style scoped>
.dropdown-width-demo {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.demo-content {
  padding: 12px;
}

.demo-content--width {
  display: grid;
  gap: 4px;
}
<\/style>`

const propsTableColumns: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '140px' },
  { key: 'default', label: '默认值', minWidth: '120px' },
  { key: 'type', label: '类型', minWidth: '220px', wrap: true },
  { key: 'description', label: '说明', minWidth: '220px', wrap: true }
]

const propsTableRows = [
  {
    name: 'side',
    description: '下拉菜单首选锚定方向；外侧方向会按横向空间自动换边，outside-top/outside-bottom 超出文档上下边界时会互翻',
    type: `'inside-top' | 'inside-bottom' | 'inside-left' | 'inside-right' | 'inside-center' | 'outside-top' | 'outside-bottom' | 'outside-left' | 'outside-right'`,
    default: 'outside-bottom'
  },
  {
    name: 'align',
    description: '浮层在交叉轴上的对齐方式',
    type: `'start' | 'center' | 'end'`,
    default: 'start'
  },
  {
    name: 'anchorOffset',
    description: '浮层与触发器在主轴上的偏移距离，单位 px',
    type: 'number',
    default: '4'
  },
  {
    name: 'alignmentOffset',
    description: '浮层与触发器在交叉轴上的偏移距离，单位 px；内侧非居中对齐默认 4，其余默认 0',
    type: 'number',
    default: '按 side/align 推导'
  },
  {
    name: 'allowOutOfBounds',
    description: '允许浮层超出横向边界或文档竖向范围；开启后不再自动翻转和横向钳制',
    type: 'boolean',
    default: 'false'
  },
  {
    name: 'displayInViewport',
    description: '忽略最近滚动裁剪祖先，直接以可视视口作为横向定位边界',
    type: 'boolean',
    default: 'false'
  }
]

const contentTableColumns: TableColumn[] = [
  { key: 'name', label: '名称', rowHeader: true, minWidth: '180px' },
  { key: 'description', label: '说明', minWidth: '300px', wrap: true }
]

const contentTableRows = [
  {
    name: 'Dropdown.trigger',
    description: '触发下拉的元素子组件，会被提取到触发区；点击该元素会展开/收起下拉内容'
  },
  {
    name: 'Dropdown.content',
    description: '下拉菜单的内容子组件，会被提取到浮层内容区；支持 width="small | medium | large | xlarge | xxlarge | auto" 控制宽度，默认 auto'
  }
]

const exposeTableColumns: TableColumn[] = [
  { key: 'name', label: '方法名', rowHeader: true, minWidth: '140px' },
  { key: 'description', label: '说明', minWidth: '300px', wrap: true }
]

const exposeTableRows = [
  {
    name: 'close()',
    description: '关闭下拉菜单，可通过 template ref 调用'
  }
]

const demoKeepOpenCode = `<template>
  <Dropdown>
    <Dropdown.trigger>
      <button>点击展开</button>
    </Dropdown.trigger>
    <Dropdown.content>
      <div class="demo-item">选项一（点击后保持展开）</div>
      <div class="demo-item">选项二（点击后保持展开）</div>
    </Dropdown.content>
  </Dropdown>
</template>

<script setup lang="ts">
import { Dropdown } from '@/components/primer-vue/Dropdown'
<\/script>`

const demoExposeCode = `<template>
  <Dropdown ref="dropdownRef">
    <Dropdown.trigger>
      <button>点击展开</button>
    </Dropdown.trigger>
    <Dropdown.content>
      <div @click="dropdownRef?.close()">点击关闭</div>
    </Dropdown.content>
  </Dropdown>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Dropdown } from '@/components/primer-vue/Dropdown'

const dropdownRef = ref<InstanceType<typeof Dropdown>>()
<\/script>`
</script>

<style scoped>
.dropdown-demo {
  position: absolute;
}

.dropdown-placement-demo {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.dropdown-width-demo {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.demo-trigger {
  padding: 8px 16px;
  border: 1px solid var(--borderColor-default);
  border-radius: 6px;
  background: var(--control-transparent-bgColor-rest, #ffffff00);
  font-size: 14px;
  cursor: pointer;
}

.demo-trigger:hover {
  background: var(--control-transparent-bgColor-hover, #818b981a);
}

.demo-content {
  padding: 8px;
  min-width: 120px;
}

.demo-content--width {
  display: grid;
  gap: 4px;
}

.demo-item {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.demo-item:hover {
  background: var(--control-transparent-bgColor-hover, #818b981a);
}

h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--fgColor-default);
}
</style>
