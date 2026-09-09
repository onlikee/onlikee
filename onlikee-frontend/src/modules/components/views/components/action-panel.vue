<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="ActionPanel 操作面板"
      description="由 Dropdown 和 ActionList 组合而成的操作面板组件。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        使用 <code>Dropdown</code> 和 <code>ActionList</code> 组合操作面板，图标通过 <code>ActionList.LeadingVisual</code> 进入列表项的 leading 区域。
      </template>
      <ComponentDocsDemoBlock :code="demo1Code">
        <Dropdown>
          <Dropdown.trigger>
            <Button>
              <Button.leadingVisual>
                <PlusIcon />
              </Button.leadingVisual>
              新建
              <Button.trailingVisual>
                <TriangleDownIcon />
              </Button.trailingVisual>
            </Button>
          </Dropdown.trigger>
          <Dropdown.content>
            <ActionList>
              <ActionList.Item @select="handleClick('新建文件')">
                <ActionList.LeadingVisual>
                  <FileIcon />
                </ActionList.LeadingVisual>
                新建文件
              </ActionList.Item>
              <ActionList.Item @select="handleClick('新建文件夹')">
                <ActionList.LeadingVisual>
                  <RepoIcon />
                </ActionList.LeadingVisual>
                新建文件夹
              </ActionList.Item>
              <ActionList.Divider />
              <ActionList.Item @select="handleClick('从模板创建')">
                <ActionList.LeadingVisual>
                  <CopyIcon />
                </ActionList.LeadingVisual>
                从模板创建
              </ActionList.Item>
            </ActionList>
          </Dropdown.content>
        </Dropdown>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="更多操作">
      <template #description>
        使用图标按钮作为触发器，并用 <code>variant="danger"</code> 标记破坏性操作。
      </template>
      <ComponentDocsDemoBlock :code="demo2Code">
        <Dropdown side="outside-bottom">
          <Dropdown.trigger>
            <Button variant="invisible">
              <Button.leadingVisual>
                <KebabHorizontalIcon />
              </Button.leadingVisual>
            </Button>
          </Dropdown.trigger>
          <Dropdown.content>
            <ActionList>
              <ActionList.Item>
                <ActionList.LeadingVisual>
                  <PencilIcon />
                </ActionList.LeadingVisual>
                编辑
              </ActionList.Item>
              <ActionList.Item>
                <ActionList.LeadingVisual>
                  <CopyIcon />
                </ActionList.LeadingVisual>
                复制
              </ActionList.Item>
              <ActionList.Divider />
              <ActionList.Item variant="danger">
                <ActionList.LeadingVisual>
                  <TrashIcon />
                </ActionList.LeadingVisual>
                删除
              </ActionList.Item>
            </ActionList>
          </Dropdown.content>
        </Dropdown>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="带链接的操作面板">
      <template #description>
        使用 <code>ActionList.LinkItem</code> 渲染链接操作。
      </template>
      <ComponentDocsDemoBlock :code="demo3Code">
        <Dropdown>
          <Dropdown.trigger>
            <Button>
              导航
              <Button.trailingVisual>
                <TriangleDownIcon />
              </Button.trailingVisual>
            </Button>
          </Dropdown.trigger>
          <Dropdown.content>
            <ActionList>
              <ActionList.LinkItem
                href="https://github.com"
                new-tab
              >
                GitHub
                <ActionList.TrailingVisual>
                  <LinkExternalIcon />
                </ActionList.TrailingVisual>
              </ActionList.LinkItem>
              <ActionList.LinkItem
                href="https://vuejs.org"
                new-tab
              >
                Vue.js
                <ActionList.TrailingVisual>
                  <LinkExternalIcon />
                </ActionList.TrailingVisual>
              </ActionList.LinkItem>
              <ActionList.LinkItem
                href="https://vitejs.dev"
                new-tab
              >
                Vite
                <ActionList.TrailingVisual>
                  <LinkExternalIcon />
                </ActionList.TrailingVisual>
              </ActionList.LinkItem>
            </ActionList>
          </Dropdown.content>
        </Dropdown>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="选中状态同步">
      <template #description>
        在列表上设置 <code>selectionVariant="single"</code>，并用列表项的 <code>selected</code> 控制选中状态。
      </template>
      <ComponentDocsDemoBlock :code="demo4Code">
        <Dropdown>
          <Dropdown.trigger>
            <Button>
              <Button.leadingVisual>
                <RepoIcon />
              </Button.leadingVisual>
              {{ selectedLabel }}
              <Button.trailingVisual>
                <TriangleDownIcon />
              </Button.trailingVisual>
            </Button>
          </Dropdown.trigger>
          <Dropdown.content>
            <ActionList selection-variant="single">
              <ActionList.Item
                v-for="item in labels"
                :key="item"
                :selected="selectedLabel === item"
                @select="selectedLabel = item"
              >
                {{ item }}
              </ActionList.Item>
            </ActionList>
          </Dropdown.content>
        </Dropdown>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="嵌套二级菜单">
      <template #description>
        将 <code>ActionList.Item</code> 作为嵌套 <code>Dropdown</code> 的触发器，并把箭头放入 trailing 区域。
      </template>
      <ComponentDocsDemoBlock :code="demo5Code">
        <Dropdown>
          <Dropdown.trigger>
            <Button>
              打开菜单
              <Button.trailingVisual>
                <TriangleDownIcon />
              </Button.trailingVisual>
            </Button>
          </Dropdown.trigger>
          <Dropdown.content>
            <ActionList>
              <ActionList.Item>
                选项1
              </ActionList.Item>
              <ActionList.Item>
                选项2
              </ActionList.Item>
              <Dropdown 
                side="outside-right" 
                display-in-viewport
              >
                <Dropdown.trigger>
                  <ActionList.Item>
                    选项3
                    <ActionList.TrailingVisual>
                      <ChevronRightIcon />
                    </ActionList.TrailingVisual>
                  </ActionList.Item>
                </Dropdown.trigger>
                <Dropdown.content>
                  <ActionList>
                    <ActionList.Item>
                      子选项1
                    </ActionList.Item>
                    <ActionList.Item>
                      子选项2
                    </ActionList.Item>
                    <ActionList.Item>
                      子选项3
                    </ActionList.Item>
                  </ActionList>
                </Dropdown.content>
              </Dropdown>
            </ActionList>
          </Dropdown.content>
        </Dropdown>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'
