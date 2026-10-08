import type { RouteRecordRaw } from 'vue-router'

export const indexRoutes: Array<RouteRecordRaw> = [
  {
    path: '/',
    alias: '/index',
    name: 'Index',
    component: () => import('../views/index.vue'),
  },
]
