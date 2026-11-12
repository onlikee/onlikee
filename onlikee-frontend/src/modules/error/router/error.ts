import type { RouteRecordRaw } from 'vue-router'

export const errorRoutes: Array<RouteRecordRaw> = [
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
  },
  {
    path: '/playground',
    name: 'Playground',
    component: () => import('../views/Playground.vue'),
  },
]
