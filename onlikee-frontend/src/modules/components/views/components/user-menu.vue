<template>
  <ComponentDocsPage>
    <ComponentDocsHeader title="UserMenu 用户菜单" description="由多个组件组成的用户菜单。" />

    <ComponentDocsSection title="基础用法">
      <template #description>
        使用 <code>ActionMenu</code>、<code>Avatar</code>、<code>ActionList</code> 和
        <code>Octicons Vue</code> 组合用户菜单。
      </template>
      <ComponentDocsDemoBlock :code="demo1Code">
        <div class="user-menu">
          <ActionMenu>
            <ActionMenu.Anchor>
              <button type="button" class="user-menu-trigger" aria-label="用户菜单">
                <Avatar src="https://avatars.githubusercontent.com/u/131276691?v=4" :size="42" />
              </button>
            </ActionMenu.Anchor>
            <ActionMenu.Overlay>
              <div class="user-header">
                <Avatar src="https://avatars.githubusercontent.com/u/131276691?v=4" :size="36" />
                <div class="user-info">
                  <div class="user-name">onlikee Studio</div>
                  <div class="user-email">hello@onlikee.audio</div>
                </div>
              </div>
              <ActionList role="menu" aria-label="用户菜单">
                <ActionList.Divider />
                <ActionList.Item role="menuitem">
                  <ActionList.LeadingVisual>
                    <PersonIcon />
                  </ActionList.LeadingVisual>
                  个人资料
                </ActionList.Item>
                <ActionList.LinkItem role="menuitem" href="https://github.com/UnderHear">
                  <ActionList.LeadingVisual>
                    <MarkGithubIcon />
                  </ActionList.LeadingVisual>
                  前往 GitHub
                </ActionList.LinkItem>
                <ActionList.Divider />
                <ActionList.Item role="menuitem">
                  <ActionList.LeadingVisual>
                    <GearIcon />
                  </ActionList.LeadingVisual>
                  设置
                </ActionList.Item>
                <ActionList.Divider />
                <ActionList.Item role="menuitem">
                  <ActionList.LeadingVisual>
                    <SignOutIcon />
                  </ActionList.LeadingVisual>
                  退出登录
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
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
import { ActionMenu } from '@/components/primer-vue/ActionMenu'
import { GearIcon, MarkGithubIcon, PersonIcon, SignOutIcon } from '@onlikee/octicons-vue'

const demo1Code = `<template>
  <div class="user-menu">
    <ActionMenu>
      <ActionMenu.Anchor>
        <button type="button" class="user-menu-trigger" aria-label="用户菜单">
          <Avatar src="https://avatars.githubusercontent.com/u/131276691?v=4" :size="42" />
        </button>
      </ActionMenu.Anchor>
      <ActionMenu.Overlay>
        <div class="user-header">
          <Avatar src="https://avatars.githubusercontent.com/u/131276691?v=4" :size="36" />
          <div class="user-info">
            <div class="user-name">onlikee Studio</div>
            <div class="user-email">hello@onlikee.audio</div>
          </div>
        </div>
        <ActionList role="menu" aria-label="用户菜单">
          <ActionList.Divider />
          <ActionList.Item role="menuitem">
            <ActionList.LeadingVisual><PersonIcon /></ActionList.LeadingVisual>
            个人资料
          </ActionList.Item>
          <ActionList.LinkItem role="menuitem" href="https://github.com/UnderHear">
            <ActionList.LeadingVisual><MarkGithubIcon /></ActionList.LeadingVisual>
            前往 GitHub
          </ActionList.LinkItem>
          <ActionList.Divider />
          <ActionList.Item role="menuitem">
            <ActionList.LeadingVisual><GearIcon /></ActionList.LeadingVisual>
            设置
          </ActionList.Item>
          <ActionList.Divider />
          <ActionList.Item role="menuitem">
            <ActionList.LeadingVisual><SignOutIcon /></ActionList.LeadingVisual>
            退出登录
          </ActionList.Item>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  </div>
</template>

<script setup lang="ts">
import { ActionList } from '@/components/primer-vue/ActionList'
import { Avatar } from '@/components/primer-vue/Avatar'
import { ActionMenu } from '@/components/primer-vue/ActionMenu'
import { GearIcon, MarkGithubIcon, PersonIcon, SignOutIcon } from '@onlikee/octicons-vue'
<\/script>

<style scoped>
.user-menu {
  position: absolute;
}

.user-menu-trigger {
  display: inline-flex;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}

.user-menu-trigger:focus-visible {
  outline: 2px solid var(--focus-outlineColor);
  outline-offset: 2px;
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

.user-menu-trigger {
  display: inline-flex;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}

.user-menu-trigger:focus-visible {
  outline: 2px solid var(--focus-outlineColor);
  outline-offset: 2px;
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