import { ActionList } from '@/components/primer-vue/ActionList'
import { Button } from '@/components/primer-vue/Button'
import { Dropdown } from '@/components/primer-vue/Dropdown'
import {
  ChevronRightIcon,
  CopyIcon,
  FileIcon,
  KebabHorizontalIcon,
  LinkExternalIcon,
  PencilIcon,
  PlusIcon,
  RepoIcon,
  TrashIcon,
  TriangleDownIcon
} from '@/components/octicons-vue3'

const labels = ['新建文件', '打开文件', '保存文件']
const selectedLabel = ref(labels[0])

const handleClick = (action: string) => {
  alert(`执行操作：${action}`)
}

const demo1Code = `<template>
  <Dropdown>
    <Dropdown.trigger>
      <Button>
        <Button.leadingVisual><PlusIcon /></Button.leadingVisual>
        新建
        <Button.trailingVisual><TriangleDownIcon /></Button.trailingVisual>
      </Button>
    </Dropdown.trigger>
    <Dropdown.content>
      <ActionList>
        <ActionList.Item @select="handleClick('新建文件')">
          <ActionList.LeadingVisual><FileIcon /></ActionList.LeadingVisual>
          新建文件
        </ActionList.Item>
        <ActionList.Item @select="handleClick('新建文件夹')">
          <ActionList.LeadingVisual><RepoIcon /></ActionList.LeadingVisual>
          新建文件夹
        </ActionList.Item>
        <ActionList.Divider />
        <ActionList.Item @select="handleClick('从模板创建')">
          <ActionList.LeadingVisual><CopyIcon /></ActionList.LeadingVisual>
          从模板创建
        </ActionList.Item>
      </ActionList>
    </Dropdown.content>
  </Dropdown>
</template>

<script setup lang="ts">
import { ActionList } from '@/components/primer-vue/ActionList'
import { Button } from '@/components/primer-vue/Button'
import { Dropdown } from '@/components/primer-vue/Dropdown'
import { CopyIcon, FileIcon, PlusIcon, RepoIcon, TriangleDownIcon } from '@/components/octicons-vue3'

const handleClick = (action: string) => {
  alert(\`执行操作：\${action}\`)
}
<\/script>`

