<template>
  <Container
    max-width="1280px"
  >
    <div
      v-if="profile !== null && profile !== undefined"
      class="layout"
    >
      <div class="left-column">
        <div class="profile">
          <div class="profile-header">
            <Avatar
              class="avatar"
              :src="profile?.avatarUrl"
              :alt="profile?.nickname"
              :size="128"
            />
            <div
              v-if="!profileEditing"
              class="profile-info"
            >
              <div class="name">
                {{ profile?.nickname }}
              </div>
              <div class="username">
                <span>@{{ profile?.nickname }}</span>
                <span v-if="profile?.pronoun"> · {{ profile?.pronoun }}</span>
              </div>
            </div>
          </div>
          <form
            v-if="profileEditing"
            class="profile-edit-form"
            @submit.prevent="saveProfileEdit"
          >
            <FormControl>
              <FormControl.Label>昵称</FormControl.Label>
              <Input
                v-model="profileEditDraft.nickname"
                class="profile-edit-input"
                placeholder="昵称"
                disabled
              />
            </FormControl>
            <FormControl>
              <FormControl.Label>简介</FormControl.Label>
              <Textarea
                v-model="profileEditDraft.bio"
                class="profile-edit-textarea"
                rows="3"
                placeholder="添加简介"
              />
            </FormControl>
            <FormControl>
              <FormControl.Label>称呼</FormControl.Label>
              <Input
                v-model="profileEditDraft.pronoun"
                class="profile-edit-input"
                placeholder="选择一个你喜欢的称谓吧"
              />
            </FormControl>
            <div>
              <div class="profile-icon-input">
                <LocationIcon
                  size="16"
                  color="#5a5a5a"
                  class="input-icon"
                />
                <Input
                  v-model="profileEditDraft.location"
                  class="profile-edit-input"
                  size="small"
                  placeholder="位置"
                />
              </div>
              <div class="profile-icon-input">
                <MailIcon
                  size="16"
                  color="#5a5a5a"
                  class="input-icon"
                />
                <Input
                  v-model="profileEditDraft.email"
                  class="profile-edit-input"
                  size="small"
                  disabled
                />
              </div>
            </div>

            <div>
              <div class="social-header">
                社交账号
              </div>
              <div class="profile-icon-input">
                <LinkIcon
                  size="16"
                  color="#5a5a5a"
                  class="input-icon"
                />
                <Input
                  v-model="profileEditDraft.socialAccount0"
                  class="profile-edit-input"
                  size="small"
                  placeholder="https://github.com/UnderHear"
                />
              </div>
              <div class="profile-icon-input">
                <LinkIcon
                  size="16"
                  color="#5a5a5a"
                  class="input-icon"
                />
                <Input
                  v-model="profileEditDraft.socialAccount1"
                  class="profile-edit-input"
                  size="small"
                  placeholder="https://x.com/github"
                />
              </div>
              <div class="profile-icon-input">
                <LinkIcon
                  size="16"
                  color="#5a5a5a"
                  class="input-icon"
                />
                <Input
                  v-model="profileEditDraft.socialAccount2"
                  class="profile-edit-input"
                  size="small"
                  placeholder="12345678@gmail.com"
                />
              </div>
            </div>
            <div class="profile-edit-actions">
              <Button
                type="submit"
                variant="primary"
                size="small"
                :loading="profileSaving"
              >
                保存
              </Button>
              <Button
                type="button"
                size="small"
                @click="cancelProfileEdit"
              >
                取消
              </Button>
            </div>
          </form>
          <template v-else>
            <p class="bio">
              {{ profile?.bio || '这个用户还没有填写简介。' }}
            </p>
            <Button
              v-if="isOwn"
              class="edit-profile-button"
              @click="openProfileEdit"
            >
              编辑资料
            </Button>
            <div class="links">
              <ul>
                <li v-if="profile?.location">
                  <LocationIcon
                    size="16"
                    color="#5a5a5a"
                  />
                  <span>{{ profile?.location }}</span>
                </li>
                <li v-if="profile?.email">
                  <MailIcon
                    size="16"
                    color="#5a5a5a"
                  />
                  <span>{{ profile?.email }}</span>
                </li>
                <li v-if="profile?.socialAccount0">
                  <LinkIcon
                    size="16"
                    color="#5a5a5a"
                  />
                  <span>{{ profile?.socialAccount0 }}</span>
                </li>
                <li v-if="profile?.socialAccount1">
                  <LinkIcon
                    size="16"
                    color="#5a5a5a"
                  />
                  <span>{{ profile?.socialAccount1 }}</span>
                </li>
                <li v-if="profile?.socialAccount2">
                  <LinkIcon
                    size="16"
                    color="#5a5a5a"
                  />
                  <span>{{ profile?.socialAccount2 }}</span>
                </li>
              </ul>
            </div>
          </template>
        </div>
      </div>
      <div class="right-column">
        <UserApplicationTab
          v-if="activeTab === 'application'"
          :profile="profile"
        />
        <UserProfileTab
          v-else
          :profile="profile"
          :is-own="isOwn"
        />
      </div>
    </div>
  </Container>
  <UserNotFound v-if="profile === null" />
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Avatar } from '@/components/primer-vue/Avatar'
import { Button } from '@/components/primer-vue/Button'
import { Banner } from '@/components/primer-vue/Banner'
import { Container } from '@/components/primer-vue/Container'
import { FormControl } from '@/components/primer-vue/FormControl'
import { Input } from '@/components/primer-vue/Input'
import { Textarea } from '@/components/primer-vue/Textarea'
import { LocationIcon, MailIcon, LinkIcon } from '@/components/octicons-vue3'
import { useUserStore } from '@/stores/user'
import {
  getPublicUserProfile,
  saveCurrentUserProfile,
  type UserProfile
} from '../api/user'
import UserApplicationTab from '../components/application.vue'
import UserProfileTab from '../components/profile.vue'
import { useIsOwn } from '@/composables/useIsOwn'

