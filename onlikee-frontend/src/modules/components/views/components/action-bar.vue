<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="ActionBar 操作栏"
      description="由多个组件组合而成的工具栏，常用于编辑器顶部。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        使用
        <code>Button</code>、
        <code>Tooltip</code>、
        <code>Divider</code>、
        <code>Octicons-vue3</code>
        组合而成的操作栏组件。
      </template>
      <ComponentDocsDemoBlock :code="demo1Code">
        <div class="demo-actions">
          <Tooltip
            content="BoldIcon"
            placement="bottom"
          >
            <Button variant="invisible">
              <Button.leadingVisual>
                <BoldIcon />
              </Button.leadingVisual>
            </Button>
          </Tooltip>
          <Tooltip
            content="ItalicIcon"
            placement="bottom"
          >
            <Button variant="invisible">
              <Button.leadingVisual>
                <ItalicIcon />
              </Button.leadingVisual>
            </Button>
          </Tooltip>
          <Tooltip
            content="CodeIcon"
            placement="bottom"
          >
            <Button variant="invisible">
              <Button.leadingVisual>
                <CodeIcon />
              </Button.leadingVisual>
            </Button>
          </Tooltip>
          <Tooltip
            content="LinkIcon"
            placement="bottom"
          >
            <Button variant="invisible">
              <Button.leadingVisual>
                <LinkIcon />
              </Button.leadingVisual>
            </Button>
          </Tooltip>
          <Divider
            direction="vertical"
            height="20px"
          />
          <Tooltip
            content="File Added"
            placement="bottom"
          >
            <Button variant="invisible">
              <Button.leadingVisual>
                <FileAddedIcon />
              </Button.leadingVisual>
            </Button>
          </Tooltip>
          <Tooltip
            content="SearchIcon"
            placement="bottom"
          >
            <Button variant="invisible">
              <Button.leadingVisual>
                <SearchIcon />
              </Button.leadingVisual>
            </Button>
          </Tooltip>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'
import { Tooltip } from '@/components/primer-vue/Tooltip'
import { Divider } from '@/components/primer-vue/Divider'
import { BoldIcon, ItalicIcon, CodeIcon, LinkIcon, FileAddedIcon, SearchIcon } from '@/components/octicons-vue3'
import { Button } from '@/components/primer-vue/Button'

const demo1Code = `<template>
  <div class="demo-actions">
    <Tooltip content="BoldIcon" placement="bottom">
      <Button variant="invisible">
        <Button.leadingVisual><BoldIcon /></Button.leadingVisual>
      </Button>
    </Tooltip>
    <Tooltip content="ItalicIcon" placement="bottom">
      <Button variant="invisible">
        <Button.leadingVisual><ItalicIcon /></Button.leadingVisual>
      </Button>
    </Tooltip>
    <Tooltip content="CodeIcon" placement="bottom">
      <Button variant="invisible">
        <Button.leadingVisual><CodeIcon /></Button.leadingVisual>
      </Button>
    </Tooltip>
    <Tooltip content="LinkIcon" placement="bottom">
      <Button variant="invisible">
        <Button.leadingVisual><LinkIcon /></Button.leadingVisual>
      </Button>
    </Tooltip>

    <Divider direction="vertical" height="20px" />

    <Tooltip content="File Added" placement="bottom">
      <Button variant="invisible">
        <Button.leadingVisual><FileAddedIcon /></Button.leadingVisual>
      </Button>
    </Tooltip>
    <Tooltip content="SearchIcon" placement="bottom">
      <Button variant="invisible">
        <Button.leadingVisual><SearchIcon /></Button.leadingVisual>
      </Button>
    </Tooltip>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/primer-vue/Button'
import { Tooltip } from '@/components/primer-vue/Tooltip'
import { Divider } from '@/components/primer-vue/Divider'
import { BoldIcon, ItalicIcon, CodeIcon, LinkIcon, FileAddedIcon, SearchIcon } from '@/components/octicons-vue3'
<\/script>

<style scoped>
.demo-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
}
</style>`
</script>

<style scoped>
.demo-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
}
</style>