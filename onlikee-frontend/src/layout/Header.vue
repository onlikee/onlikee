<template>
  <header class="header">
    <div class="header-inner">
      <div class="top-nav-left">
        <IconButton
          :icon="ThreeBarsIcon"
          aria-label="打开菜单"
          aria-haspopup="dialog"
          :aria-expanded="menuDialogOpen"
          @click="menuDialogOpen = true"
        />
        <div class="logo" @click="navigateToPage('/')">
          <LogoOnlikeeIcon size="32" />
          <span>onlikee</span>
        </div>
      </div>

      <div class="top-nav-list">
        <div v-for="item in navigationItems" :key="item.name">
          <div
            :class="['top-nav-link', { active: item.active }]"
            @click="navigateToPage(item.href)"
          >
            {{ item.name }}
          </div>
        </div>
      </div>

      <div class="top-nav-right">
        <div class="user-menu">
          <div v-if="!userStore.userInfo" class="top-nav-link" @click="goToLogin">登录</div>
          <AnchoredOverlay
            v-else
            :open="userMenuOpen"
            :render-anchor="renderUserMenuAnchor"
            width="small"
            align="end"
            :variant="{ regular: 'anchored', narrow: 'fullscreen' }"
            :overlay-props="{ role: 'dialog', 'aria-labelledby': userMenuTitleId }"
            :close-button-props="{ 'aria-label': '关闭账户菜单' }"
            :focus-zone-settings="{ disabled: true }"
            @open="userMenuOpen = true"
            @close="userMenuOpen = false"
          >
            <div class="user-header">
              <VisuallyHidden :id="userMenuTitleId">账户菜单</VisuallyHidden>
              <Avatar :src="userStore.userInfo?.avatarUrl" :size="32" />
              <div class="user-info">
                <div class="user-name" :title="userStore.userInfo?.nickname">
                  {{ userStore.userInfo?.nickname }}
                </div>
                <div class="user-email" :title="userStore.userInfo?.email">
                  {{ userStore.userInfo?.email ?? '暂未设置邮箱' }}
                </div>
              </div>
            </div>
            <div class="user-menu-content">
              <ActionList variant="full">
                <ActionList.Item @select="selectUserMenuItem(goToProfile)">
                  <ActionList.LeadingVisual>
                    <PersonIcon />
                  </ActionList.LeadingVisual>
                  个人资料
                </ActionList.Item>
                <ActionList.Item @select="selectUserMenuItem(() => navigateToPage('/application'))">
                  <ActionList.LeadingVisual>
                    <AppsIcon />
                  </ActionList.LeadingVisual>
                  我的应用
                </ActionList.Item>
                <ActionList.Divider />
                <ActionList.Item @select="selectUserMenuItem(() => navigateToPage('/auth/logout'))">
                  <ActionList.LeadingVisual>
                    <SignOutIcon />
                  </ActionList.LeadingVisual>
                  退出登录
                </ActionList.Item>
              </ActionList>
            </div>
          </AnchoredOverlay>
        </div>
      </div>
    </div>
  </header>
  <Dialog
    v-if="menuDialogOpen"
    :on-close="() => (menuDialogOpen = false)"
    title="菜单"
    position="left"
    width="medium"
    :render-header="renderMenuDialogHeader"
  >
    <Dialog.Body>
      <NavList aria-label="主导航">
        <NavList.Item
          v-for="item in navigationItems"
          :key="item.href"
          :href="item.href"
          :aria-current="item.active ? 'page' : undefined"
          @click="navigateFromMenu($event, item.href)"
        >
          {{ item.name }}
        </NavList.Item>
      </NavList>
    </Dialog.Body>
  </Dialog>
</template>