import UserNotFound from '@/modules/error/views/404-user.vue'

type UserTab = 'profile' | 'application'

const route = useRoute()
const userStore = useUserStore()
const nickname = String(route.params.nickname ?? '')
const profile = ref<UserProfile | null | undefined>(undefined)
const profileEditing = ref(false)
const profileSaving = ref(false)
const profileEditDraft = reactive({
  nickname: '',
  bio: '',
  pronoun: '',
  location: '',
  email: '',
  socialAccount0: '',
  socialAccount1: '',
  socialAccount2: ''
})

const activeTab = computed<UserTab>(() => {
  return route.query.tab === 'application' ? 'application' : 'profile'
})

const isOwn = useIsOwn(profile)

const fillProfileEditDraft = () => {
  if (!profile.value) {
    return
  }

  profileEditDraft.nickname = profile.value.nickname
  profileEditDraft.bio = profile.value.bio ?? ''
  profileEditDraft.pronoun = profile.value.pronoun ?? ''
  profileEditDraft.location = profile.value.location ?? ''
  profileEditDraft.email = profile.value.email
  profileEditDraft.socialAccount0 = profile.value.socialAccount0 ?? ''
  profileEditDraft.socialAccount1 = profile.value.socialAccount1 ?? ''
  profileEditDraft.socialAccount2 = profile.value.socialAccount2 ?? ''
}

const openProfileEdit = () => {
  fillProfileEditDraft()
  profileEditing.value = true
}

const cancelProfileEdit = () => {
  profileEditing.value = false
}

const saveProfileEdit = async () => {
  if (!profile.value || profileSaving.value) {
    return
  }

  profileSaving.value = true
  try {
    const updatedProfile = await saveCurrentUserProfile({
      bio: profileEditDraft.bio,
      pronoun: profileEditDraft.pronoun,
      location: profileEditDraft.location,
      socialAccount0: profileEditDraft.socialAccount0,
      socialAccount1: profileEditDraft.socialAccount1,
      socialAccount2: profileEditDraft.socialAccount2
    })
    profile.value = updatedProfile
    userStore.setUserInfo(updatedProfile)
    profileEditing.value = false
    Banner.success('保存成功。')
  } finally {
    profileSaving.value = false
  }
}

const fetchProfile = async () => {
  try {
    profile.value = await getPublicUserProfile(nickname)
  } catch {
    profile.value = null
  }
}

onMounted(async () => {
  await fetchProfile()
})

</script>

<style scoped>
.layout {
  display: flex;
  gap: 30px;
}

.left-column {
  width: 25%;
  min-width: 200px;
}

.right-column {
  width: 75%;
  min-width: 0;
}

.profile .avatar {
  width: 100% !important;
  height: auto !important;
  aspect-ratio: 1;
  border-radius: 50%;
}

.profile-info {
  padding: 16px 0;
  min-width: 0;
  text-align: left;
}

.name {
  color: var(--fgColor-default);
  font-size: 24px;
  font-weight: 600;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.username {
  color: var(--fgColor-muted);
  font-size: 20px;
  overflow-wrap: anywhere;
  font-weight: 300;
}

.bio {
  margin-bottom: 16px;
  color: var(--fgColor-default);
  font-size: 15px;
  font-weight: 400;
  line-height: 20px;
  overflow-wrap: anywhere;
}

.edit-profile-button {
  margin-bottom: 16px;
  width: 100%;
}

.profile-edit-form {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.profile-icon-input {
  display: flex;
  align-items: center;
  margin-top: 8px;
  gap: 8px;
}

.profile-icon-input .input-icon {
  flex-shrink: 0;
}

.profile-icon-input :deep(.input) {
  box-sizing: border-box;
  flex: 1;
}

.social-header {
  font-size: 14px;
  font-weight: 600;
  color: var(--fgColor-default, #1f2328);
}

.profile-edit-textarea {
  min-height: 88px;
}

.profile-edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.links ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.links li {
  display: flex;
  align-items: flex-start;
  min-width: 0;
  margin-bottom: 8px;
  color: var(--fgColor-default);
  gap: 8px;
  font-size: 14px;
  line-height: 21px;
}

.links li svg {
  flex-shrink: 0;
  transform: translateY(3px);
}

.links li span {
  min-width: 0;
  overflow-wrap: anywhere;
}

@media (max-width: 768px) {
  .layout {
      flex-direction: column;
      gap: 10px;
  }

  .left-column,
  .right-column {
    width: 100%;
  }

  .profile-header {
    margin: 24px 0;
    display: flex;
    align-items: center;
  }

  .profile .avatar {
    width: 66.4px !important;
    height: 66.4px !important;
    margin-right: 16px;
    box-shadow: 0 0 0 1px var(--borderColor-translucent);
    border: 1px solid var(--borderColor-default);
  }

  .profile-info {
    text-align: left;
  }
}
</style>
