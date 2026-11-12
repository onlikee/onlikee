import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const AuthStateGuard =
  (needUser = false): RouteRecordRaw['beforeEnter'] =>
  async (_to, from) => {
    const userStore = useUserStore()

    if (!userStore.isHydrated) {
      await userStore.hydrateUser()
    }

    const hasUser = Boolean(userStore.userInfo)
    return hasUser === needUser ? true : from.fullPath
  }

export const authRoutes: Array<RouteRecordRaw> = [
  {
    path: '/auth/login',
    name: 'Login',
    beforeEnter: AuthStateGuard(false),
    component: () => import('../views/auth/Login.vue'),
  },
  {
    path: '/auth/signup-complete',
    name: 'OAuthSignupComplete',
    beforeEnter: AuthStateGuard(false),
    component: () => import('../views/auth/SignupComplete.vue'),
  },
  {
    path: '/auth/logout',
    name: 'Logout',
    beforeEnter: AuthStateGuard(true),
    component: () => import('../views/auth/Logout.vue'),
  },
]
