import type { RouteRecordRaw } from 'vue-router'

export const userRoutes: Array<RouteRecordRaw> = [
  {
    path: '/@:nickname([A-Za-z0-9_-]{1,30})',
    name: 'UserProfile',
    component: () => import('../views/user.vue'),
  },
]
