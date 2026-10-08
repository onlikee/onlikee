import type { RouteRecordRaw } from 'vue-router'

export const applicationRoutes: Array<RouteRecordRaw> = [
  {
    path: '/application/create',
    name: 'ApplicationCreateMethod',
    component: () => import('../views/application/create.vue'),
  },
  {
    path: '/application/create/new',
    name: 'ApplicationCreateNew',
    component: () => import('../views/application/create/new.vue'),
  },
  {
    path: '/application/create/success',
    name: 'ApplicationCreateSuccess',
    component: () => import('../views/application/create/success.vue'),
  },
  {
    path: '/application/create/connect',
    name: 'ApplicationCreateConnect',
    component: () => import('../views/application/create/connect.vue'),
  },
  {
    path: '/application/create/collect',
    name: 'ApplicationCreateCollect',
    component: () => import('../views/application/create/collect.vue'),
  },
  {
    path: '/application',
    name: 'Application',
    component: () => import('../views/application.vue'),
  },
]
