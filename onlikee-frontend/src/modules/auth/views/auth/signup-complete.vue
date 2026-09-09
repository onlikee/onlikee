<template>
  <div class="signup-page">
    <form
      class="signup-panel"
      @submit.prevent="submit"
    >
      <div class="signup-header">
        <h1 class="signup-title">
          完善资料
        </h1>
        <p class="signup-subtitle">
          使用 {{ providerLabel }} 账号完成注册
        </p>
      </div>

      <div class="account-card">
        <div class="account-meta">
          <Avatar
            :src="signupContext?.avatarUrl"
            :placeholder="avatarPlaceholder"
            :size="32"
          />

          <div class="account-copy">
            <p class="account-label">
              {{ providerLabel }} 账号
            </p>
            <p class="account-name">
              {{ accountName }}
            </p>
          </div>
        </div>
      </div>

      <div class="signup-fields">
        <FormControl required>
          <FormControl.Label>用户名</FormControl.Label>
          <Input
            v-model="nickname"
            autocomplete="username"
            placeholder="onlikee"
          />
          <FormControl.Validation
            v-if="nicknameError"
            variant="error"
          >
            {{ nicknameError }}
          </FormControl.Validation>
          <FormControl.Caption>
            仅支持字母、数字、下划线和连字符，最长 20 个字符。
          </FormControl.Caption>
        </FormControl>

        <FormControl required>
          <FormControl.Label>邮箱</FormControl.Label>
          <Input
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
          />
          <FormControl.Validation
            v-if="emailError"
            variant="error"
          >
            {{ emailError }}
          </FormControl.Validation>
        </FormControl>
      </div>

      <div class="signup-actions">
        <Button
          type="submit"
          :loading="loading"
          :disabled="!canSubmit"
        >
          完成注册
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { Avatar } from '@/components/primer-vue/Avatar'
import { FormControl } from '@/components/primer-vue/FormControl'
import { Input } from '@/components/primer-vue/Input'
import { Button } from '@/components/primer-vue/Button'
import { Banner } from '@/components/primer-vue/Banner'
import { completeOAuthSignup } from '../../api/login'
import {
  clearOAuthSignupContext,
  loginReturnToKey,
  readOAuthSignupContext,
  type OAuthSignupContext
} from '../../utils/session'

const userStore = useUserStore()
const signupContext = ref<OAuthSignupContext | null>(null)
const nickname = ref('')
const email = ref('')
const loading = ref(false)

const nicknamePattern = /^[A-Za-z0-9_-]{1,20}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const providerLabel = computed(() => {
  if (signupContext.value?.provider === 'github') return 'GitHub'
  if (signupContext.value?.provider === 'gitee') return 'Gitee'
  return 'OAuth'
})

const avatarPlaceholder = computed(() => providerLabel.value.slice(0, 2).toUpperCase())

const accountName = computed(() => {
  return signupContext.value?.suggestedNickname || signupContext.value?.email || `${providerLabel.value} 用户`
})

const nicknameError = computed(() => {
  const value = nickname.value.trim()
  if (!value) return '请输入用户名'
  if (!nicknamePattern.test(value)) return '用户名格式不正确'
  return ''
})

const emailError = computed(() => {
  const value = email.value.trim()
  if (!value) return '请输入邮箱'
  if (value.length > 50 || !emailPattern.test(value)) return '邮箱格式不正确'
  return ''
})

const canSubmit = computed(() => {
  return Boolean(signupContext.value?.pendingSignupToken) && !nicknameError.value && !emailError.value && !loading.value
})

const submit = async () => {
  if (!canSubmit.value || !signupContext.value) {
    Banner.warning('请检查资料后再提交。')
    return
  }
  loading.value = true
  try {
    const response = await completeOAuthSignup({
      pendingSignupToken: signupContext.value.pendingSignupToken,
      nickname: nickname.value.trim(),
      email: email.value.trim()
    })
    userStore.setUserInfo(response.userInfo)
    const returnTo = sessionStorage.getItem(loginReturnToKey) || '/'
    sessionStorage.removeItem(loginReturnToKey)
    clearOAuthSignupContext()
    window.location.href = returnTo
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const context = readOAuthSignupContext()
  if (!context) {
    Banner.warning('注册会话已失效，请重新登录。')
    window.location.href = '/auth/login'
    return
  }
  signupContext.value = context
  nickname.value = context.suggestedNickname ?? ''
  email.value = context.email ?? ''
})
</script>

<style scoped>
.signup-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
}

.signup-panel {
  width: 100%;
  max-width: 24rem;
  background: var(--bgColor-default);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.signup-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.signup-title {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
  color: var(--fgColor-default);
}

.signup-subtitle {
  margin: 0;
  color: var(--fgColor-muted);
  font-size: 14px;
}

.account-card {
  width: 100%;
  padding: 16px;
  border: 1px solid var(--borderColor-default);
  border-radius: 6px;
}

.account-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.account-copy {
  min-width: 0;
}

.account-label,
.account-name {
  margin: 0;
  line-height: 1.3;
}

.account-label {
  font-size: 14px;
  color: var(--fgColor-muted);
}

.account-name {
  overflow: hidden;
  color: var(--fgColor-default);
  font-size: 14px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.signup-fields {
  display: grid;
  gap: 18px;
}

.signup-fields :deep(.input) {
  width: 100%;
}

.signup-actions :deep(.button) {
  width: 100%;
}

@media (max-width: 480px) {
  .signup-panel {
    padding: 24px;
  }
}
</style>
