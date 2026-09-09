<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="UserMenu 用户菜单"
      description="由多个组件组成的用户菜单。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        使用 <code>Dropdown</code>、<code>Avatar</code>、<code>ActionList</code> 和 <code>Octicons-vue3</code> 组合用户菜单。
      </template>
      <ComponentDocsDemoBlock :code="demo1Code">
        <div class="user-menu">
          <Dropdown>
            <Dropdown.trigger>
              <Avatar
                src="https://avatars.githubusercontent.com/u/131276691?v=4"
                :size="42"
              />
            </Dropdown.trigger>
            <Dropdown.content>
              <div class="user-header">
                <Avatar
                  src="https://avatars.githubusercontent.com/u/131276691?v=4"
                  :size="36"
                />
                <div class="user-info">
                  <div class="user-name">
                    onlikee Studio
                  </div>
                  <div class="user-email">
                    hello@onlikee.audio
                  </div>
                </div>
              </div>
              <ActionList>
                <ActionList.Divider />
                <ActionList.Item>
                  <ActionList.LeadingVisual>
                    <PersonIcon />
                  </ActionList.LeadingVisual>
                  个人资料
                </ActionList.Item>
                <ActionList.LinkItem
                  href="https://github.com/UnderHear"
                >
                  <ActionList.LeadingVisual>
                    <MarkGithubIcon />
                  </ActionList.LeadingVisual>
                  前往 GitHub
                </ActionList.LinkItem>
                <ActionList.Divider />
                <ActionList.Item>
                  <ActionList.LeadingVisual>
                    <GearIcon />
                  </ActionList.LeadingVisual>
                  设置
                </ActionList.Item>
                <ActionList.Divider />
                <ActionList.Item>
                  <ActionList.LeadingVisual>
                    <SignOutIcon />
                  </ActionList.LeadingVisual>
                  退出登录
                </ActionList.Item>
              </ActionList>
            </Dropdown.content>
          </Dropdown>
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
import { ActionList } from '@/components/primer-vue/ActionList'
import { Avatar } from '@/components/primer-vue/Avatar'
import { Dropdown } from '@/components/primer-vue/Dropdown'
import { GearIcon, MarkGithubIcon, PersonIcon, SignOutIcon } from '@/components/octicons-vue3'

const demo1Code = `<template>
  <div class="user-menu">
    <Dropdown>
      <Dropdown.trigger>
        <Avatar src="https://avatars.githubusercontent.com/u/131276691?v=4" :size="42" />
      </Dropdown.trigger>
      <Dropdown.content>
        <div class="user-header">
          <Avatar src="https://avatars.githubusercontent.com/u/131276691?v=4" :size="36" />
          <div class="user-info">
            <div class="user-name">onlikee Studio</div>
            <div class="user-email">hello@onlikee.audio</div>
          </div>
        </div>
        <ActionList>
          <ActionList.Divider />
          <ActionList.Item>
            <ActionList.LeadingVisual><PersonIcon /></ActionList.LeadingVisual>
            个人资料
          </ActionList.Item>
          <ActionList.LinkItem href="https://github.com/UnderHear">
            <ActionList.LeadingVisual><MarkGithubIcon /></ActionList.LeadingVisual>
            前往 GitHub
          </ActionList.LinkItem>
          <ActionList.Divider />
          <ActionList.Item>
            <ActionList.LeadingVisual><GearIcon /></ActionList.LeadingVisual>
            设置
          </ActionList.Item>
          <ActionList.Divider />
          <ActionList.Item>
            <ActionList.LeadingVisual><SignOutIcon /></ActionList.LeadingVisual>
            退出登录
          </ActionList.Item>
        </ActionList>
      </Dropdown.content>
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
import { ActionList } from '@/components/primer-vue/ActionList'
import { Avatar } from '@/components/primer-vue/Avatar'
import { Dropdown } from '@/components/primer-vue/Dropdown'
import { GearIcon, MarkGithubIcon, PersonIcon, SignOutIcon } from '@/components/octicons-vue3'
<\/script>

<style scoped>
.user-menu {
  position: absolute;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 12px 0;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  color: var(--fgColor-default);
  font-size: 14px;
  font-weight: 600;
}

.user-email {
  color: var(--fgColor-muted);
  font-size: 12px;
}
<\/style>`
</script>

<style scoped>
.user-menu {
  position: absolute;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 12px 0;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  color: var(--fgColor-default);
  font-size: 14px;
  font-weight: 600;
}

.user-email {
  color: var(--fgColor-muted);
  font-size: 12px;
}

@media (max-width: 767px) {
  .user-menu {
    position: relative;
    right: 0;
    height: 32px;
    margin-left: 0.5rem;
  }
}
</style>