const demo2Code = `<template>
  <Dropdown side="outside-bottom">
    <Dropdown.trigger>
      <Button variant="invisible">
        <Button.leadingVisual><KebabHorizontalIcon /></Button.leadingVisual>
      </Button>
    </Dropdown.trigger>
    <Dropdown.content>
      <ActionList>
        <ActionList.Item>
          <ActionList.LeadingVisual><PencilIcon /></ActionList.LeadingVisual>
          编辑
        </ActionList.Item>
        <ActionList.Item>
          <ActionList.LeadingVisual><CopyIcon /></ActionList.LeadingVisual>
          复制
        </ActionList.Item>
        <ActionList.Divider />
        <ActionList.Item variant="danger">
          <ActionList.LeadingVisual><TrashIcon /></ActionList.LeadingVisual>
          删除
        </ActionList.Item>
      </ActionList>
    </Dropdown.content>
  </Dropdown>
</template>

<script setup lang="ts">
import { ActionList } from '@/components/primer-vue/ActionList'
import { Button } from '@/components/primer-vue/Button'
import { Dropdown } from '@/components/primer-vue/Dropdown'
import { CopyIcon, KebabHorizontalIcon, PencilIcon, TrashIcon } from '@/components/octicons-vue3'
<\/script>`

const demo3Code = `<template>
  <Dropdown>
    <Dropdown.trigger>
      <Button>
        导航
        <Button.trailingVisual><TriangleDownIcon /></Button.trailingVisual>
      </Button>
    </Dropdown.trigger>
    <Dropdown.content>
      <ActionList>
        <ActionList.LinkItem href="https://github.com" new-tab>
          GitHub
          <ActionList.TrailingVisual><LinkExternalIcon /></ActionList.TrailingVisual>
        </ActionList.LinkItem>
        <ActionList.LinkItem href="https://vuejs.org" new-tab>
          Vue.js
          <ActionList.TrailingVisual><LinkExternalIcon /></ActionList.TrailingVisual>
        </ActionList.LinkItem>
        <ActionList.LinkItem href="https://vitejs.dev" new-tab>
          Vite
          <ActionList.TrailingVisual><LinkExternalIcon /></ActionList.TrailingVisual>
        </ActionList.LinkItem>
      </ActionList>
    </Dropdown.content>
  </Dropdown>
</template>

<script setup lang="ts">
import { ActionList } from '@/components/primer-vue/ActionList'
import { Button } from '@/components/primer-vue/Button'
import { Dropdown } from '@/components/primer-vue/Dropdown'
import { LinkExternalIcon, TriangleDownIcon } from '@/components/octicons-vue3'
<\/script>`

const demo4Code = `<template>
  <Dropdown>
    <Dropdown.trigger>
      <Button>
        <Button.leadingVisual><RepoIcon /></Button.leadingVisual>
        {{ selectedLabel }}
        <Button.trailingVisual><TriangleDownIcon /></Button.trailingVisual>
      </Button>
    </Dropdown.trigger>
    <Dropdown.content>
      <ActionList selection-variant="single">
        <ActionList.Item
          v-for="item in labels"
          :key="item"
          :selected="selectedLabel === item"
          @select="selectedLabel = item"
        >
          {{ item }}
        </ActionList.Item>
      </ActionList>
    </Dropdown.content>
  </Dropdown>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ActionList } from '@/components/primer-vue/ActionList'
import { Button } from '@/components/primer-vue/Button'
import { Dropdown } from '@/components/primer-vue/Dropdown'
import { RepoIcon, TriangleDownIcon } from '@/components/octicons-vue3'

const labels = ['新建文件', '打开文件', '保存文件']
const selectedLabel = ref(labels[0])
<\/script>`

const demo5Code = `<template>
  <Dropdown>
    <Dropdown.trigger>
      <Button>
        打开菜单
        <Button.trailingVisual><TriangleDownIcon /></Button.trailingVisual>
      </Button>
    </Dropdown.trigger>
    <Dropdown.content>
      <ActionList>
        <ActionList.Item>选项1</ActionList.Item>
        <ActionList.Item>选项2</ActionList.Item>
        <Dropdown side="outside-right">
          <Dropdown.trigger>
            <ActionList.Item>
              选项3
              <ActionList.TrailingVisual><ChevronRightIcon /></ActionList.TrailingVisual>
            </ActionList.Item>
          </Dropdown.trigger>
          <Dropdown.content>
            <ActionList>
              <ActionList.Item>子选项1</ActionList.Item>
              <ActionList.Item>子选项2</ActionList.Item>
              <ActionList.Item>子选项3</ActionList.Item>
            </ActionList>
          </Dropdown.content>
        </Dropdown>
      </ActionList>
    </Dropdown.content>
  </Dropdown>
</template>

<script setup lang="ts">
import { ActionList } from '@/components/primer-vue/ActionList'
import { Button } from '@/components/primer-vue/Button'
import { Dropdown } from '@/components/primer-vue/Dropdown'
import { ChevronRightIcon, TriangleDownIcon } from '@/components/octicons-vue3'
<\/script>`
</script>
