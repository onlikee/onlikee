import type { RouteRecordRaw } from 'vue-router'

export const namecardRoutes: Array<RouteRecordRaw> = [
  {
    path: '/namecard',
    name: 'Namecard',
    component: () => import('../views/namecard.vue'),
  },
]