<script setup lang="ts">
import { h, onMounted, ref, shallowRef, useId, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { AnchoredOverlay, type AnchorRenderProps } from '@/components/primer-vue/AnchoredOverlay'
import { Avatar } from '@/components/primer-vue/Avatar'
import { ActionList } from '@/components/primer-vue/ActionList'
import { Dialog, type DialogHeaderProps } from '@/components/primer-vue/Dialog'
import { NavList } from '@/components/primer-vue/NavList'
import { Stack } from '@/components/primer-vue/Stack'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'
import { PersonIcon, AppsIcon, SignOutIcon, ThreeBarsIcon } from '@onlikee/octicons-vue'
import LogoOnlikeeIcon from '@/components/icons/LogoOnlikeeIcon.vue'
import IconButton from '@/components/primer-vue/Button/IconButton.vue'

interface NavigationItem {
  name: string
  href: string
  active: boolean
}

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const menuDialogOpen = shallowRef(false)
const userMenuOpen = shallowRef(false)
const userMenuTitleId = useId()

const renderUserMenuAnchor = (props: AnchorRenderProps) =>
  h(IconButton, {
    ...props,
    icon: () => h(Avatar, { src: userStore.userInfo?.avatarUrl, size: 32 }),
    variant: 'invisible',
    'aria-label': userMenuOpen.value ? '关闭账户菜单' : '打开账户菜单',
    tooltipDirection: 'sw',
    style: { borderRadius: '50%', outlineOffset: 'var(--base-size-2)' },
  })

const selectUserMenuItem = (action: () => void) => {
  userMenuOpen.value = false
  action()
}

const renderMenuDialogHeader = (props: DialogHeaderProps) =>
  h(
    Stack,
    {
      as: Dialog.Header,
      direction: 'horizontal',
      align: 'center',
      justify: 'space-between',
      padding: 'normal',
      style: { boxShadow: 'none' },
    },
    {
      default: () => [
        h(LogoOnlikeeIcon, { size: 32 }),
        h(VisuallyHidden, { id: props.dialogLabelId }, { default: () => props.title }),
        h(Dialog.CloseButton, { onClose: () => props.onClose('close-button') }),
      ],
    },
  )

// 导航队列，确保导航操作按顺序执行，避免重复点击导致的竞态问题
// 如跳转到登录页后快速返回并切换导航项再次跳转登录会丢失?return_to=...参数
let navigationQueue: Promise<void> = Promise.resolve()

// 队列函数
const enqueueNavigation = (task: () => Promise<void> | void) => {
  navigationQueue = navigationQueue
    .catch(() => undefined)
    .then(async () => {
      await task()
    })

  return navigationQueue
}

const goToLogin = () => {
  //加入队列
  void enqueueNavigation(async () => {
    const returnTo = encodeURIComponent(window.location.href)
    await router.push(`/auth/login?return_to=${returnTo}`)
  })
}

const goToProfile = () => {
  void enqueueNavigation(async () => {
    const nickname = userStore.userInfo?.nickname?.trim()
    if (!nickname) return

    const profilePath = `/@${encodeURIComponent(nickname)}`
    await router.push(profilePath)
  })
}

const navigationItems = ref<NavigationItem[]>([
  { name: '首页', href: '/', active: false },
  { name: '应用', href: '/application', active: false },
  { name: '组件', href: '/component', active: false },
  { name: '名片', href: '/namecard', active: false },
])

const updateActiveState = () => {
  navigationItems.value.forEach((navItem) => {
    navItem.active = navItem.href === route.path
  })
}

const navigateToPage = (href: string) => {
  //加入队列
  void enqueueNavigation(async () => {
    if (route.path === href) return
    await router.push(href)
  })
}

const navigateFromMenu = (event: MouseEvent, href: string) => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  menuDialogOpen.value = false
  navigateToPage(href)
}

onMounted(() => {
  updateActiveState()
})

watch(
  () => route.path,
  () => {
    updateActiveState()
  },
)
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 1;
  width: 100%;
}

.header-inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  background: var(--bgColor-muted);
  box-shadow: inset 0 calc(var(--borderWidth-thin, 1px) * -1) var(--borderColor-default);
}

.top-nav-left {
  justify-self: start;
  padding: 16px;
  display: flex;
  gap: 16px;
}

.logo {
  color: var(--fgColor-default);
  display: flex;
  align-items: center;
  gap: 16px;
  font-weight: var(--base-text-weight-semibold);
  cursor: pointer;
  font-size: var(--text-body-size-large);
}

.top-nav-list {
  display: flex;
  gap: 1rem;
  padding: 16px 0;
}

.top-nav-link {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
  color: var(--fgColor-muted);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.top-nav-link.active {
  background-color: var(--bgColor-neutral-muted);
  color: var(--fgColor-default);
}

.top-nav-link:active {
  background-color: var(--bgColor-neutral-muted);
  color: var(--fgColor-default);
}

@media (hover: hover) and (pointer: fine) {
  .top-nav-link:hover {
    background-color: var(--bgColor-neutral-muted);
    color: var(--fgColor-default);
  }
}

.top-nav-right {
  justify-self: end;
  padding: 16px;
  gap: 16px;
  display: flex;
}

.user-menu {
  display: flex;
  align-items: center;
}

.user-header {
  display: flex;
  align-items: center;
  gap: var(--base-size-8);
  padding: var(--base-size-12) var(--base-size-12) 0;
}

.user-header > img {
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  line-height: 1.25;
}

.user-name,
.user-email {
  overflow: hidden;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-name {
  font-weight: 600;
  color: var(--fgColor-default);
}

.user-email {
  color: var(--fgColor-muted);
}

.user-menu-content {
  padding: var(--base-size-8);
}

@media (max-width: 768px) {
  .header-inner {
    grid-template-columns: auto 1fr auto;
  }

  .top-nav-list {
    display: none;
  }
}
</style>
