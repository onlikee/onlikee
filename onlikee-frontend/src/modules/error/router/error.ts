import type { RouteRecordRaw } from 'vue-router'

export const errorRoutes: Array<RouteRecordRaw> = [
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/404.vue'),
  },
  {
    path: '/playground',
    name: 'Playground',
    component: () => import('../views/playground.vue'),
  },
]
